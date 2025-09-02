// components/LessonList.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { collection, query, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "../app/learn/learn.module.css";
// import LessonManager from "../app/learn/LessonManager"


export default function LessonList({ initialLessons, topic, lastDoc }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(lastDoc);

  const fetchMoreLessons = async () => {
    if (!lastVisible) return;

    setLoading(true);
    const lessonsRef = collection(db, `topics/${topic}/lessons`);
    const q = query(lessonsRef, startAfter(lastVisible), limit(2));
    const lessonsSnapshot = await getDocs(q);

    const newLessons = lessonsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setLessons((prevLessons) => [...prevLessons, ...newLessons]);
    setLastVisible(lessonsSnapshot.docs[lessonsSnapshot.docs.length - 1]);
    setLoading(false);
  };

  return (
    <>
      <div className={styles.learnLessonsGrid}>
        {lessons.map((lesson) => (
          <div key={lesson.id} className={styles.learnLessonCard}>
            <Link href={`/learn/${topic}/${lesson.id}`}>
              <h3>{lesson.title}</h3>
              <p>{lesson.description.substring(0, 100)}...</p>
            </Link>
            <LessonManager topic={topic} lessons={[lesson]} example={lesson.example} />
          </div>
        ))}
      </div>

      {lastVisible && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={fetchMoreLessons}
            disabled={loading}
            className={styles.loadMoreBtn}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}