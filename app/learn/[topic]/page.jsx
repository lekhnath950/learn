// app/learn/[topic]/page.js

import Link from "next/link";
import styles from "../learn.module.css";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import SidebarWrapper from "./[title]/SidebarClient";
import TopicLessons from "@/components/TopicLessons";

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

  // --- START MODIFIED FETCHING LOGIC ---
  const lessonsCollectionRef = collection(db, `topics/${topic}/lessons`);
  const firstBatchQuery = query(
    lessonsCollectionRef,
    orderBy("level", "asc"), // Ensure this matches your API route query
    limit(4)
  );

  const firstBatchSnapshot = await getDocs(firstBatchQuery);
  const initialLessons = firstBatchSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  
  const initialLastLessonId = firstBatchSnapshot.docs.length > 0
    ? firstBatchSnapshot.docs[firstBatchSnapshot.docs.length - 1].id
    : null;

  const hasMore = firstBatchSnapshot.docs.length === 4;
  // --- END MODIFIED FETCHING LOGIC ---
  
  // Fetch current topic data
  const topicDocRef = doc(db, "topics", topic);
  const topicDocSnap = await getDoc(topicDocRef);
  if (!topicDocSnap.exists()) {
    return <p>Topic not found.</p>;
  }
  const topicData = topicDocSnap.data();

  // Fetch all topics with lessons for the sidebar (still needs all of them)
  const allTopicsSnapshot = await getDocs(collection(db, "topics"));
  const allTopicsData = {};
  for (const topicDoc of allTopicsSnapshot.docs) {
    const topicId = topicDoc.id;
    const allLessonsSnapshot = await getDocs(
      collection(db, `topics/${topicId}/lessons`)
    );
    allTopicsData[topicId] = {
      id: topicId,
      ...topicDoc.data(),
      levels: allLessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  return (
    <div className={styles.learnWrapper}>
      <SidebarWrapper topic={topic} levels={initialLessons} allTopics={allTopicsData} />
      <main className={styles.learnContent}>
        <nav className={styles.learnBreadcrumb}>
          <Link href="/learn">Learn</Link>
          <span>›</span>
          <span className={styles.learnCurrentCrumb}>{topicData.title}</span>
        </nav>
        <h1>{topicData.title}</h1>
        <p>{topicData.description}</p>
        
        {/* Pass initial lessons and state to the client component */}
        <TopicLessons 
          topic={topic}
          initialLessons={initialLessons} 
          initialLastLessonId={initialLastLessonId}
          initialHasMore={hasMore}
        />
      </main>
    </div>
  );
}