

'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getCountFromServer, getDoc } from 'firebase/firestore';
import { slugify } from '@/utils/slugify';
import { useRouter } from 'next/navigation'; // 🚀 Import useRouter
import styles from './upload.module.css';
import AdminAuth from '@/app/admin/AdminAuth';

const UploadLesson = () => {
  const [user, setUser] = useState(null);
  const router = useRouter(); // 🚀 Initialize router

  const [topic, setTopic] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicExists, setTopicExists] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [example, setExample] = useState('');
  const [message, setMessage] = useState('');

  // 🔎 check topic exists
  const checkTopic = async (topic) => {
    if (!topic) return;
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
      const lessonsCollectionRef = collection(db, 'topics', topicSlug, 'lessons');
      const snapshot = await getCountFromServer(lessonsCollectionRef);
      const nextLevel = snapshot.data().count + 1;

      if (!topicExists) {
        await setDoc(doc(db, 'topics', topicSlug), {
          title: topicTitle,
          description: topicDescription,
        });
      }

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
  
  // 🚀 If the user is not logged in, redirect them
  if (!user) {
    return (
      <div className={styles['auth-card']}>
        <AdminAuth onAuthChange={setUser} />
      </div>
    );
  }

  // If the user is logged in, show the upload form
  return (
    <div className={styles['auth-card']}>
      <AdminAuth onAuthChange={setUser} />
      <form onSubmit={handleSubmit} className={styles['auth-form']}>
        <div className={styles['auth-field']}>
          <label>Topic (slug, e.g., html, css):</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              checkTopic(e.target.value);
            }}
            required
          />
          {topicExists && (
            <p className={styles['auth-message-success']}>
              This topic already exists. Adding lesson.
            </p>
          )}
        </div>

        {!topicExists && (
          <>
            <div className={styles['auth-field']}>
              <label>Topic Title:</label>
              <input
                type="text"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                required
              />
            </div>
            <div className={styles['auth-field']}>
              <label>Topic Description:</label>
              <textarea
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <hr className={styles['auth-divider']} />
        <h3>Lesson Details</h3>
        <div className={styles['auth-field']}>
          <label>Lesson Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles['auth-field']}>
          <label>Description (Markdown):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className={styles['auth-field']}>
          <label>Example Code Block:</label>
          <textarea
            value={example}
            onChange={(e) => setExample(e.target.value)}
          />
        </div>
        <button type="submit" className={styles['auth-button']}>
          Upload
        </button>
        {message && <p className={styles['auth-message-success']}>{message}</p>}
      </form>
    </div>
  );
};

export default UploadLesson;