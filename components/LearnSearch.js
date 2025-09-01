// components/LearnSearch.js
"use client";
import { useState } from "react";
import Link from "next/link";
import learnData from "../lib/learn.json";
import { slugify } from "@/utils/slugify";
import styles from "../app/learn/learn.module.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const lessons = Object.entries(learnData).flatMap(([key, val]) =>
    val.levels.map((lvl) => ({
      topicKey: key,
      topicTitle: val.title,
      lessonTitle: lvl.title,
      level: lvl.level,
    }))
  );

  const filtered = lessons.filter(
    (lesson) =>
      lesson.topicTitle.toLowerCase().includes(query.toLowerCase()) ||
      lesson.lessonTitle.toLowerCase().includes(query.toLowerCase())
  );

  if (!query) return null; // don't show anything if no search

  return (
    <div className={styles.resultList}>
      <input
        type="text"
        placeholder="Search topics or lessons..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchBox}
      />

      {filtered.length > 0 ? (
        filtered.map((lesson, i) => (
          <Link
            key={i}
            href={`/learn/${lesson.topicKey}/${slugify(lesson.lessonTitle)}`}
            className={styles.resultItem}
          >
            <strong>{lesson.lessonTitle}</strong>
            <span>
              ({lesson.topicTitle} - Level {lesson.level})
            </span>
          </Link>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}
