// app/api/lessons/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  limit,
  getDocs,
  startAfter,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

export async function POST(request) {
  try {
    const payload = await request.json();
    const { topic, lastLessonId } = payload || {};

    if (!topic) {
      return NextResponse.json(
        { error: "Missing required parameter: topic" },
        { status: 400 }
      );
    }

    const lessonsCollectionRef = collection(db, `topics/${topic}/lessons`);
    const PAGE_SIZE = 4;

    let q;
    // If lastLessonId is provided (truthy), use startAfter for pagination.
    if (lastLessonId) {
      const lastLessonDocRef = doc(lessonsCollectionRef, lastLessonId);
      const lastLessonDocSnapshot = await getDoc(lastLessonDocRef);

      // If last doc doesn't exist, return empty results (graceful end)
      if (!lastLessonDocSnapshot.exists()) {
        console.warn(`Last lesson id ${lastLessonId} not found for topic ${topic}`);
        return NextResponse.json({
          lessons: [],
          lastLessonId: null,
          hasMore: false,
        });
      }

      q = query(
        lessonsCollectionRef,
        orderBy("level", "asc"),
        startAfter(lastLessonDocSnapshot),
        limit(PAGE_SIZE)
      );
    } else {
      // Initial page: no startAfter
      q = query(lessonsCollectionRef, orderBy("level", "asc"), limit(PAGE_SIZE));
    }

    const lessonsSnapshot = await getDocs(q);
    const lessons = lessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const newLastLessonId =
      lessonsSnapshot.docs.length > 0 ? lessonsSnapshot.docs[lessonsSnapshot.docs.length - 1].id : null;

    return NextResponse.json({
      lessons,
      lastLessonId: newLastLessonId,
      hasMore: lessons.length === PAGE_SIZE,
    });
  } catch (error) {
    console.error("Error in /api/lessons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
