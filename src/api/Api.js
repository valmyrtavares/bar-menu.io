import { debugErrorMap } from 'firebase/auth';
import { app } from '../config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

//FIRESTORE
const db = getFirestore(app);

export async function deleteData(coolectionName, id) {
  const db = getFirestore(app);
  try {
    const docRef = doc(db, coolectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.log(error);
  }
}

export async function getBtnData(collectionName) {
  const db = getFirestore();
  const docRef = collection(db, collectionName);
  try {
    const docSnap = await getDocs(docRef);
    let array = [];
    docSnap.forEach((doc) => {
      array.push({ ...doc.data(), id: doc.id });
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
  const noUsedParentsItems = parents.filter(
    (item) => !usedCategories.has(item)
  ); //Filtering parents that are not in usedCategories

  return noUsedParentsItems;
}

// export async function fetchCategoriesButton(collectionName){
//     const categoriesItem = await getBtnData(collectionName)
//     const  filteredCategoriesItem = new Set(categoriesItem.map((item)=> item.category))
//     let btnCategories = await getBtnData("button")
//     btnCategories = btnCategories.map((item)=> item.category)
//     return [...new Set(btnCategories.filter((item) => !filteredCategoriesItem.has(item)))];

// }
export async function fetchCategoriesButton(collectionName) {
  const dishesCategories = new Set(
    (await getBtnData(collectionName)).map((item) => item.category) //Categoria de todos os pratos publicados
  );
  const btnCategories = (await getBtnData('button')).map((item) => item.parent); //Todas as categorias já criadas
  // Parent pode ser o pai de um botão ou de um prato se ele tiver um filho
  // botão ele pode ter neto, se o filho dele for um prato ele não pode ter neto, porque
  //prato não pode ter filho
  console.log('CATEGORIES ITEM   ', dishesCategories);
  console.log('BTN CATEGORIES', btnCategories);

  return [
    ...new Set(btnCategories.filter((item) => !dishesCategories.has(item))),
  ];
}