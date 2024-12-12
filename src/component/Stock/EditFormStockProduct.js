import React from 'react';
import '../../assets/styles/EditFormStockProduct.css';
import CloseBtn from '../closeBtn';
import Input from '../Input';

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../config-firebase/firebase';

const EditFormStockProduct = ({ obj, setShowEditForm, fetchStock }) => {
  const [stockProductObj, setStockProductObj] = React.useState({
    CostPerUnit: Number(obj.CostPerUnit),
    amount: Number(obj.amount),
    product: obj.product,
    totalCost: Number(obj.totalCost),
    totalVolume: Number(obj.totalVolume),
    unitOfMeasurement: obj.unitOfMeasurement,
    volumePerUnit: Number(obj.volumePerUnit),
    id: obj.id,
  });

  const db = getFirestore(app);

  const updateCost = () => {
    const newCost =
      obj.totalCost * (stockProductObj.totalVolume / obj.totalVolume);

    const newUnit =
      Number(stockProductObj.totalVolume) / Number(obj.volumePerUnit);

    setStockProductObj({
      ...stockProductObj,
      totalCost: newCost,
      amount: newUnit,
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const parsedValue = Number(value);
    setStockProductObj((prevForm) => ({
      ...prevForm,
      [id]: isNaN(parsedValue) ? 0 : parsedValue, // Fallback para valores inválidos
    }));
  };

  const addItem = () => {
    const docRef = doc(db, 'stock', stockProductObj.id);
    updateDoc(docRef, stockProductObj) // Atualiza com os dados do estado "form"
      .then(() => {
        console.log('Documento atualizado com sucesso!');

        console.log('Documento atualizado com sucesso!');
        fetchStock();
        setShowEditForm(false);
      })
      .catch((error) => {
        console.error('Erro ao atualizar o documento:', error);
      });
  };
  return (
    <div className="popup-overlay">
      <div className="close-btn-container">
        <button
          className="close-btn"
          type="button"
          onClick={() => setShowEditForm(false)}
        >
          X
        </button>
      </div>
      <div className="container-edit-stock">
        <div className="field">
          <h3>Produto</h3>
          <p>{stockProductObj.product}</p>
        </div>
        <div className="field">
          <Input
            id="totalVolume"
            autoComplete="off"
            className="num"
            label="Volume Total"
            value={stockProductObj.totalVolume}
            type="number"
            onChange={handleChange}
            onBlur={updateCost}
          />
        </div>
        <div className="field">
          <h3>Custo Total</h3>
          <p>{stockProductObj.totalCost}</p>
        </div>
        <div className="field">
          <h3>Quantidade de recipientes</h3>
          <p>{stockProductObj.amount}</p>
        </div>
        <div className="field">
          <h3>Volume Total do Produto</h3>
          <p>
            {stockProductObj.totalVolume}
            {stockProductObj.unitOfMeasurement}
          </p>
        </div>
        <button className="add-btn" type="button" onClick={addItem}>
          Adicionar
        </button>
      </div>
    </div>
  );
};
export default EditFormStockProduct;
