require('dotenv').config();
const { collection, getDocs, limit, query, orderBy } = require('firebase/firestore');
const { db } = require('./src/config-firebase/firebase.js');

async function test() {
  try {
    const q = query(collection(db, 'inventoryHistory'), orderBy('timestamp', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      console.log('--- DOC ID:', doc.id);
      const data = doc.data();
      console.log('Date:', data.date);
      console.log('Has items?', !!data.items);
      if (data.items) {
          console.log('Items length:', data.items.length);
          console.log('Sample item:', data.items[0]);
      }
      console.log('Difference logic items:', data.items?.reduce((acc, item) => acc + (Number(item.currentCost) - Number(item.previousCost)), 0));
      console.log('Total Loss Value fallback:', data.totalLossValue);
    });
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
