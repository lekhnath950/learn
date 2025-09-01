// // app/learn/page.jsx

// import Link from "next/link";
// import styles from "./learn.module.css";
// import { db } from "@/lib/firebase";
// import { collection, getDocs } from "firebase/firestore";

// export const revalidate = 60;

// export default async function LearnPage() {
//   // Fetch topics
//   const topicsSnapshot = await getDocs(collection(db, "topics"));

//   const topicsData = await Promise.all(
//     topicsSnapshot.docs.map(async (topicDoc) => {
//       const topicId = topicDoc.id;
//       const topicData = topicDoc.data();

//       // Fetch lessons for this topic
//       const lessonsSnapshot = await getDocs(
//         collection(db, `topics/${topicId}/lessons`)
//       );

//       const lessons = lessonsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       return {
//         id: topicId,
//         ...topicData,
//         lessons,
//       };
//     })
//   );

//   // 🔑 Group by topicId (slug)
//   const mergedTopics = Object.values(
//     topicsData.reduce((acc, topic) => {
//       if (!acc[topic.id]) {
//         acc[topic.id] = { ...topic, lessons: [] };
//       }
//       acc[topic.id].lessons.push(...topic.lessons);
//       return acc;
//     }, {})
//   );

//   return (
//     <div className={styles.learnPage}>
//       <h1>Learn to Code</h1>
//       <p>Explore our structured learning paths and start your coding journey today.</p>

//       <div className={styles.topicGrid}>
//         {mergedTopics.map((topic) => (
//           <Link
//             key={topic.id}
//             href={`/learn/${topic.id}/${topic.lessons[0]?.id || ""}`}
//             className={styles.topicCard}
//           >
//             <h2>{topic.title}</h2>
//             <p>{topic.description}</p>
//             <p>
//               <strong>{topic.lessons.length}</strong> lessons
//             </p>
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

export const revalidate = 60;

export default async function LearnPage() {
  const topicsCollection = collection(db, "topics");
  const topicsSnapshot = await getDocs(topicsCollection);

  const topicsData = await Promise.all(
    topicsSnapshot.docs.map(async (topicDoc) => {
      const topicKey = topicDoc.id;
      const lessonsCollection = collection(db, `topics/${topicKey}/lessons`);
      const lessonsSnapshot = await getDocs(lessonsCollection);

      return {
        id: topicDoc.id,
        ...topicDoc.data(),
        lessonCount: lessonsSnapshot.size, // ✅ only count lessons
      };
    })
  );

  return (
    <div className={styles.learnPage}>
      <h1>Learn to Code</h1>
      <p>Explore our structured learning paths and start your coding journey today.</p>

      <div className={styles.topicGrid}>
        {topicsData.map((topic) => (
          <Link
            key={topic.id}
            href={`/learn/${topic.id}`} // ✅ links only to the topic page
            className={styles.topicCard}
          >
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <small>{topic.lessonCount} lessons</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
