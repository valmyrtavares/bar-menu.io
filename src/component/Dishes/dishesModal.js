import React, { useEffect } from "react";
import Input from "../Input";
import "../../assets/styles/dishes.css";
import { cardClasses } from "@mui/material";

const DishesModal = ({ item, openmodal }) => {
  React.useEffect(() => {
    console.log(item);
  });
  function handleChange() {
    console.log(item);
  }
  return (
    <div className="content-modal-dishes">
      <div className="close-btn">
        <button onClick={openmodal}>X</button>
      </div>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h4>Valor: R${item.price},00</h4>
      <form className="my-3">
        <h4>Selecione o seu acompanhamento</h4>
        <div className="side-dishes-list">
          {item.sideDishesElementList &&
            item.sideDishesElementList.map((item, index) => (
              <div key={index}>
                <input
                  className="form-check-input"
                  id="carrossel"
                  type="checkbox"
                  onChange={handleChange}
                />
                <label className="form-check-label">{item.sideDishes}</label>
              </div>
            ))}
        </div>
        <button className="request-client">Faça o seu pedido</button>
      </form>
    </div>
  );
};
export default DishesModal;
