// // components/UploadLesson.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { db } from '@/lib/firebase';
// import { collection, doc, setDoc, getCountFromServer } from 'firebase/firestore'; 
// import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { slugify } from '@/utils/slugify';
// import styles from './upload.module.css';

// const UploadLesson = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [topic, setTopic] = useState('');
//   const [topicTitle, setTopicTitle] = useState('');
//   const [topicDescription, setTopicDescription] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [example, setExample] = useState('');
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMessage('Logging in...');
//     const auth = getAuth();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       setMessage('Logged in successfully!');
//     } catch (error) {
//       console.error("Login error: ", error);
//       switch (error.code) {
//         case 'auth/invalid-credential':
//           setMessage('Incorrect email or password. Please try again.');
//           break;
//         case 'auth/invalid-email':
//           setMessage('The email address is not valid.');
//           break;
//         case 'auth/user-disabled':
//           setMessage('This account has been disabled.');
//           break;
//         default:
//           setMessage(`Login failed: ${error.message}`);
//       }
//     }
//   };

//   const handleLogout = async () => {
//     const auth = getAuth();
//     try {
//       await signOut(auth);
//       setMessage('Logged out.');
//     } catch (error) {
//       console.error("Logout error: ", error);
//       setMessage(`Logout failed: ${error.message}`);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!user) {
//       setMessage('You must be logged in to upload content.');
//       return;
//     }
//     setMessage('Uploading...');
//     const topicSlug = slugify(topic);
//     const lessonSlug = slugify(title);

//     try {
//       const lessonsCollectionRef = collection(db, 'topics', topicSlug, 'lessons');
//       const snapshot = await getCountFromServer(lessonsCollectionRef);
//       const nextLevel = snapshot.data().count + 1;

//       await Promise.all([
//         setDoc(doc(db, 'topics', topicSlug), {
//           title: topicTitle,
//           description: topicDescription,
//         }, { merge: true }),
//         setDoc(doc(db, 'topics', topicSlug, 'lessons', lessonSlug), {
//           level: nextLevel,
//           title,
//           description,
//           example: example || null,
//         })
//       ]);

//       setMessage('Lesson and Topic uploaded successfully!');
//       setTopic('');
//       setTopicTitle('');
//       setTopicDescription('');
//       setTitle('');
//       setDescription('');
//       setExample('');
//     } catch (error) {
//       console.error("Error uploading document: ", error);
//       setMessage('Error uploading content. Please try again.');
//     }
//   };

//   if (loading) {
//     return <div className={styles['auth-loading']}>Checking authentication status...</div>;
//   }

//   if (!user) {
//     return (
//       <div className={styles['auth-card']}>
//         <h2 className={styles['auth-title']}>Admin Login</h2>
//         <form onSubmit={handleLogin} className={styles['auth-form']}>
//           <div className={styles['auth-field']}>
//             <label>Email:</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className={styles['auth-field']}>
//             <label>Password:</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className={styles['auth-button']}>Log In</button>
//           {message && <p className={styles['auth-message']}>{message}</p>}
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className={styles['auth-card']}>
//       <div className={styles['auth-header']}>
//         <h2 className={styles['auth-title']}>Upload a New Lesson & Topic</h2>
//         <button onClick={handleLogout} className={styles['auth-logout']}>Log Out</button>
//       </div>
//       <form onSubmit={handleSubmit} className={styles['auth-form']}>
//         <div className={styles['auth-field']}>
//           <label>Topic Slug (e.g., html, css):</label>
//           <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
//         </div>
//         <div className={styles['auth-field']}>
//           <label>Topic Title:</label>
//           <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required />
//         </div>
//         <div className={styles['auth-field']}>
//           <label>Topic description:</label>
//           <textarea value={topicDescription} onChange={(e) => setTopicDescription(e.target.value)} required />
//         </div>
//         <hr className={styles['auth-divider']} />
//         <h3>Lesson Details</h3>
//         <div className={styles['auth-field']}>
//           <label>Lesson Title:</label>
//           <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
//         </div>
//         <div className={styles['auth-field']}>
//           <label>Description (Markdown):</label>
//           <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
//         </div>
//         <div className={styles['auth-field']}>
//           <label>Example Code Block:</label>
//           <textarea value={example} onChange={(e) => setExample(e.target.value)} />
//         </div>
//         <button type="submit" className={styles['auth-button']}>Upload Content</button>
//         {message && <p className={styles['auth-message-success']}>{message}</p>}
//       </form>
//     </div>
//   );
// };

// export default UploadLesson;


'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getCountFromServer,
  getDoc,
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { slugify } from '@/utils/slugify';
import styles from './upload.module.css';

const UploadLesson = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [topic, setTopic] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicExists, setTopicExists] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [example, setExample] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔎 Check if topic exists whenever user types
  useEffect(() => {
    if (!topic) return;
    const checkTopic = async () => {
      const topicSlug = slugify(topic);
      const topicRef = doc(db, 'topics', topicSlug);
      const snap = await getDoc(topicRef);
      if (snap.exists()) {
        setTopicExists(true);
        const data = snap.data();
        setTopicTitle(data.title || '');
        setTopicDescription(data.description || '');
      } else {
        setTopicExists(false);
        setTopicTitle('');
        setTopicDescription('');
      }
    };
    checkTopic();
  }, [topic]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Logged in successfully!');
    } catch (error) {
      console.error('Login error: ', error);
      switch (error.code) {
        case 'auth/invalid-credential':
          setMessage('Incorrect email or password. Please try again.');
          break;
        default:
          setMessage(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setMessage('Logged out.');
    } catch (error) {
      console.error('Logout error: ', error);
      setMessage(`Logout failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('You must be logged in to upload content.');
      return;
    }
    setMessage('Uploading...');
    const topicSlug = slugify(topic);
    const lessonSlug = slugify(title);

    try {
      // Count lessons for ordering
      const lessonsCollectionRef = collection(db, 'topics', topicSlug, 'lessons');
      const snapshot = await getCountFromServer(lessonsCollectionRef);
      const nextLevel = snapshot.data().count + 1;

      // If topic does not exist → create it
      if (!topicExists) {
        await setDoc(doc(db, 'topics', topicSlug), {
          title: topicTitle,
          description: topicDescription,
        });
      }

      // Always create the lesson
      await setDoc(doc(db, 'topics', topicSlug, 'lessons', lessonSlug), {
        level: nextLevel,
        title,
        description,
        example: example || null,
      });

      setMessage('✅ Lesson uploaded successfully!');
      setTitle('');
      setDescription('');
      setExample('');
    } catch (error) {
      console.error('Error uploading document: ', error);
      setMessage('❌ Error uploading content. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles['auth-loading']}>Checking authentication status...</div>;
  }

  if (!user) {
    return (
      <div className={styles['auth-card']}>
        <h2 className={styles['auth-title']}>Admin Login</h2>
        <form onSubmit={handleLogin} className={styles['auth-form']}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit" className={styles['auth-button']}>Log In</button>
          {message && <p className={styles['auth-message']}>{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <h2 className={styles['auth-title']}>Upload Lesson</h2>
        <button onClick={handleLogout} className={styles['auth-logout']}>Log Out</button>
      </div>

      <form onSubmit={handleSubmit} className={styles['auth-form']}>
        <div className={styles['auth-field']}>
          <label>Topic (slug, e.g., html, css):</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
          {topicExists && <p className={styles['auth-message-success']}>This topic already exists. Adding lesson.</p>}
        </div>

        {!topicExists && (
          <>
            <div className={styles['auth-field']}>
              <label>Topic Title:</label>
              <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} required />
            </div>
            <div className={styles['auth-field']}>
              <label>Topic Description:</label>
              <textarea value={topicDescription} onChange={(e) => setTopicDescription(e.target.value)} required />
            </div>
          </>
        )}

        <hr className={styles['auth-divider']} />
        <h3>Lesson Details</h3>
        <div className={styles['auth-field']}>
          <label>Lesson Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className={styles['auth-field']}>
          <label>Description (Markdown):</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className={styles['auth-field']}>
          <label>Example Code Block:</label>
          <textarea value={example} onChange={(e) => setExample(e.target.value)} />
        </div>
        <button type="submit" className={styles['auth-button']}>Upload</button>
        {message && <p className={styles['auth-message-success']}>{message}</p>}
      </form>
    </div>
  );
};

export default UploadLesson;
