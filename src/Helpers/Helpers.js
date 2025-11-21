import React from 'react';

import { getBtnData, getStockByProductName } from '../api/Api';
import { cardClasses } from '@mui/material';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
const db = getFirestore(app);

export async function checkUnavaiableRawMaterial(id) {
  //
  // 1) BUSCA DIRETA DO OBJETO NO FIRESTORE PELO ID
  //
  const docRef = doc(db, 'stock', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const stock = { id: docSnap.id, ...docSnap.data() };
  const { totalVolume, disabledDish, idProduct, product } = stock;

  //
  // Normaliza o nome da matéria prima do estoque
  //
  const normalizedProduct = product
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  //
  // 2) BUSCA TODOS OS PRATOS (collection 'item')
  //
  const itemsSnapshot = await getDocs(collection(db, 'item'));

  //
  // 3) Função auxiliar que normaliza nome de ingrediente
  //
  const normalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  //
  // 4) Função que processa um array de ingredientes
  //
  const processIngredientsArray = (arr, isUnavailable) => {
    if (!Array.isArray(arr)) return;

    arr.forEach((ing) => {
      if (!ing || typeof ing.name !== 'string') return;

      const normalizedIngName = normalize(ing.name);

      // Se é a matéria-prima alvo da função
      if (normalizedIngName === normalizedProduct) {
        ing.unavailableRawMaterial = isUnavailable; // true ou false
      }
    });
  };

  //
  // 5) Para cada prato (item)
  //
  for (const dishSnap of itemsSnapshot.docs) {
    const data = dishSnap.data();

    const recipe = data?.recipe?.FinalingridientsList;
    if (!recipe) continue;

    // Clone seguro
    let updatedRecipe = structuredClone(recipe);

    //
    // VERIFICAÇÃO DE INDISPONIBILIDADE
    //
    const isUnavailable = Number(disabledDish) >= Number(totalVolume);

    //
    // 6) Cenário 1 → Recipe é UM ARRAY
    //
    if (Array.isArray(updatedRecipe)) {
      processIngredientsArray(updatedRecipe, isUnavailable);
    }

    //
    // 7) Cenário 2 → Recipe é OBJETO com 3 arrays
    //
    else if (typeof updatedRecipe === 'object' && updatedRecipe !== null) {
      const labels = data.CustomizedPrice;
      if (!labels) continue;

      processIngredientsArray(updatedRecipe[labels.firstLabel], isUnavailable);
      processIngredientsArray(updatedRecipe[labels.secondLabel], isUnavailable);
      processIngredientsArray(updatedRecipe[labels.thirdLabel], isUnavailable);
    }

    //
    // 8) Ajuste da flag LOW AMOUNT no prato
    //
    if (isUnavailable) {
      // Se a matéria-prima está indisponível → prato fica indisponível
      data.lowAmountRawMaterial = true;
    } else {
      //
      // Cenário inverso:
      // totalVolume > disabledDish → verificar se ainda existe ALGUM ingrediente indisponível
      //
      const checkStillUnavailable = (arr) =>
        Array.isArray(arr) &&
        arr.some((ing) => ing?.unavailableRawMaterial === true);

      let stillUnavailable = false;

      if (Array.isArray(updatedRecipe)) {
        stillUnavailable = checkStillUnavailable(updatedRecipe);
      } else {
        const labels = data.CustomizedPrice;
        stillUnavailable =
          checkStillUnavailable(updatedRecipe[labels.firstLabel]) ||
          checkStillUnavailable(updatedRecipe[labels.secondLabel]) ||
          checkStillUnavailable(updatedRecipe[labels.thirdLabel]);
      }

      // Se não há NENHUM ingrediente indisponível → prato pode voltar a ficar ok
      data.lowAmountRawMaterial = stillUnavailable;
    }
    // --- SALVAR AS ALTERAÇÕES NO FIRESTORE ---

    // referência do prato
    const dishRef = doc(db, 'item', dishSnap.id);

    // monta o payload atualizado
    // --- MONTAR PAYLOAD CONFORME O TIPO DE RECIPE ---
    let updatedPayload;

    if (Array.isArray(recipe)) {
      // 1) Recipe simples (um único array)
      updatedPayload = {
        ...data,
        recipe: {
          FinalingridientsList: updatedRecipe,
        },
      };
    } else {
      // 2) Recipe com 3 arrays dentro de um objeto
      updatedPayload = {
        ...data,
        recipe: {
          FinalingridientsList: updatedRecipe, // updatedRecipe já é o objeto com 3 arrays
        },
        CustomizedPrice: data.CustomizedPrice, // mantém o mapeamento dos 3 labels
      };
    }

    // salva no firestore
    await updateDoc(dishRef, updatedPayload);
  }
}

// helpers/alertMinimumAmount.js
export const alertMinimunAmount = (product, volume, minimum, cost) => {
  if (volume < minimum) {
    return {
      status: false,
      message: `⚠️ O produto ${product} foi recusado porque o volume (${volume}) está menor que o mínimo (${minimum})`,
    };
  }

  if (volume === 0) {
    return {
      status: false,
      message: ` O produto ${product} foi recusado porque o volume está igual a 0`,
    };
  }

  if (minimum === undefined) {
    console.log(`⚠️`);
    return {
      status: false,
      message: ` O produto ${product} foi recusado porque o mínimo está indefinido`,
    };
  }

  if (isNaN(cost)) {
    return {
      status: false,
      message: `O produto ${product} foi recusado porque o custo não é um número`,
    };
  }

  if (cost === undefined) {
    return {
      status: false,
      message: `O produto ${product} foi recusado porque o custo está indefinido`,
    };
  }

  if (cost <= 0) {
    return {
      status: false,
      message: `O produto ${product} foi recusado porque o custo (${cost}) é menor ou igual a 0`,
    };
  }

  // ✅ Se passou em todas as verificações:
  return { status: true, message: '' };
};

export const exportToExcel = (ObjList, fileName = 'data.xlsx') => {
  if (!ObjList.length) {
    alert('Nenhum cliente para exportar!');
    return;
  }

  try {
    // Mantém apenas chaves com valores primitivos (string, number, boolean)
    const simplifiedList = ObjList.map((obj) => {
      const flatObj = {};
      for (const key in obj) {
        const value = obj[key];
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          flatObj[key] = value;
        }
      }
      return flatObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(simplifiedList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, fileName);

    console.log('Arquivo Excel gerado com sucesso!');
    alert('Arquivo Excel foi baixado com sucesso!');
  } catch (err) {
    console.error('Erro ao exportar Excel:', err);
    alert('Erro ao gerar o arquivo Excel');
  }
};

export function firstNameClient(nameCustomer) {
  if (nameCustomer) {
    let firstName = nameCustomer.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  } else {
    return '';
  }
}

export function getFirstFourLetters(inputString, max) {
  return inputString ? inputString.slice(0, max) : '';
}

export async function CheckUser(check, isToten) {
  if (localStorage.hasOwnProperty(check)) {
    const userMenu = JSON.parse(localStorage.getItem(check));
    const userList = await getBtnData('user');
    const currentUser = userList.filter((item) => item.id === userMenu.id);
    if (currentUser && currentUser.length > 0 && currentUser[0].name) {
      if (isToten) {
        return '/new-layout';
      } else {
        return '/'; // return to main screen
      }
    } else {
      localStorage.removeItem(check);
      return '/admin/check-customer-nologr';
    }
  } else {
    return '/admin/check-customer-nolog';
  }
}

export const requestSorter = (ObjList, direction) => {
  const sortedList = [...ObjList].map((item) => ({
    ...item,
    countRequest: Number(item.countRequest) || 0, // força número ou 0
  }));

  sortedList.sort((a, b) => {
    return direction
      ? b.countRequest - a.countRequest
      : a.countRequest - b.countRequest;
  });

  return sortedList;
};

export const logToAnounimousInToten = (setNameClient) => {
  const noCustomer = {
    name: 'anonimo',
    phone: '777',
    birthday: '77',
    email: 'anonimo@anonimo.com',
  };
  if (localStorage.hasOwnProperty('isToten')) {
    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      if (currentUserNew) {
        setNameClient(currentUserNew.name);
        global.setId(currentUserNew.name);
      }
    } else {
      addDoc(collection(db, 'user'), noCustomer).then((docRef) => {
        global.setId(docRef.id); // Pega o id do cliente criado e manda para o meu useContext para vincular os pedidos ao cliente que os fez
        console.log('Document written with ID: ', docRef.id);
        setNameClient('anonimo');
        localStorage.setItem(
          'userMenu',
          JSON.stringify({ id: docRef.id, name: 'anonimo' })
        );
      });
    }
  }
};

export async function calculateItemCost(item) {
  const results = {};

  const processIngredientList = async (ingredientList) => {
    let totalCost = 0;
    const invalidIngredients = [];
    console.log('Ingredient List:', ingredientList);
    for (const ingredient of ingredientList) {
      const stock = await getStockByProductName(ingredient.name);
      if (stock && stock.totalVolume && stock.totalCost) {
        const costPerUnit = stock.totalCost / stock.totalVolume;

        const amount = parseFloat(ingredient.amount.replace(',', '.')); // garante conversão correta

        totalCost += amount * costPerUnit;
      } else {
        invalidIngredients.push(ingredient.name);
        console.warn(
          `Stock not found or invalid for ingredient: ${ingredient.name}`
        );
        if (invalidIngredients.length > 0) {
          alert(
            `O valor do custo não está correto porque os seguintes ingredientes não têm valores válidos: ${invalidIngredients.join(
              ', '
            )}. O cálculo foi feito apenas com os ingredientes válidos.`
          );
        }
      }
    }

    // Arredonda para 2 casas decimais
    totalCost = Math.round((totalCost + Number.EPSILON) * 100) / 100;

    return Number(totalCost.toFixed(2));
  };

  // Caso 1: FinalingredientList é um array
  if (Array.isArray(item?.FinalingridientsList)) {
    const cost = await processIngredientList(item?.FinalingridientsList);
    return { default: cost }; // retorna com uma key padrão
  }

  // Caso 2: FinalingredientList é um objeto com arrays
  if (
    typeof item?.FinalingridientsList === 'object' &&
    item?.FinalingridientsList !== null
  ) {
    const sizes = item.FinalingridientsList;

    for (const [sizeName, ingredientList] of Object.entries(sizes)) {
      const cost = await processIngredientList(ingredientList);
      results[sizeName] = Number(cost.toFixed(2));
    }

    return results;
  }

  return null;
}
//There is no need to export this function, it is used only in the PriceAndExpenseBuilder.js
//te
