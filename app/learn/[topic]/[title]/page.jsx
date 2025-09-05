import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy,  } from "firebase/firestore";
import styles from "../../learn.module.css";
import { slugify } from "@/utils/slugify";
import SidebarWrapper from "./SidebarClient";
import LessonAdminActions from "@/components/LessonAdminActions";

export const revalidate = 60;

// Required for static export
export async function generateStaticParams() {
  const topicsCollection = collection(db, "topics");
  const topicsSnapshot = await getDocs(topicsCollection);
  const paths = [];

  for (const topicDoc of topicsSnapshot.docs) {
    const topicKey = topicDoc.id;
    const lessonsCollection = collection(db, `topics/${topicKey}/lessons`);
    const lessonsSnapshot = await getDocs(lessonsCollection);

    lessonsSnapshot.forEach((lessonDoc) => {
      paths.push({
        topic: topicKey,
        title: lessonDoc.id,
      });
    });
  }

  return paths;
}

export default async function LessonPage({ params }) {
  const { topic, title } =await  params; // No need to await here anymore

  // Fetch current topic
  const topicDocRef = doc(db, "topics", topic);
  const topicDocSnap = await getDoc(topicDocRef);
  if (!topicDocSnap.exists()) return <p>Topic not found</p>;
  const topicData = topicDocSnap.data();

  // Fetch lessons of current topic
  const lessonsCollectionRef = collection(db, `topics/${topic}/lessons`);
  const lessonsQuery = query(lessonsCollectionRef, orderBy("level", "asc")); // ✅ Sort by level in Firestore
  const lessonsSnapshot = await getDocs(lessonsQuery);
const levels = lessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })); 
  // const levels = lessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.level - b.level);

  // Get current lesson
  const currentDoc = lessonsSnapshot.docs.find((d) => d.id === title);
  if (!currentDoc) return <p>Lesson not found</p>;

  // const current = currentDoc.data();
  // const currentIndex = lessonsSnapshot.docs.findIndex((d) => d.id === title);
  const currentIndex = levels.findIndex((lesson) => lesson.id === title);
const current = levels[currentIndex];

  // Fetch all topics with lessons
  const allTopicsSnapshot = await getDocs(collection(db, "topics"));
  const allTopicsData = {};
  for (const topicDoc of allTopicsSnapshot.docs) {
    const topicKey = topicDoc.id;
    const allLessonsSnapshot = await getDocs(collection(db, `topics/${topicKey}/lessons`));
    allTopicsData[topicKey] = {
      ...topicDoc.data(),
      levels: allLessonsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  return (
    <div className={styles.learnWrapper}>
      <SidebarWrapper
        topic={topic}
        currentTitle={title}
        levels={levels || []}
        allTopics={allTopicsData || {}}
      />
      <main className={styles.content}>
         <LessonAdminActions topic={topic} lesson={{ id: title, ...current }} />
        <nav className={styles.breadcrumb}>
          <Link href="/learn">Learn</Link>
          <span> › </span>
          <Link href={`/learn/${topic}`}>{topicData.title}</Link>
          <span> › </span>
          <span className={styles.currentCrumb}>{current.title}</span>
        </nav>

        <h1>
          {topicData.title} — {current.title}
        </h1>

        <ReactMarkdown>{current.description.replace(/\\n/g, "\n")}</ReactMarkdown>

{current.example && (
  <pre className={styles.codeBlock}>
    <code>{current.example.replace(/\\n/g, "\n")}</code>
  </pre>
)}

        <div className={styles.navButtons}>
          <Link
            href={
              currentIndex > 0
                ? `/learn/${topic}/${lessonsSnapshot.docs[currentIndex - 1].id}`
                : "#"
            }
            className={currentIndex === 0 ? styles.disabled : ""}
          >
            ← Previous
          </Link>

          <Link
            href={
              currentIndex < lessonsSnapshot.docs.length - 1
                ? `/learn/${topic}/${lessonsSnapshot.docs[currentIndex + 1].id}`
                : "#"
            }
            className={currentIndex === lessonsSnapshot.docs.length - 1 ? styles.disabled : ""}
          >
            Next →
          </Link>
        </div>
      </main>
    </div>
  );
}
