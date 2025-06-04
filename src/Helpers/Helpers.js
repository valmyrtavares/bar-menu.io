import React from 'react';
import { getBtnData } from '../api/Api';
import { cardClasses } from '@mui/material';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../config-firebase/firebase.js';
import * as XLSX from 'xlsx';
const db = getFirestore(app);

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
