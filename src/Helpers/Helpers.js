import React from "react";
import { getBtnData } from "../api/Api";

export function getFirstFourLetters(inputString) {
  return inputString.slice(0, 4);
}

export async function CheckUser(check) {
  if (localStorage.hasOwnProperty(check)) {
    const userMenu = JSON.parse(localStorage.getItem(check));
    const userList = await getBtnData("user");
    const currentUser = userList.filter((item) => item.id === userMenu.id);
    if (currentUser && currentUser.length > 0 && currentUser[0].name) {
      console.log(currentUser);
      return "/";
    } else {
      return "/create-customer";
    }
  } else {
    return "/create-customer";
  }
}
