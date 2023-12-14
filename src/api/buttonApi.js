import { app } from '../config-firebase/firebase.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

//FIRESTORE
const db = getFirestore(app);

export async function getBtnData(collectionName) {
  const db = getFirestore();
  const docRef = collection(db, collectionName);

  try {
    const docSnap = await getDocs(docRef);
    let array = [];

    docSnap.forEach((doc) => {
      array.push(doc.data());
    });

    return array;
  } catch (error) {
    throw error;
  }
}

export async function fetchCategories(item) {
  const categories = await getBtnData(item);
  return categories.map((item) => item.parent);
}

export async function fetchCategoriesItem(collectionName) {
  const parents = await fetchCategories(collectionName); // All parents used
  const categories = await getBtnData(collectionName); //Whole objects array from firevase

  let usedCategories = new Set(categories.map((item) => item.category)); //Changing categories in object and  to set to remove duplicates
  const noUsedParentsItems = parents.filter((item) => !usedCategories.has(item)); //Filtering parents that are not in usedCategories

  return noUsedParentsItems;
}
