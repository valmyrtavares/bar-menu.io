import React from 'react';

import { getBtnData, getStockByProductName } from '../api/Api';
import { cardClasses } from '@mui/material';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
const db = getFirestore(app);

/**
 * Procura por uma matéria-prima em todas as receitas dos itens e atualiza lowAmountRawMaterial.
 *
 * @param {string} rawMaterialName - Nome da matéria-prima a ser procurada.
 * @param {boolean} status - Valor que será definido (true = indisponível, false = disponível).
 */
export async function checkUnavaiableRawMaterial(rawMaterialName, status) {
  if (!rawMaterialName || typeof rawMaterialName !== 'string') {
    console.warn('⚠️ Parâmetro rawMaterialName inválido:', rawMaterialName);
    return;
  }

  const normalizedName = rawMaterialName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const itemsSnapshot = await getDocs(collection(db, 'item'));
  const warningLog = [];

  for (const docSnap of itemsSnapshot.docs) {
    const data = docSnap.data();
    if (data.title === 'KIBE DE QUEIJO' || data.title === 'KIBE DE QUEIJO')
      debugger;
    const recipe = data?.recipe?.FinalingridientsList;
    if (!recipe) continue;
    let updatedRecipe = structuredClone(recipe);
    let shouldUpdateRecipe = false;

    // 🔹 Novo controle separado
    let foundIngredient = false; // encontrou o ingrediente procurado
    let hasUnavailable = false; // há algum ingrediente indisponível

    // Função auxiliar revisada
    const checkInArray = (arr) => {
      if (!Array.isArray(arr)) return false;

      arr.forEach((ing) => {
        if (!ing || typeof ing.name !== 'string') return;
        const normalizedIngName = ing.name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        // Cenário 1: ingrediente procurado está indisponível
        if (normalizedIngName === normalizedName && status === true) {
          ing.unavailableRawMaterial = true;
          shouldUpdateRecipe = true;
          foundIngredient = true;
          hasUnavailable = true;
          warningLog.push(normalizedIngName);
        }

        // Cenário 2: ingrediente procurado voltou a estar disponível
        else if (normalizedIngName === normalizedName && status === false) {
          ing.unavailableRawMaterial = false;
          shouldUpdateRecipe = true;
          foundIngredient = true;
        }

        // Verifica se há qualquer outro ingrediente ainda indisponível
        if (ing.unavailableRawMaterial === true) {
          hasUnavailable = true;
          warningLog.push(normalizedIngName);
        }
      });
    };

    // Verifica os diferentes formatos da receita
    if (Array.isArray(recipe)) {
      checkInArray(updatedRecipe);
    } else if (typeof recipe === 'object' && recipe !== null) {
      const { firstLabel, secondLabel, thirdLabel } = data.CustomizedPrice;
      checkInArray(updatedRecipe[firstLabel]);
      checkInArray(updatedRecipe[secondLabel]);
      checkInArray(updatedRecipe[thirdLabel]);
    }

    // Atualiza a receita se houve mudança em unavailableRawMaterial
    if (shouldUpdateRecipe) {
      try {
        await updateDoc(doc(db, 'item', docSnap.id), {
          'recipe.FinalingridientsList': updatedRecipe, // ✅ corrigido nome
        });
        console.log(
          `🧩 Receita de "${data.title}" atualizada com novas disponibilidades`
        );
      } catch (err) {
        console.error(
          `❌ Erro ao atualizar receita de "${data.title}":`,
          err.message
        );
      }
    }

    // Atualiza o status do prato (somente se encontrou o ingrediente procurado)
    if (foundIngredient) {
      try {
        await updateDoc(doc(db, 'item', docSnap.id), {
          lowAmountRawMaterial: hasUnavailable, // ✅ agora depende apenas dos indisponíveis
        });
        console.log(
          `✅ Prato "${
            data.title || docSnap.id
          }" atualizado: lowAmountRawMaterial = ${hasUnavailable}`
        );
      } catch (err) {
        console.error(
          `❌ Erro ao atualizar "${data.title || docSnap.id}":`,
          err.message
        );
      }
    }
  }

  // Log final
  if (warningLog.length > 0) {
    console.log('⚠️ Matérias-primas com problema detectadas:');
    warningLog.forEach((mat) => console.log(` - ${mat}`));
  }

  console.log('🟢 Verificação de matérias-primas concluída.');
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
