import React from 'react';
import { getBtnData, getStockByProductName } from '../api/Api';
import { cardClasses } from '@mui/material';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
const db = getFirestore(app);

export const alertMinimunAmount = (product, volume, minimum, cost) => {
  if (volume < minimum) {
    console.log(
      `O produto ${product} foi recusado porque o volume (${volume}) está menor que o mínimo (${minimum})`
    );
    return false;
  }
  if (volume === 0) {
    console.log(
      `O produto ${product} foi recusado porque o volume está igual a 0`
    );
    return false;
  }
  if (minimum === undefined) {
    console.log(
      `O produto ${product} foi recusado porque o mínimo está indefinido`
    );
    return false;
  }
  if (isNaN(cost)) {
    console.log(
      `O produto ${product} foi recusado porque o custo não é um número`
    );
    return false;
  }
  if (cost === undefined) {
    console.log(
      `O produto ${product} foi recusado porque o custo está indefinido`
    );
    return false;
  }
  if (cost <= 0) {
    console.log(
      `O produto ${product} foi recusado porque o custo (${cost}) é menor ou igual a 0`
    );
    return false;
  }
  return true;
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
  console.log('IsToten é ', isToten);

  if (localStorage.hasOwnProperty(check)) {
    const userMenu = JSON.parse(localStorage.getItem(check));
    const userList = await getBtnData('user');
    const currentUser = userList.filter((item) => item.id === userMenu.id);
    if (currentUser && currentUser.length > 0 && currentUser[0].name) {
      console.log('Passei por aqui');
      if (isToten) {
        console.log('IsToten é ', isToten);
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
  const sortedList = [...ObjList];
  sortedList.sort((a, b) => {
    if (!direction) {
      return a.countRequest - b.countRequest;
    } else {
      return b.countRequest - a.countRequest;
    }
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
