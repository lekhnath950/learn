// "use client";
// import { useState, useEffect } from "react";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import styles from "./learn.module.css";

// export default function LessonManager({ topic, lessons }) {
//   const [user, setUser] = useState(null);
//   const [newLesson, setNewLesson] = useState({ title: "", description: "" });
//   const [editing, setEditing] = useState(null);
//   const [editData, setEditData] = useState({ title: "", description: "", example: "" });

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
//     return () => unsubscribe();
//   }, []);

//   if (!user) return null;

//   // Add lesson
//   const handleAdd = async () => {
//     if (!newLesson.title) return;
//     await addDoc(collection(db, `topics/${topic}/lessons`), newLesson);
//     setNewLesson({ title: "", description: "" });
//     window.location.reload();
//   };

//   // Save edit
//   const handleSave = async (lessonId) => {
//     const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);
//     await updateDoc(lessonRef, editData);
//     setEditing(null);
//     window.location.reload();
//   };

//   // Delete
//   const handleDelete = async (lessonId) => {
//     const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);
//     await deleteDoc(lessonRef);
//     window.location.reload();
//   };


//   //show edit/delete for provided lessons
//   return lessons.map((lesson) => (
//     <div key={lesson.id} className={styles.lessonAdminActions}>
//       {editing === lesson.id ? (
//         <>
//           <input
//             type="text"
//             value={editData.title}
//             onChange={(e) => setEditData({ ...editData, title: e.target.value })}
//           />
//           <textarea
//             value={editData.description}
//             onChange={(e) =>
//               setEditData({ ...editData, description: e.target.value })
//             }
//           />
//                     <textarea
//             value={editData.example}
//             onChange={(e) =>
//               setEditData({ ...editData, example: e.target.value })
//             }
//           />
//           <button onClick={() => handleSave(lesson.id)}>Save</button>
//           <button onClick={() => setEditing(null)}>Cancel</button>
//         </>
//       ) : (
//         <>
//           <FaEdit
//             className={styles.iconBtn}
//             onClick={() => {
//               setEditing(lesson.id);
//               setEditData({
//                 title: lesson.title,
//                 description: lesson.description,
//                 example:lesson.example
//               });
//             }}
//           />
//           <FaTrash
//             className={styles.iconBtn}
//             onClick={() => handleDelete(lesson.id)}
//           />
//         </>
//       )}
//     </div>
//   ));
// }


"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  runTransaction,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "./learn.module.css";

export default function LessonManager({ topic, lessons }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    example: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  // 🔹 Save edits to an existing lesson
  const handleSave = async (lessonId) => {
    const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);

    await updateDoc(lessonRef, editData);

    // If the edited lesson was the first lesson, check if we need to update topic's firstLessonId
    const topicRef = doc(db, "topics", topic);
    const currentTopicDoc = lessons.find((l) => l.id === lessonId);

    // If it's the same lesson ID, we don't need to fetch all lessons, just update data
    if (currentTopicDoc.id === lessonId) {
      await updateDoc(topicRef, {
        firstLessonId: lessonId
      });
    }

    setEditing(null);
    window.location.reload();
  };

  // 🔹 Delete a lesson
  // const handleDelete = async (lessonId) => {
  //   const topicRef = doc(db, "topics", topic);

  //   await runTransaction(db, async (transaction) => {
  //     const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);

  //     // Delete lesson
  //     transaction.delete(lessonRef);

  //     // Get the current topic
  //     const topicSnap = await transaction.get(topicRef);
  //     if (!topicSnap.exists()) throw new Error("Topic not found");

  //     const topicData = topicSnap.data();

  //     let newLessonCount = (topicData.lessonCount || 1) - 1;

  //     let updateData = {
  //       lessonCount: newLessonCount
  //     };

  //     // If the deleted lesson was the firstLessonId
  //     if (topicData.firstLessonId === lessonId && newLessonCount > 0) {
  //       // Find the new first lesson with the lowest level using a single query
  //       const q = query(
  //         collection(db, `topics/${topic}/lessons`),
  //         orderBy("level", "asc"),
  //         limit(1)
  //       );
  //       const snapshot = await getDocs(q);
  //       if (!snapshot.empty) {
  //         updateData.firstLessonId = snapshot.docs[0].id;
  //       } else {
  //         updateData.firstLessonId = null; // no lessons left
  //       }
  //     } else if (newLessonCount === 0) {
  //       updateData.firstLessonId = null; // no lessons left
  //     }

  //     transaction.update(topicRef, updateData);
  //   });

  //   window.location.reload();
  // };

  const handleDelete = async (lessonId) => {
  const topicRef = doc(db, "topics", topic);
  const lessonsCollection = collection(db, `topics/${topic}/lessons`);
  const lessonRef = doc(lessonsCollection, lessonId);

  await runTransaction(db, async (transaction) => {
    // STEP 1: Read the topic document first
    const topicSnap = await transaction.get(topicRef);
    if (!topicSnap.exists()) throw new Error("Topic not found");

    const topicData = topicSnap.data();
    const currentFirstLessonId = topicData.firstLessonId;
    const currentLessonCount = topicData.lessonCount || 0;

    if (currentLessonCount <= 0) {
      throw new Error("No lessons to delete");
    }

    let newFirstLessonId = currentFirstLessonId;

    // STEP 2: If deleting the current first lesson, find the new first lesson
    if (currentFirstLessonId === lessonId && currentLessonCount > 1) {
      // Query ONLY the next lesson with the lowest level
      const q = query(lessonsCollection, orderBy("level", "asc"), limit(2));
      const snapshot = await getDocs(q);

      // We'll find the first lesson that's NOT the one being deleted
      const remaining = snapshot.docs.filter((docSnap) => docSnap.id !== lessonId);

      if (remaining.length > 0) {
        newFirstLessonId = remaining[0].id;
      } else {
        newFirstLessonId = null;
      }
    } else if (currentLessonCount === 1) {
      // If this was the only lesson
      newFirstLessonId = null;
    }

    // ✅ ALL READS COMPLETE, now we can perform writes

    // STEP 3: Delete the lesson
    transaction.delete(lessonRef);

    // STEP 4: Update the topic document
    transaction.update(topicRef, {
      lessonCount: currentLessonCount - 1,
      firstLessonId: newFirstLessonId,
    });
  });

  window.location.reload();
};


  return lessons.map((lesson) => (
    <div key={lesson.id} className={styles.lessonAdminActions}>
      {editing === lesson.id ? (
        <>
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
          />
          <textarea
            value={editData.example}
            onChange={(e) =>
              setEditData({ ...editData, example: e.target.value })
            }
          />
          <button onClick={() => handleSave(lesson.id)}>Save</button>
          <button onClick={() => setEditing(null)}>Cancel</button>
        </>
      ) : (
        <>
          <FaEdit
            className={styles.iconBtn}
            onClick={() => {
              setEditing(lesson.id);
              setEditData({
                title: lesson.title,
                description: lesson.description,
                example: lesson.example
              });
            }}
          />
          <FaTrash
            className={styles.iconBtn}
            onClick={() => handleDelete(lesson.id)}
          />
        </>
      )}
    </div>
  ));
}
