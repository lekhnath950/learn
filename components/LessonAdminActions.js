// components/LessonAdminActions.js

"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, collection, runTransaction, query, orderBy, limit, getDocs } from "firebase/firestore";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "../app/learn/learn.module.css";

// The 'topic' and 'lesson' objects are passed as props from the Server Component
export default function LessonAdminActions({ topic, lesson }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    example: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!user) return null; // Only show for authenticated users

  const handleSave = async () => {
    const lessonRef = doc(db, `topics/${topic}/lessons`, lesson.id);
    await updateDoc(lessonRef, editData);
    setEditing(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    const topicRef = doc(db, "topics", topic);
    const lessonsCollection = collection(db, `topics/${topic}/lessons`);
    const lessonRef = doc(lessonsCollection, lesson.id);

    await runTransaction(db, async (transaction) => {
      const topicSnap = await transaction.get(topicRef);
      if (!topicSnap.exists()) throw new Error("Topic not found");

      const topicData = topicSnap.data();
      const currentFirstLessonId = topicData.firstLessonId;
      const currentLessonCount = topicData.lessonCount || 0;

      if (currentLessonCount <= 0) {
        throw new Error("No lessons to delete");
      }

      let newFirstLessonId = currentFirstLessonId;
      if (currentFirstLessonId === lesson.id && currentLessonCount > 1) {
        const q = query(lessonsCollection, orderBy("level", "asc"), limit(2));
        const snapshot = await getDocs(q);
        const remaining = snapshot.docs.filter((docSnap) => docSnap.id !== lesson.id);
        
        if (remaining.length > 0) {
          newFirstLessonId = remaining[0].id;
        } else {
          newFirstLessonId = null;
        }
      } else if (currentLessonCount === 1) {
        newFirstLessonId = null;
      }

      transaction.delete(lessonRef);
      transaction.update(topicRef, {
        lessonCount: currentLessonCount - 1,
        firstLessonId: newFirstLessonId,
      });
    });

    window.location.reload();
  };

  return (
    <div className={styles.lessonAdminActions}>
      {editing ? (
        <>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
          <textarea
            value={editData.example}
            onChange={(e) => setEditData({ ...editData, example: e.target.value })}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <FaEdit
            className={styles.iconBtn}
            onClick={() => {
              setEditing(true);
              setEditData({
                title: lesson.title,
                description: lesson.description,
                example: lesson.example
              });
            }}
          />
          <FaTrash
            className={styles.iconBtn}
            onClick={handleDelete}
          />
        </>
      )}
    </div>
  );
}