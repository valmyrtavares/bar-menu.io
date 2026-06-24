const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.tropicalx' });

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixInconsistencies() {
  const stockCol = collection(db, 'stock');
  const snapshot = await getDocs(stockCol);
  
  let fixedCount = 0;
  for (const item of snapshot.docs) {
    const data = item.data();
    let vol = Number(data.totalVolume) || 0;
    let cost = Number(data.totalCost) || 0;
    let modified = false;
    
    if (vol < 0) {
      vol = 0;
      modified = true;
    }
    if (cost < 0) {
      cost = 0;
      modified = true;
    }
    if (vol === 0 && cost > 0) {
      cost = 0;
      modified = true;
    }
    
    if (modified) {
      await updateDoc(doc(db, 'stock', item.id), {
        totalVolume: vol,
        totalCost: cost
      });
      console.log(`Fixed ${data.product}: vol ${data.totalVolume} -> ${vol}, cost ${data.totalCost} -> ${cost}`);
      fixedCount++;
    }
  }
  console.log(`Done. Fixed ${fixedCount} items.`);
}

fixInconsistencies();
