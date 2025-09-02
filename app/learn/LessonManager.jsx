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
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa"; // Import FaTimes for the close button
import styles from "./learn.module.css";

export default function LessonManager({ topic, lessons }) {
  const [user, setUser] = useState(null);
  const [newLesson, setNewLesson] = useState({ title: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "", example: "" });
  const [showModal, setShowModal] = useState(false); // New state for modal visibility

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  // Add lesson
  const handleAdd = async () => {
    if (!newLesson.title) return;
    await addDoc(collection(db, `topics/${topic}/lessons`), newLesson);
    setNewLesson({ title: "", description: "" });
    window.location.reload();
  };

  // Open modal and set initial edit data
  const handleEditClick = (lesson) => {
    setEditing(lesson.id);
    setEditData({
      title: lesson.title,
      description: lesson.description,
      example: lesson.example,
    });
    setShowModal(true); // Open the modal
  };

  // Save edit
  const handleSave = async (lessonId) => {
    const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);
    await updateDoc(lessonRef, editData);
    setEditing(null);
    setShowModal(false); // Close the modal
    window.location.reload();
  };

  // Delete
  const handleDelete = async (lessonId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.");
    if (isConfirmed) {
      try {
        const lessonRef = doc(db, `topics/${topic}/lessons`, lessonId);
        await deleteDoc(lessonRef);
        window.location.reload();
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("An error occurred while deleting the lesson. Please try again.");
      }
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null); // Reset editing state
  };

  // If lessons is empty => show Add form only
  if (lessons.length === 0) {
    return (
      <div className={styles.addLessonForm}>
        <h3>Add New Lesson</h3>
        <input
          type="text"
          placeholder="Lesson Title"
          value={newLesson.title}
          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
        />
        <textarea
          placeholder="Lesson Description"
          value={newLesson.description}
          onChange={(e) =>
            setNewLesson({ ...newLesson, description: e.target.value })
          }
        />
        <button onClick={handleAdd}>Add Lesson</button>
      </div>
    );
  }

  return (
    <>
      {lessons.map((lesson) => (
        <div key={lesson.id} className={styles.lessonAdminActions}>
          <FaEdit
            className={styles.iconBtn}
            onClick={() => handleEditClick(lesson)} // Use the new handler
          />
          <FaTrash
            className={styles.iconBtn}
            onClick={() => handleDelete(lesson.id)}
          />
        </div>
      ))}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={handleCloseModal} className={styles.modalCloseBtn}>
              <FaTimes />
            </button>
            <h2>Edit Lesson</h2>
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            />
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
            <label htmlFor="example">Example:</label>
            <textarea
              id="example"
              value={editData.example}
              onChange={(e) =>
                setEditData({ ...editData, example: e.target.value })
              }
            />
            <button onClick={() => handleSave(editing)}>Save</button>
          </div>
        </div>
      )}
    </>
  );
}