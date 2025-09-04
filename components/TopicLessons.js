// components/TopicLessons.js

"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "../app/learn/learn.module.css";

export default function TopicLessons({ topic, initialLessons, initialLastLessonId, initialHasMore }) {
  const [lessons, setLessons] = useState(initialLessons);
  const [lastLessonId, setLastLessonId] = useState(initialLastLessonId);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, lastLessonId }),
      });

      const data = await response.json();

      if (data.lessons) {
        setLessons((prevLessons) => [...prevLessons, ...data.lessons]);
        setLastLessonId(data.lastLessonId);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch more lessons:", error);
    } finally {
      setLoading(false);
    }
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
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button onClick={handleLoadMore} className={styles.loadMoreButton} disabled={loading}>
            {loading ? "Loading..." : "Load More Lessons"}
          </button>
        </div>
      )}
    </>
  );
}