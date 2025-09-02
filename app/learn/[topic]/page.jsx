import Link from "next/link";
import styles from "../learn.module.css";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import SidebarWrapper from "./[title]/SidebarClient";
import LessonManager from "../LessonManager";


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
  const { topic } = params;

  // Fetch all topics with lessons
  const topicsSnapshot = await getDocs(collection(db, "topics"));
  const allTopicsData = {};
  for (const topicDoc of topicsSnapshot.docs) {
    const topicId = topicDoc.id;
    const lessonsSnapshot = await getDocs(
      collection(db, `topics/${topicId}/lessons`)
    );
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
      <SidebarWrapper topic={topic} levels={lessons} allTopics={allTopicsData} />

      <main className={styles.learnContent}>
        {/* Breadcrumb */}
        <nav className={styles.learnBreadcrumb}>
          <Link href="/learn">Learn</Link>
          <span>›</span>
          <span className={styles.learnCurrentCrumb}>{topicData.title}</span>
        </nav>

        {/* Current topic details */}
        <h1>{topicData.title}</h1>
        <p>{topicData.description}</p>

        <div className={styles.learnLessonsGrid}>
          {lessons.map((lesson) => (
            <div key={lesson.id} className={styles.learnLessonCard}>
              <Link href={`/learn/${topic}/${lesson.id}`}>
                <h3>{lesson.title}</h3>
                <p>{lesson.description.substring(0, 100)}...</p>
              </Link>

              {/* ✅ Inline CRUD controls for this lesson */}
              <LessonManager topic={topic} lessons={[lesson]} example={lesson.example}/>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
