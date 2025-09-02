'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import styles from '../../components/upload.module.css';
import { auth } from '@/lib/firebase';

export default function AdminAuth({ onAuthChange = () => {}  }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      onAuthChange(currentUser); // 🔑 notify parent component
    });
    return () => unsubscribe();
  }, [onAuthChange]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('✅ Logged in successfully!');
    } catch (error) {
      console.error('Login error: ', error);
      switch (error.code) {
        case 'auth/invalid-credential':
          setMessage('❌ Incorrect email or password. Please try again.');
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

  if (loading) {
    return <div className={styles['auth-loading']}>Checking authentication...</div>;
  }

  if (!user) {
    return (
      <div className={styles['auth-card']}>
        <h2 className={styles['auth-title']}>Admin Login</h2>
        <form onSubmit={handleLogin} className={styles['auth-form']}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" className={styles['auth-button']}>Log In</button>
          {message && <p className={styles['auth-message']}>{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className={styles['auth-card']}>
      <div className={styles['auth-header']}>
        <p className={styles['auth-title']}>Logged in as {user.email}</p>
        <button onClick={handleLogout} className={styles['auth-logout']}>Log Out</button>
      </div>
      {message && <p className={styles['auth-message-success']}>{message}</p>}
    </div>
  );
}
