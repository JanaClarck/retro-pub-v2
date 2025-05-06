import { auth } from '@/firebase-config/client';
import { onAuthStateChanged } from 'firebase/auth';

export function getAdminUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe immediately after first callback
      if (user) {
        resolve(user);
      } else {
        window.location.href = '/admin/login';
        reject(new Error('Not authenticated'));
      }
    });
  });
}

export function verifyAdminSession() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe immediately after first callback
      if (user) {
        resolve(user);
      } else {
        window.location.href = '/admin/login';
        reject(new Error('Not authenticated'));
      }
    });
  });
} 