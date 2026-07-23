import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCb_Wl74WJSGTxSvXcxdVLPGxDIG4Ht0iE",
  authDomain: "tpa-baiturrahman.firebaseapp.com",
  projectId: "tpa-baiturrahman",
  storageBucket: "tpa-baiturrahman.firebasestorage.app",
  messagingSenderId: "22260299333",
  appId: "1:22260299333:web:e7fc9cb7703ed77367152c",
  measurementId: "G-5SNGGY186T"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }
