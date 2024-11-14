import { debugErrorMap } from 'firebase/auth';
import { app } from '../config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDocs,
  onSnapshot,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

//FIRESTORE
const db = getFirestore(app);

//Bringing by query data
export async function fetchingByQuery(reference, collectionName) {
  try {
    const Ref = collection(db, collectionName); // referencia a coleção "sideDishes"

    // Filtra os documentos pelo campo "sideDishes" igual ao nome recebido
    const q = query(Ref, where(collectionName, '==', reference));

    const querySnapshot = await getDocs(q); // Executa a consulta

    // Verifica se encontrou algum documento
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]; // Pega o primeiro documento encontrado
      const costPriceObj = doc.data(); // Obtém os dados do documento
      // Retorna o objeto com os dados de custo e preço
      return costPriceObj;
    } else {
      console.log('Acompanhamento não encontrado');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar o acompanhamento:', error);
    return null;
  }
}

//Bringing collecton whenever ther was any change in data
export function fetchInDataChanges(collectionName, onData) {
  const requestCollection = collection(db, collectionName);

  const unsubscribe = onSnapshot(requestCollection, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onData(data);
  });
  return unsubscribe;
}

//Delete item in collection
export async function deleteData(coolectionName, id) {
  const db = getFirestore(app);
  try {
    const docRef = doc(db, coolectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.log(error);
  }
}

//Remove item in the "request" array list
export async function deleteRequestItem(userId, itemId) {
  const db = getFirestore(app);
  const userRef = doc(db, 'user', userId);

  try {
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Dados do usuário:', userData);

      if (userData.request && Array.isArray(userData.request)) {
        const updatedRequest = userData.request.filter(
          (_, index) => index != itemId
        );

        await updateDoc(userRef, {
          request: updatedRequest,
        });
      }

      console.log('Item removed successfully.');
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.log('Error removing item: ', error);
  }
}

//Bringing collection and tranform in array
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

//The name is clear just one item
export async function getOneItemColleciton(collectionName, itemId) {
  const db = getFirestore();
  const docRef = doc(db, collectionName, itemId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id };
    } else {
      throw new Error('No document found with the given ID');
    }
  } catch (error) {
    throw error;
  }
}

//Bring Categories
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
  return [
    ...new Set(btnCategories.filter((item) => !dishesCategories.has(item))),
  ];
}

export const updateItemsSideDishes = async () => {
  try {
    // Pega todos os acompanhamentos da coleção 'sideDishes'
    const allSideDishes = await getBtnData('sideDishes');

    // Pega todos os itens da coleção 'item'
    const allItems = await getBtnData('item');

    // Percorre cada item da coleção 'item'
    for (const item of allItems) {
      const updatedSideDishes = [];

      // Percorre o array sideDishesElementList de cada item
      for (const sideDishElement of item.sideDishesElementList) {
        // Encontra o acompanhamento correspondente na coleção 'sideDishes'
        const matchedSideDish = allSideDishes.find(
          (sideDish) => sideDish.id === sideDishElement.id
        );

        // Se houver um acompanhamento correspondente, verifica se houve alteração
        if (matchedSideDish) {
          const updatedElement = {
            ...sideDishElement,
            price: matchedSideDish.price, // Atualiza o preço
            sideDishes: matchedSideDish.sideDishes, // Atualiza o nome
          };
          updatedSideDishes.push(updatedElement);
        } else {
          // Caso não encontre o acompanhamento, mantém o original
          updatedSideDishes.push(sideDishElement);
        }
      }

      // Verifica se houve mudanças no sideDishesElementList
      const itemRef = doc(db, 'item', item.id);

      if (
        JSON.stringify(updatedSideDishes) !==
        JSON.stringify(item.sideDishesElementList)
      ) {
        // Se houver mudanças, atualiza o item no Firestore
        await updateDoc(itemRef, {
          sideDishesElementList: updatedSideDishes,
        });
        console.log(`Item atualizado: ${item.title}`);
      }
    }
    console.log('Atualização concluída.');
  } catch (error) {
    console.error('Erro ao atualizar sideDishesElementList: ', error);
  }
};
