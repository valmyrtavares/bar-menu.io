import React, { useEffect } from 'react';
import Input from '../../Input';
import '../../../assets/styles/AddExpensesForm.css';
import CloseBtn from '../../closeBtn';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase';

const RegisterProvider = ({ setShowPopup, setRefreshData, obj }) => {
  const [form, setForm] = React.useState({
    name: '',
    value: 0,
    dueDate: '',
    paymentDate: '',
    category: '',
    account: '',
    provider: '',
    confirmation: 0,
  });

  const [item, setItem] = React.useState({
    product: '',
    amount: 0,
    CostPerUnit: 0,
    totalCost: 0,
    volumePerUnit: 0,
    unitOfMeasurement: '',
  });
  const [itemArrayList, setItemArrayList] = React.useState([]);
  const db = getFirestore(app);

  React.useEffect(() => {
    if (obj) {
      setForm({
        name: obj.name,
        value: obj.value,
        dueDate: obj.dueDate,
        paymentDate: obj.paymentDate,
        category: obj.category,
        confirmation: obj.confirmation,
      });
    } else {
      setForm({
        name: '',
        value: 0,
        dueDate: '',
        paymentDate: '',
        category: '',
        confirmation: 0,
      });
    }
  }, [obj]);

  const addItem = () => {
    if (item.product !== '') {
      setItemArrayList((prevArrayList) => [...prevArrayList, item]);
    }
    setItem({
      product: '',
      amount: 0,
      CostPerUnit: 0,
      totalCost: 0,
      volumePerUnit: 0,
      unitOfMeasurement: '',
    });
  };
  const deleteItem = (indexToRemove) => {
    console.log('index removido  ', indexToRemove);
    const removeItemByIndex = (item, index) => {
      return itemArrayList.filter((_, index) => index !== indexToRemove);
    };
    console.log();
    setItemArrayList((prevArrayList) => [...prevArrayList, removeItemByIndex]);
  };

  useEffect(() => {
    if (itemArrayList) {
      console.log('Arrau de itens   ', itemArrayList);
    }
    renderTableItem();
  }, [itemArrayList]);

  const renderTableItem = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Custo por unidade</th>
            <th>Custo Total</th>
            <th>Volume</th>
            <th>Unidade de medida</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {itemArrayList &&
            itemArrayList.length > 0 &&
            itemArrayList.map((requestItem, index) => (
              <tr key={index}>
                <td>{requestItem.product}</td>
                <td>{requestItem.amount}</td>
                <td>{requestItem.CostPerUnit}</td>
                <td>{requestItem.totalCost}</td>
                <td>{requestItem.volumePerUnit}</td>
                <td>{requestItem.unitOfMeasurement}</td>
                <td onClick={() => deleteItem(index)}>X</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (obj) {
      const docRef = doc(db, 'outgoing', obj.id);
      updateDoc(docRef, form) // Atualiza com os dados do estado "form"
        .then(() => {
          console.log('Documento atualizado com sucesso!');
          setRefreshData((prev) => !prev); // Atualiza a interface, se necessário
          console.log('Documento atualizado com sucesso!');
          setShowPopup(false);
          setForm({
            name: '',
            value: 0,
            dueDate: '',
            paymentDate: '',
            category: '',
            confirmation: 0,
          });
          obj = null;
          console.log('OBJ  ', obj);
        })
        .catch((error) => {
          console.error('Erro ao atualizar o documento:', error);
        });
    } else {
      addDoc(collection(db, 'outgoing'), form).then(() => {
        setRefreshData((prev) => !prev);
        setShowPopup(false);
        setForm({
          name: '',
          value: 0,
          dueDate: '',
          paymentDate: '',
          category: '',
          confirmation: 0,
        });
        obj = null;
        console.log('OBJ  ', obj);
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const handleItemChange = (e) => {
    const { id, value } = e.target;

    setItem((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };
  const handleFocus = () => {
    console.log('To aqui');
  };
  return (
    <div className="container-add-expenses-form">
      <CloseBtn setClose={setShowPopup} />

      <h1>Adicione uma nova despesa</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className="form-product">
          <Input
            id="name"
            autoComplete="off"
            required
            label="Nome"
            value={form.name}
            type="text"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="value"
            autoComplete="off"
            required
            label="Valor"
            value={form.value}
            type="number"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="dueDate"
            autoComplete="off"
            required
            label="Vencimento"
            value={form.dueDate}
            type="text"
            onFocus={handleFocus}
            onChange={handleChange}
          />

          <Input
            id="paymentDate"
            autoComplete="off"
            required
            label="Data Pagamento"
            value={form.paymentDate}
            type="text"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="confirmation"
            autoComplete="off"
            required
            label="Confirmação"
            value={form.confirmation}
            type="number"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="provider"
            autoComplete="off"
            className="provider"
            required
            label="Fornecedor"
            value={form.provider}
            type="text"
            onChange={handleItemChange}
          />
          <Input
            id="account"
            autoComplete="off"
            className="account"
            required
            label="Nota fiscal"
            value={form.account}
            type="text"
            onChange={handleItemChange}
          />
          <div className="select-form">
            <label></label>
            <select
              id="category"
              className="form-select custom-select"
              value={form.category}
              required
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Selecione o tipo de custo
              </option>
              <option value="fixed">Fixo</option>
              <option value="variable"> Variável</option>
            </select>
          </div>
        </div>
        <fieldset>
          <legend>Adicionar Item</legend>
          <Input
            id="product"
            autoComplete="off"
            className="product"
            required
            label="Produto"
            value={item.product}
            type="text"
            onChange={handleItemChange}
          />
          <Input
            id="amount"
            autoComplete="off"
            className="num"
            required
            label="Quantidade"
            value={item.amount}
            type="number"
            onChange={handleItemChange}
          />
          <Input
            id="CostPerUnit"
            autoComplete="off"
            className="num"
            required
            label="Custo por un"
            value={item.CostPerUnit}
            type="number"
            onChange={handleItemChange}
          />
          <Input
            id="totalCost"
            autoComplete="off"
            className="num"
            required
            label="Custo Total"
            value={item.totalCost}
            type="number"
            onChange={handleItemChange}
          />

          <Input
            id="volumePerUnit"
            autoComplete="off"
            className="num"
            required
            label="Volume por unidade"
            value={item.volumePerUnit}
            type="number"
            onChange={handleItemChange}
          />
          <div className="select-form">
            <label></label>
            <select
              id="unitOfMeasurement"
              className="form-select unitOfMeasurement"
              value={item.unitOfMeasurement}
              required
              onChange={handleItemChange}
            >
              <option value="" disabled hidden>
                Unidade de medida
              </option>
              <option value="litle">Litro</option>
              <option value="unit"> Unidade</option>

              <option value="ml"> ml</option>
              <option value="kg"> kilos</option>
              <option value="g"> Gramas</option>
            </select>
          </div>
          <button type="button" onClick={addItem}>
            Adicionar
          </button>
        </fieldset>
        <button>Enviar</button>
      </form>
      {item && renderTableItem()}
    </div>
  );
};
export default RegisterProvider;
