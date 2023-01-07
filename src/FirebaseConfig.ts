import { initializeApp } from "firebase/app";
// 追加
// Firebaseの認証機能を使う場合に必要な記述
// Authクラスの「getAuth」メソッド。
// 「getAuth」メソッドは、ユーザが既に認証済みならば、関数は TRUE を返す。
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 追加
// Firebaseの認証機能を使う場合に必要な記述
// Authクラスの「getAuth」メソッド。
// 「getAuth」メソッドは、ユーザが既に認証済みならば、関数は TRUE を返す。
export const auth = getAuth(app);
// Firebase の Storage に保存したファイルにアクセスする
export const storage = getStorage(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();