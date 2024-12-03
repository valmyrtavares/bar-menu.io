import React from 'react';
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

const AddExpensesForm = ({ setShowPopup, setRefreshData, obj }) => {
  const [form, setForm] = React.useState({
    name: '',
    value: 0,
    dueDate: '',
    paymentDate: '',
    category: '',
    confirmation: 0,
  });

  const [item, setItem] = React.useState({
    product: '',
    amout: 0,
    CostPerUnit: 0,
    totalCost: 0,
    provider: '',
    account: '',
    volumePerUnit: 0,
    unitOfMeasurement: '',
  });
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
    if (item) {
      console.log('ITEM ADICIONADO  ', item);
    }
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
            id="amout"
            autoComplete="off"
            className="num"
            required
            label="Quantidade"
            value={item.amout}
            type="number"
            onChange={handleItemChange}
          />
          <Input
            id="CostPerUnit"
            autoComplete="off"
            className="num"
            required
            label="Custo por un"
            value={form.CostPerUnit}
            type="number"
            onChange={handleItemChange}
          />
          <Input
            id="totalCost"
            autoComplete="off"
            className="num"
            required
            label="Custo Total"
            value={form.totalCost}
            type="number"
            onChange={handleItemChange}
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
          <Input
            id="volumePerUnit"
            autoComplete="off"
            className="num"
            required
            label="Volume por unidade"
            value={form.volumePerUnit}
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
              <option value="fixed">Fixo</option>
              <option value="variable"> Variável</option>
            </select>
          </div>
          <button type="button" onClick={addItem}>
            Adicionar
          </button>
        </fieldset>
        <button>Enviar</button>
      </form>
    </div>
  );
};
export default AddExpensesForm;
