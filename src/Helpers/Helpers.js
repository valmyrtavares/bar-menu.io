import React from "react";
import { getBtnData } from "../api/Api";

export function getFirstFourLetters(inputString, max) {
  return inputString ? inputString.slice(0, max) : "";

  console.log("inputString   ", inputString);
}

export async function CheckUser(check) {
  if (localStorage.hasOwnProperty(check)) {
    const userMenu = JSON.parse(localStorage.getItem(check));
    const userList = await getBtnData("user");
    const currentUser = userList.filter((item) => item.id === userMenu.id);
    if (currentUser && currentUser.length > 0 && currentUser[0].name) {
      return "/";
    } else {
      return "/create-customer";
    }
  } else {
    return "/admin/check-customer-nolog";
  }
}

export const requestSorter = (ObjList) => {
  const sortedList = [...ObjList];
  sortedList.sort((a, b) => {
    // Converte as strings 'dateTime' em objetos Date para comparação
    const dateA = new Date(a.dateTime.split(" - ").reverse().join(" "));
    const dateB = new Date(b.dateTime.split(" - ").reverse().join(" "));
    // Ordena em ordem decrescente
    return dateB - dateA;
  });
  console.log("sortedList   ", sortedList);
  return sortedList;
};
