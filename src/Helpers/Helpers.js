import React from "react";

export function getFirstFourLetters(inputString) {
  return inputString.slice(0, 4);
}

export function useModal() {
  const [openModals, setOpenModals] = React.useState({});

  const toggle = (id) => {
    setOpenModals((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isOpen = (id) => !!openModals[id];

  return { isOpen, toggle };
}
