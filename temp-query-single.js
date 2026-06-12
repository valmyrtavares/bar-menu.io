require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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
  const docRef = doc(db, "requests", "Yjwix0sc19oYQuzSG5CY");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data().countRequest, docSnap.data().name);
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}

run().then(() => process.exit(0)).catch(console.error);
