require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

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

async function runMigration() {
  console.log('Buscando itens excluídos da coleção stock...');
  const stockSnap = await getDocs(collection(db, 'stock'));
  
  const deletedItems = [];
  stockSnap.forEach(d => {
    const data = d.data();
    if (data.activityStatus === true) {
      deletedItems.push({ id: d.id, ...data });
    }
  });

  if (deletedItems.length === 0) {
    console.log('Nenhum item excluído encontrado para migrar.');
    return;
  }

  console.log(`Encontrados ${deletedItems.length} itens para migrar. Iniciando batch...`);
  
  const batch = writeBatch(db);
  deletedItems.forEach(item => {
    const newDocRef = doc(db, 'deletedStock', item.id);
    const oldDocRef = doc(db, 'stock', item.id);
    
    // Copia para a nova coleção, adicionando timestamp de exclusão se não houver
    batch.set(newDocRef, {
      ...item,
      deletedAt: item.deletedAt || new Date().toISOString()
    });
    // Remove da coleção antiga
    batch.delete(oldDocRef);
  });

  await batch.commit();
  console.log('Migração concluída com sucesso!');
}

runMigration().catch(console.error);
