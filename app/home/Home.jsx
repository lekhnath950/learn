
"use client";

import { useState, useRef } from "react";
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
  const inputRef = useRef(null);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Fetch lessons only when search button is clicked
  const fetchLessons = async () => {
    if (query.trim().length === 0) {
      setLessons([]);
      setSearchTriggered(false); // reset state when input is empty
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearchTriggered(true); // User clicked search

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch lessons");
      }

      setLessons(data.lessons);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1>Learn by Khelira</h1>
            <p>Your modern platform to master web development — from HTML basics to advanced frameworks.</p>

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

      {/* SEARCH BAR */}
      <div className={styles.searchWrapper}>
        <FaSearch className={styles.searchIcon} aria-hidden="true" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={loading ? "Searching..." : "Search lessons..."}
          className={styles.searchInput}
          disabled={loading}
        />

        {/* Search button */}
        <button
          className={styles.searchButton}
          onClick={fetchLessons}
          disabled={loading}
        >
          Search
        </button>

        {/* Search results */}
        <div
          className={`${styles.searchResults} ${
           query.trim().length && (loading || searchTriggered) ? styles.open : ""
          }`}
        >
          {error && <div className={styles.searchStatus}>{error}</div>}

          {!error && !searchTriggered  &&  query.trim().length === 0 && (
            <div className={styles.searchStatus}>Type a query and click search…</div>
          )}

            {/* Show loading state */}
  {loading && (
    <div className={styles.searchStatus}>Searching...</div>
  )}

          {!error  && searchTriggered && query.trim().length > 0 && lessons.length === 0 && !loading && (
            <div className={styles.searchStatus}>No results found</div>
          )}

          {!error &&
            lessons.map((lesson) => (
<a
        key={lesson.id}
        href={`/learn/${lesson.topic}/${lesson.id}`}
        className={styles.searchResultItem}
        onClick={() => {
          setQuery("");
          setSearchTriggered(false); // reset on navigation
        }}
      >
                <div className={styles.resultMain}>
                  <span className={styles.resultLesson}>{lesson.title}</span>
                  {lesson.level && (
                    <span className={styles.levelBadge}>Level {lesson.level}</span>
                  )}
                </div>
              </a>
            ))}
        </div>
      </div>

      {/* POPULAR COURSES */}
      <section className={styles.cards} aria-label="Popular Courses">
        <h2 className={styles.sectionTitle}>Popular Courses</h2>
        <div className={styles.grid}>
          <article className={styles.card}>
            <FaCode className={styles.cardIcon} />
            <h3>HTML & CSS</h3>
            <p>Build beautiful, responsive websites with the foundation of the web.</p>
            <Link href="/learn/html" className={styles.cardLink}>
              Start Learning →
            </Link>
          </article>

          <article className={styles.card}>
            <FaLaptopCode className={styles.cardIcon} />
            <h3>JavaScript</h3>
            <p>Learn the language of the web to create interactive experiences.</p>
            <Link href="/learn/javascript" className={styles.cardLink}>
              Explore JavaScript →
            </Link>
          </article>

          <article className={styles.card}>
            <FaLayerGroup className={styles.cardIcon} />
            <h3>Frontend Frameworks</h3>
            <p>Master React, Next.js, and other modern frontend frameworks.</p>
            <Link href="/learn/reactjs" className={styles.cardLink}>
              Dive In →
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
