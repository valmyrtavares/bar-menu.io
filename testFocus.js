require('dotenv').config({ path: '.env.tropicalx' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');

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

async function test() {
  try {
    const stockId = '2P8qRp09Z4cgJAexbjD0';
    console.log("=== CURRENT STOCK STATUS ===");
    const stockSnap = await getDoc(doc(db, 'stock', stockId));
    if (stockSnap.exists()) {
      const data = stockSnap.data();
      console.log(`Product: "${data.product}" | Vol: ${data.totalVolume} | Cost: R$ ${data.totalCost}`);
    }

    console.log("\n=== CURRENT SIDE DISH STATUS ===");
    const sideDishesRef = collection(db, 'sideDishes');
    const q = query(sideDishesRef, where('sideDishes', '==', 'Farora de amendoim Felipe'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      console.log(`Side Dish: "${data.sideDishes}"`);
      console.log(`  costPerUnit: ${data.costPerUnit}`);
      console.log(`  portionCost: ${data.portionCost}`);
      console.log(`  costPriceObj:`, JSON.stringify(data.costPriceObj || {}, null, 2));
    });
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
