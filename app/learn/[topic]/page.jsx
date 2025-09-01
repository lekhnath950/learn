// app/learn/[topic]/page.js
import Link from "next/link";
import styles from "../learn.module.css";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import SidebarWrapper from "./[title]/SidebarClient";

export const revalidate = 60;

export async function generateStaticParams() {
  const paths = [];
  const topicsCollection = collection(db, "topics");
  const topicsSnapshot = await getDocs(topicsCollection);
  topicsSnapshot.forEach((doc) => {
    paths.push({ topic: doc.id });
  });
  return paths;
}

export default async function TopicPage({ params }) {
  const { topic } = await params; // no need to await here

  // Fetch all topics with lessons
  const topicsSnapshot = await getDocs(collection(db, "topics"));
  const allTopicsData = {};
  for (const topicDoc of topicsSnapshot.docs) {
    const topicId = topicDoc.id;
    const lessonsSnapshot = await getDocs(collection(db, `topics/${topicId}/lessons`));
    allTopicsData[topicId] = {
      id: topicId,
      ...topicDoc.data(),
      levels: lessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  // Fetch current topic data
  const topicDocRef = doc(db, "topics", topic);
  const topicDocSnap = await getDoc(topicDocRef);
  if (!topicDocSnap.exists()) {
    return <p>Topic not found.</p>;
  }
  const topicData = topicDocSnap.data();
  const lessons = allTopicsData[topic]?.levels || [];

  return (
    <div className={styles.learnWrapper}>
      {/* Sidebar */}
      <SidebarWrapper
        topic={topic}
        levels={lessons}
        allTopics={allTopicsData}
      />

      <main className={styles.learnContent}>
        {/* Breadcrumb */}
        <nav className={styles.learnBreadcrumb}>
          <Link href="/learn">Learn</Link>
          <span>›</span>
          <span className={styles.learnCurrentCrumb}>{topicData.title}</span>
        </nav>

        {/* ✅ Show all topics in clickable cards */}
        {/* <div className={styles.topicTitlesContainer}>
          {Object.values(allTopicsData).map((t) => (
            <Link
              key={t.id}
              href={`/learn/${t.id}`}
              className={`${styles.topicTitleAndCount} ${
                t.id === topic ? styles.activeTopic : ""
              }`}
            >
              <h3>{t.title}</h3>
              <p>{t.levels.length} lessons</p>
            </Link>
          ))}
        </div> */}

        {/* Current topic details */}
        <h1>{topicData.title}</h1>
        <p>{topicData.description}</p>

        <div className={styles.learnLessonsGrid}>
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/learn/${topic}/${lesson.id}`}
              className={styles.learnLessonCard}
            >
              <h3>{lesson.title}</h3>
              <p>{lesson.description.substring(0, 100)}...</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
