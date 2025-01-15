import React, { useEffect } from 'react';
import Input from '../../Input';
import product from '../../../assets/styles/RegisterProduct.module.css';
import CloseBtn from '../../closeBtn';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase.js';
import { getBtnData, deleteData } from '../../../api/Api';

const RegisterProvider = ({ setShowPopup }) => {
  const [form, setForm] = React.useState({
    name: '',
    minimumAmount: '',
    unitOfMeasurement: '',
  });
  const [listProvider, setListProvider] = React.useState(null);
  const [refreshScreen, setRefreshScreen] = React.useState(false);
  const [editForm, setEditForm] = React.useState(false);
  const [id, setId] = React.useState(null);

  const db = getFirestore(app);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, []);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, [refreshScreen]);

  const deleteItem = (item) => {
    deleteData('product', item.id);
    setRefreshScreen((prev) => !prev);
  };

  const EditItem = (item) => {
    setEditForm(true);
    setId(item.id);
    setForm({
      name: item.name,
      minimumAmount: item.minimumAmount,
      unitOfMeasurement: item.unitOfMeasurement,
    });
  };

  const fetchProvider = async () => {
    const data = await getBtnData('product');
    console.log('DATA ', data);
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortedData && sortedData.length > 0) {
      setListProvider(sortedData);
    }
  };

  const renderTableItem = () => {
    if (listProvider && listProvider.length > 0) {
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Volume mínimo</th>
            <th>Unidade de medida</th>
            <th>Editar</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {listProvider &&
            listProvider.length > 0 &&
            listProvider.map((requestItem, index) => (
              <tr key={index}>
                <td>{requestItem.name}</td>
                <td>{requestItem.minimumAmount || 0}</td>
                <td>{requestItem.unitOfMeasurement}</td>
                <td onClick={() => EditItem(requestItem)}>Editar</td>
                <td onClick={() => deleteItem(requestItem)}>X</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editForm) {
      const documentRef = doc(db, 'product', id);
      setDoc(documentRef, form)
        .then(() => {
          console.log('Document successfully updated !');
          fetchProvider();
          setEditForm(false);
        })
        .catch((error) => {
          console.error('Error updating document:', error);
        });
      return;
    }

    addDoc(collection(db, 'product'), form)
      .then(() => {
        setRefreshScreen((prev) => !prev);
        setForm({
          name: '',
          unitOfMeasurement: '',
          minimumAmount: '',
        });
      })
      .catch((error) => {
        console.error('Error adding document:', error);
      });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  return (
    <div className={product.ContainerAddProviderForm}>
      <CloseBtn setClose={setShowPopup} />

      <h1>Adicione um novo Produto</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className={product.containerInputs}>
          <Input
            id="name"
            autoComplete="off"
            required
            label="Nome"
            value={form.name}
            type="text"
            onChange={handleChange}
          />

          <Input
            id="minimumAmount"
            autoComplete="off"
            required
            label="Volume mínimo"
            value={form.minimumAmount}
            type="text"
            onChange={handleChange}
          />
          <div className="select-form">
            <label></label>
            <select
              id="unitOfMeasurement"
              className="form-select unitOfMeasurement"
              value={form.unitOfMeasurement}
              required
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Unidade de medida
              </option>
              <option value="un"> Unidade</option>
              <option value="L"> Litro</option>
              <option value="ml"> Mililitro</option>
              <option value="kg"> Kilo</option>
              <option value="g"> Gramas</option>
            </select>
          </div>
        </div>
        <div className={product.containerBtn}>
          <button className={product.btn}>
            {editForm ? 'Mandar alterações' : 'Enviar'}
          </button>
        </div>
      </form>
      {listProvider && renderTableItem()}
    </div>
  );
};
export default RegisterProvider;
