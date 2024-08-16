import React from "react";
//import "../../assets/styles/dishes.css";

//React variables
const CheckDishesModal = ({ item, setModal }) => {
  const closeModal = () => {
    setModal(false);
  };

  return (
    <div className="content-modal-dishes">
      <div className="close-btn">
        <button onClick={closeModal}>X</button>
      </div>
      <h1>{item.name}</h1>
      <img src={item.image} alt="img" />
    </div>
  );
};
export default CheckDishesModal;
