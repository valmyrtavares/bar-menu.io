import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// 🔥 IMPORTS corretos para Firestore com cache persistente
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);

// 🔥 Firestore com cache persistente
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
  }),
});

if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    console.log('Modo Offline detectado: Desativando rede do Firestore para agilizar o cache.');
    disableNetwork(db).catch(console.error);
  });
  window.addEventListener('online', () => {
    console.log('Modo Online detectado: Reativando rede do Firestore.');
    enableNetwork(db).catch(console.error);
  });

  // Se já iniciar offline
  if (!navigator.onLine) {
    disableNetwork(db).catch(console.error);
  }
}

export { app, auth, storage, db };
