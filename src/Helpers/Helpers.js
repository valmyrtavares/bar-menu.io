import React from 'react';
import { getBtnData } from '../api/Api';
import { cardClasses } from '@mui/material';

export function firstNameClient(nameCustomer) {
  let firstName = nameCustomer.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

export function getFirstFourLetters(inputString, max) {
  return inputString ? inputString.slice(0, max) : '';

  console.log('inputString   ', inputString);
}

export async function CheckUser(check) {
  if (localStorage.hasOwnProperty(check)) {
    debugger;
    const userMenu = JSON.parse(localStorage.getItem(check));
    const userList = await getBtnData('user');
    const currentUser = userList.filter((item) => item.id === userMenu.id);
    if (currentUser && currentUser.length > 0 && currentUser[0].name) {
      return '/';
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
