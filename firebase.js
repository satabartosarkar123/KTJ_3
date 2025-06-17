import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyANQ3yM88LkUM2qal3FP5Q0a7PSOLQAXhY",
  authDomain: "ktj3-720f5.firebaseapp.com",
  projectId: "ktj3-720f5",
  storageBucket: "ktj3-720f5.firebasestorage.app",
  messagingSenderId: "823186584125",
  appId: "1:823186584125:web:b15e76a5a38e9033ab3054",
  measurementId: "G-52S7N61JBC"

};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);