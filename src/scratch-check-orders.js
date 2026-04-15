import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkOrders() {
  const reqRef = collection(db, 'requests');
  const q = query(reqRef, where('countRequest', 'in', [8255, 8259]));
  
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    console.log("Order:", doc.data().countRequest);
    console.log("Request items:");
    doc.data().request.forEach(r => {
        console.log(` - Item: ${r.name}, image: ${r.image?.substring(0, 50)}...`);
    });
  });
}

checkOrders().catch(console.error);
