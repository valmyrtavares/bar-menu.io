import React, { useEffect } from 'react';
import '../../assets/styles/item.css';

const DishesModal = ({ item, openmodal }) => {
  return (
    <div className="content-modal-dishes">
      <div>
        <button onClick={openmodal}>X</button>
      </div>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h4>Valor: R${item.price},00</h4>
      <button className="request-client">Faça o seu pedido</button>
    </div>
  );
};
export default DishesModal;
