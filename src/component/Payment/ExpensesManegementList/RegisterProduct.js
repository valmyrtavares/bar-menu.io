import React, { useEffect } from 'react';
import Input from '../../Input';
import product from '../../../assets/styles/RegisterProduct.module.scss';
import CloseBtn from '../../closeBtn';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase.js';
import { getBtnData, deleteData } from '../../../api/Api';
import WarningMessage from '../../WarningMessages.js';

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
  const [oldName, setOldName] = React.useState('');
  const [warningMsg, setWarningMsg] = React.useState(false);
  const [productSelectedToExclude, setProductSelectedToExclude] =
    React.useState(null);

  const db = getFirestore(app);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, []);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, [refreshScreen]);

  const keepDeleting = () => {
    deleteItem(productSelectedToExclude, true);
  };

  const deleteItem = (item, permissionToExclude = false) => {
    setProductSelectedToExclude(item);
    setWarningMsg(true);
    if (permissionToExclude) {
      deleteData('product', item.id);
      setRefreshScreen((prev) => !prev);
      setWarningMsg(false);
    }
  };

  const EditItem = (item) => {
    setEditForm(true);
    setId(item.id);
    setOldName(item.name);
    setForm({
      name: item.name,
      minimumAmount: item.minimumAmount,
      unitOfMeasurement: item.unitOfMeasurement,
    });
  };

  const fetchProvider = async () => {
    const data = await getBtnData('product');
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortedData && sortedData.length > 0) {
      setListProvider(sortedData);
    }
  };

  const renderTableItem = () => {
    if (listProvider && listProvider.length > 0) {
    }
    return (
      <div className={product.containerProductRegisterTable}>
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
                  <td
                    className={product.edit}
                    onClick={() => EditItem(requestItem)}
                  >
                    Editar
                  </td>
                  <td
                    className={product.exclude}
                    onClick={() => deleteItem(requestItem)}
                  >
                    X
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editForm) {
      const documentRef = doc(db, 'product', id);

      // Limpar o objeto `form` para remover valores `undefined`
      const cleanedForm = {};
      for (const key in form) {
        if (form[key] !== undefined && form[key] !== null) {
          cleanedForm[key] = form[key];
        }
      }

      const stockQuery = query(
        collection(db, 'stock'),
        where('product', '==', oldName)
      );

      const stockSnapshot = await getDocs(stockQuery);

      if (!stockSnapshot.empty) {
        for (const docSnap of stockSnapshot.docs) {
          const stockRef = doc(db, 'stock', docSnap.id);
          const stockData = docSnap.data();

          const updatedData = {
            ...stockData,
            product: form.name,
            unitOfMeasurement: form.unitOfMeasurement,
          };

          // Adicionar `minimumAmount` somente se tiver um valor válido
          if (form.minimumAmount !== undefined && form.minimumAmount !== null) {
            updatedData.minimumAmount = form.minimumAmount;
          }

          await updateDoc(stockRef, updatedData);
          console.log(`SideDishes item updated successfully: ${docSnap.id}`);
        }
      }

      const sideDishesQuery = query(
        collection(db, 'sideDishes'),
        where('sideDishes', '==', oldName)
      );
      const sideDishesSnapshot = await getDocs(sideDishesQuery);

      if (!sideDishesSnapshot.empty) {
        for (const docSnap of sideDishesSnapshot.docs) {
          const sideDishesRef = doc(db, 'sideDishes', docSnap.id);
          const sideDishesData = docSnap.data();

          const updateData = {
            ...sideDishesData,
            sideDishes: form.name,
            unitOfMeasurement: form.unitOfMeasurement,
          };

          if (
            form.unitOfMeasurement !== undefined &&
            form.unitOfMeasurement !== null
          ) {
            updateData.unitOfMeasurement = form.minimumAmount;
          }

          // Atualizar os campos em `sideDishes`
          await updateDoc(sideDishesRef, updateData);
          console.log(`Stock item updated successfully: ${docSnap.id}`);
        }
      }

      await setDoc(documentRef, cleanedForm)
        .then(() => {
          console.log('Document successfully updated !');
          fetchProvider();
          setEditForm(false);
          setForm({
            name: '',
            minimumAmount: '',
            unitOfMeasurement: '',
          });
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
      <div className={product.containerWaringMessage}>
        {warningMsg && (
          <WarningMessage
            setWarningMsg={setWarningMsg}
            message={`Você está prestes a excluir ${productSelectedToExclude.name}`}
            sendRequestToKitchen={keepDeleting}
          />
        )}
      </div>
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
