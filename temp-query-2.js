require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC7sJ3wQY40ZXNvwn-QcbNr51R1Gjui_1E",
  authDomain: "react-bar-67f33.firebaseapp.com",
  projectId: "react-bar-67f33",
  storageBucket: "react-bar-67f33.appspot.com",
  messagingSenderId: "621276654255",
  appId: "1:621276654255:web:c90ba2bc75df7ae1edc25a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-') && !dateStr.includes('/')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    const [datePart] = dateStr.split(' - ');
    const parts = datePart.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
};

async function run() {
  const querySnapshot = await getDocs(collection(db, "requests"));
  let totalProfit = 0;
  
  querySnapshot.forEach((doc) => {
    const rev = doc.data();
    const d = parseDate(rev.dateTime);
    if (d && d.getMonth() === 5 && d.getFullYear() === 2026 && d.getDate() === 8) { // June 8th
      if (rev.request) {
        rev.request.forEach(item => {
          const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
          const cost = Number(item.historicalCost) || 0; // rough approximation for the script
          const profit = finalPrice - cost;
          console.log(`ID: ${doc.id} | Item: ${item.name} | Price: ${finalPrice} | Cost: ${cost} | Profit: ${profit.toFixed(2)}`);
          totalProfit += profit;
        });
      }
    }
  });
  console.log('TOTAL PROFIT FOR JUNE 8:', totalProfit.toFixed(2));
}

run().then(() => process.exit(0)).catch(console.error);
