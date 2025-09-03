'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, getDoc } from 'firebase/firestore';
import { slugify } from '@/utils/slugify';
import styles from './upload.module.css';
import AdminAuth from '@/app/admin/AdminAuth';

const UploadLesson = () => {
  const [user, setUser] = useState(null);

  const [topic, setTopic] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicExists, setTopicExists] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [example, setExample] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(true);
    setMessage('Uploading...');

    const topicSlug = slugify(topic);
    const lessonSlug = slugify(title);

    try {
      await runTransaction(db, async (transaction) => {
        const topicRef = doc(db, 'topics', topicSlug);
        const lessonRef = doc(collection(db, `topics/${topicSlug}/lessons`), lessonSlug);

        // Read the current topic and new lesson documents within the transaction
        const topicDoc = await transaction.get(topicRef);
        const lessonDoc = await transaction.get(lessonRef);

        if (lessonDoc.exists()) {
          // If the lesson document already exists, stop and throw an error
          throw new Error('This lesson already exists. Please choose a different title.');
        }

        const newLessonCount = (topicDoc.exists() ? topicDoc.data().lessonCount || 0 : 0) + 1;

        // Create or update the topic document
        if (!topicDoc.exists()) {
          transaction.set(topicRef, {
            title: topicTitle,
            description: topicDescription,
            firstLessonId: lessonSlug, // Set the first lesson's slug
            lessonCount: newLessonCount,
          });
        } else {
          transaction.update(topicRef, {
            lessonCount: newLessonCount,
          });
        }

        // Create the new lesson document with the calculated level
        transaction.set(lessonRef, {
          level: newLessonCount,
          title,
          description,
          example: example || null,
        });
      });

      setMessage('✅ Lesson uploaded successfully!');
      // Reset form fields
      setTitle('');
      setDescription('');
      setExample('');

    } catch (error) {
      console.error('Error uploading document: ', error);
      setMessage(`❌ Error uploading content: ${error.message}`);
    } finally {
      setIsPending(false);
    }
  };

  // The rest of your component's JSX remains the same
  if (!user) {
    return (
      <div className={styles['auth-card']}>
        <AdminAuth onAuthChange={setUser} />
      </div>
    );
  }

  return (
    <div className={styles['auth-card']}>
      <AdminAuth onAuthChange={setUser} />
      <form onSubmit={handleSubmit} className={styles['auth-form']}>
        {/* Topic details */}
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
        <button type="submit" className={styles['auth-button']} disabled={isPending}>
          {isPending ? 'Uploading...' : 'Upload'}
        </button>
        {message && (
          <p className={message.startsWith('❌') ? styles['auth-message-error'] : styles['auth-message-success']}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UploadLesson;