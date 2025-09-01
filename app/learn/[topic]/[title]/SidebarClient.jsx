"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "../../learn.module.css";

export function SidebarContent({ topic, currentTitle, levels, allTopics }) {
  const [query, setQuery] = useState("");

  // Flatten all lessons for search
  const allLessons = useMemo(() => {
    if (!allTopics) return [];
    return Object.entries(allTopics).flatMap(([topicKey, topicData]) =>
      (topicData.levels || []).map((lvl) => ({
        topicKey,
        topicTitle: topicData.title,
        lessonTitle: lvl.title,
        lessonId: lvl.id, // use real Firebase id
      }))
    );
  }, [allTopics]);

  const filtered = useMemo(
    () =>
      allLessons.filter(
        (lesson) =>
          lesson.topicTitle.toLowerCase().includes(query.toLowerCase()) ||
          lesson.lessonTitle.toLowerCase().includes(query.toLowerCase())
      ),
    [query, allLessons]
  );

  return (
    <>
      <Link href="/learn" className={styles.allTopicsBtn}>
        ← All Topics
      </Link>

      <input
        type="text"
        placeholder="Search lessons..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />

      {query === "" ? (
        <>
          {/* Current Topic */}
          {topic && allTopics && allTopics[topic] && (
            <div className={styles.currentTopic}>
              <h3>{allTopics[topic].title}</h3>
              <ul>
                {(levels || []).map((lvl) => (
                  <li key={lvl.id}>
                    <Link
                      href={`/learn/${topic}/${lvl.id}`}
                      className={lvl.id === currentTitle ? styles.activeLesson : ""}
                    >
                      {lvl.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Other Topics */}
          {allTopics && (
            <div className={styles.otherTopics}>
              <h4>Other Topics</h4>
              <ul>
                {Object.entries(allTopics)
                  .filter(([key]) => key !== topic)
                  .map(([key, val]) => {
                    const firstLessonId = val.levels?.[0]?.id;
                    return (
                      <li key={key}>
                        {firstLessonId ? (
                          <Link href={`/learn/${key}/${firstLessonId}`}>
                            {val.title} ({val.levels.length} lessons)
                          </Link>
                        ) : (
                          <span>{val.title}</span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className={styles.resultList}>
          {filtered.length > 0 ? (
            filtered.map((lesson) => (
              <Link
                key={`${lesson.topicKey}-${lesson.lessonId}`}
                href={`/learn/${lesson.topicKey}/${lesson.lessonId}`}
                className={styles.resultItem}
              >
                <strong>{lesson.lessonTitle}</strong>
                <span>({lesson.topicTitle})</span>
              </Link>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>
      )}
    </>
  );
}

export default function SidebarWrapper({ topic, currentTitle, levels, allTopics }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <button
        className={styles.toggleSidebarBtn}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "Hide Menu" : "Show Menu"}
      </button>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <SidebarContent
          topic={topic}
          currentTitle={currentTitle}
          levels={levels}
          allTopics={allTopics}
        />
      </aside>
    </>
  );
}
