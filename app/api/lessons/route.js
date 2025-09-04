// app/api/lessons/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, limit, getDocs, startAfter, orderBy, doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  const { topic, lastLessonId } = await request.json();

  if (!topic || !lastLessonId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    const lessonsCollectionRef = collection(db, `topics/${topic}/lessons`);
    const lastLessonDocRef = doc(lessonsCollectionRef, lastLessonId);

    // ✅ NEW: Fetch the snapshot and check if it exists
    const lastLessonDocSnapshot = await getDoc(lastLessonDocRef);
    if (!lastLessonDocSnapshot.exists()) {
      console.error(`Document with ID ${lastLessonId} not found.`);
      // Return an empty array to gracefully end pagination
      return NextResponse.json({
        lessons: [],
        lastLessonId: null,
        hasMore: false,
      });
    }

    const q = query(
      lessonsCollectionRef,
      orderBy("level", "asc"),
      startAfter(lastLessonDocSnapshot),
      limit(4)
    );

    const lessonsSnapshot = await getDocs(q);
    const lessons = lessonsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const newLastLessonId = lessonsSnapshot.docs.length > 0 ? lessons[lessons.length - 1].id : null;

    return NextResponse.json({
      lessons,
      lastLessonId: newLastLessonId,
      hasMore: lessons.length === 4
    });

  } catch (error) {
    console.error("Error fetching more lessons:", error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}