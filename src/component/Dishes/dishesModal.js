import React, { useEffect } from 'react';
import '../../assets/styles/item.css';

const DishesModal = ({ item, openmodal }) => {
  useEffect(() => {
    console.log('ITEM   ', item.title);
  }, [item]);

  return (
    <div className="content-modal-dishes">
      <div>
        <button onClick={openmodal}>X</button>
      </div>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h3>Valor: R${item.price},00</h3>
    </div>
  );
};
export default DishesModal;
