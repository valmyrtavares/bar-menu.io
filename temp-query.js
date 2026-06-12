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

async function run() {
  const querySnapshot = await getDocs(collection(db, "requests"));
  let count = 0;
  let totalGross = 0;
  let totalCost = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.dateTime && data.dateTime.includes('08/06/202')) {
      console.log('--- Request ---');
      console.log('ID:', doc.id, 'DateTime:', data.dateTime);
      if (data.request) {
        data.request.forEach(item => {
          console.log('Item:', item.name, 'finalPrice:', item.finalPrice, 'price:', item.price, 'historicalCost:', item.historicalCost);
        });
      }
    }
  });
}
run().then(() => process.exit(0)).catch(console.error);
