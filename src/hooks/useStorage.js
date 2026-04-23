import { useState } from 'react';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import useAuthStore from './useAuth';

/**
 * useStorage — TIER 3 Storage Shield & Quota Manager.
 * 
 * Logic:
 * - Validates file size (< 5MB).
 * - Checks global user quota (< 500MB).
 * - Updates total usage in Firestore.
 */
export default function useStorage() {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_TOTAL_QUOTA = 500 * 1024 * 1024; // 500MB

  const uploadFile = async (path, file) => {
    if (!user) return null;
    setError(null);

    // 1. Frontend Shield: File Size Validation
    if (file.size > MAX_FILE_SIZE) {
      const err = `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed: 5MB.`;
      setError(err);
      throw new Error(err);
    }

    try {
      // 2. Frontend Shield: Check Global Quota
      const usageRef = doc(db, 'users', user.uid, 'settings', 'usage');
      const usageSnap = await getDoc(usageRef);
      const currentUsage = usageSnap.exists() ? usageSnap.data().totalStorageUsed || 0 : 0;

      if (currentUsage + file.size > MAX_TOTAL_QUOTA) {
        const err = "Total storage quota exceeded (500MB limit). Please delete old files.";
        setError(err);
        throw new Error(err);
      }

      setUploading(true);
      const storageRef = ref(storage, `${user.uid}/${path}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(p);
          },
          (err) => {
            setError(err.message);
            setUploading(false);
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // 3. Backend Track: Update total storage used in Firestore
            await setDoc(usageRef, {
              totalStorageUsed: increment(file.size),
              lastUploadAt: new Date().toISOString()
            }, { merge: true });

            setUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  const removeFile = async (fullPath, fileSize) => {
    if (!user) return;
    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);

      // Decrement usage
      const usageRef = doc(db, 'users', user.uid, 'settings', 'usage');
      await updateDoc(usageRef, {
        totalStorageUsed: increment(-fileSize)
      });
    } catch (err) {
      console.error('[Storage] Delete error:', err);
    }
  };

  return { uploadFile, removeFile, uploading, progress, error };
}
