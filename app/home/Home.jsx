"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import "../../styles/globals.css";
import { FaLaptopCode, FaBookOpenReader, FaCode, FaLayerGroup } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import SEO from "../../components/SEO";

export default function Home() {
  const [query, setQuery] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [lastLessonId, setLastLessonId] = useState(null);
  const inputRef = useRef(null);

  // ✅ Fetch lessons from API route
  const fetchLessons = async (searchQuery, reset = false) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "html", // ✅ Example topic, make dynamic if needed
          lastLessonId: reset ? "" : lastLessonId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch lessons");
      }

      // Merge lessons
      setLessons((prev) => (reset ? data.lessons : [...prev, ...data.lessons]));
      setLastLessonId(data.lastLessonId);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch on initial load
  useEffect(() => {
    fetchLessons("", true);
  }, []);

  // 🔹 Filter lessons client-side
  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return lessons.filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
  }, [query, lessons]);

  return (
    <>
      <SEO
        jsonld={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Learn by Khelira",
          "url": "https://learn.khelira.com/learn",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://khelira.com/learn/search?q={query}",
            "query-input": "required name=query",
          },
        }}
      />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1>Learn by Khelira</h1>
            <p>Your modern platform to master web development — from HTML basics to advanced frameworks.</p>

            {/* SEARCH BAR */}
            <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={loading ? "Loading lessons..." : "Search lessons..."}
                className={styles.searchInput}
                disabled={loading}
              />

              <div
                className={`${styles.searchResults} ${
                  query.trim().length ? styles.open : ""
                }`}
              >
                {error && <div className={styles.searchStatus}>{error}</div>}
                {!error && query.trim().length === 0 && (
                  <div className={styles.searchStatus}>Type to search lessons…</div>
                )}

                {!error && query.trim().length > 0 && filteredLessons.length === 0 && (
                  <div className={styles.searchStatus}>No results found</div>
                )}

                {!error &&
                  filteredLessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/html/${lesson.id}`}
                      className={styles.searchResultItem}
                      onClick={() => setQuery("")}
                    >
                      <div className={styles.resultMain}>
                        <span className={styles.resultLesson}>{lesson.title}</span>
                        {lesson.level && (
                          <span className={styles.levelBadge}>Level {lesson.level}</span>
                        )}
                      </div>
                      {/* <div className={styles.resultMeta}>
                        {lesson.description || "No description"}
                      </div> */}
                    </Link>
                  ))}
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link className="btn btn-accent" href="/learn/">
                Browse Courses <FaBookOpenReader />
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <div className={styles.heroGlow}></div>
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className={styles.cards} aria-label="Popular Courses">
        <h2 className={styles.sectionTitle}>Popular Courses</h2>
        <div className={styles.grid}>
          <article className={styles.card}>
            <FaCode className={styles.cardIcon} />
            <h3>HTML & CSS</h3>
            <p>Build beautiful, responsive websites with the foundation of the web.</p>
            <Link href="/learn/html" className={styles.cardLink}>Start Learning →</Link>
          </article>

          <article className={styles.card}>
            <FaLaptopCode className={styles.cardIcon} />
            <h3>JavaScript</h3>
            <p>Learn the language of the web to create interactive experiences.</p>
            <Link href="/learn/javascript" className={styles.cardLink}>Explore JavaScript →</Link>
          </article>

          <article className={styles.card}>
            <FaLayerGroup className={styles.cardIcon} />
            <h3>Frontend Frameworks</h3>
            <p>Master React, Next.js, and other modern frontend frameworks.</p>
            <Link href="/learn/reactjs" className={styles.cardLink}>Dive In →</Link>
          </article>
        </div>
      </section>

      {/* Load More Button */}
      {/* {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            onClick={() => fetchLessons(query, false)}
            className={styles.loadMoreBtn}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )} */}
    </>
  );
}
