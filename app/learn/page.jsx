// // app/learn/page.jsx
// import Link from "next/link";
// import styles from "./learn.module.css";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, query, limit } from "firebase/firestore";

// export const revalidate = 60;

// export default async function LearnPage() {
//   const topicsCollection = collection(db, "topics");
//   const topicsSnapshot = await getDocs(topicsCollection);

//   const topicsData = await Promise.all(
//     topicsSnapshot.docs.map(async (topicDoc) => {
//       const topicId = topicDoc.id;
//       const topicData = topicDoc.data();

//       // ✅ Fetch only the first lesson
//       const lessonsCollection = collection(db, `topics/${topicId}/lessons`);
//       const firstLessonQuery = query(lessonsCollection, limit(100));
//       const lessonsSnapshot = await getDocs(firstLessonQuery);
//       const firstLesson = lessonsSnapshot.docs[0];

//       return {
//         id: topicId,
//         ...topicData,
//         firstLessonId: firstLesson ? firstLesson.id : null,
//         lessonCount: lessonsSnapshot.size,
//       };
//     })
//   );

//   return (
//     <div className={styles.learnPage}>
//       <h1>Learn to Code</h1>
//       <p>Explore our structured learning paths and start your coding journey today.</p>

//       <div className={styles.topicGrid}>
//         {topicsData.map((topic) => (
//           <Link
//             key={topic.id}
//             href={topic.firstLessonId ? `/learn/${topic.id}/${topic.firstLessonId}` : `/learn/${topic.id}`}
//             className={styles.topicCard}
//           >
//             <h2>{topic.title}</h2>
//             <p>{topic.description}</p>
//             <small>{topic.lessonCount} lessons</small>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }


// app/learn/page.jsx
import Link from "next/link";
import styles from "./learn.module.css";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Revalidate this page every 60 seconds to fetch new data
export const revalidate = 60;

export default async function LearnPage() {
  // Get a reference to the 'topics' collection
  const topicsCollection = collection(db, "topics");

  // Fetch all documents from the 'topics' collection in a single database read
  const topicsSnapshot = await getDocs(topicsCollection);

  // Map the snapshot documents to a clean data array
  const topicsData = topicsSnapshot.docs.map((topicDoc) => {
    // Each topic document now contains the lessonCount and firstLessonId
    return {
      id: topicDoc.id,
      ...topicDoc.data(),
    };
  });

  return (
    <div className={styles.learnPage}>
      <h1>Learn to Code</h1>
      <p>Explore our structured learning paths and start your coding journey today.</p>

      <div className={styles.topicGrid}>
        {topicsData.map((topic) => (
          <Link
            key={topic.id}
            // Navigate to the first lesson if it exists, otherwise to the topic base
            href={topic.firstLessonId ? `/learn/${topic.id}/${topic.firstLessonId}` : `/learn/${topic.id}`}
            className={styles.topicCard}
          >
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            {/* Display the correct lesson count from the topic document */}
            <small>{topic.lessonCount} lessons</small>
          </Link>
        ))}
      </div>
    </div>
  );
}