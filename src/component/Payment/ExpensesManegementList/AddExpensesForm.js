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
  const handleFocus = () => {
    console.log('To aqui');
  };
  return (
    <div className="container-add-expenses-form">
      <CloseBtn setClose={setShowPopup} />
      <div>
        <h1>Adicione uma nova despesa</h1>
      </div>
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="name"
          autocomplete="off"
          required
          label="Nome"
          value={form.name}
          type="text"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <Input
          id="value"
          autocomplete="off"
          required
          label="Valor"
          value={form.value}
          type="number"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <Input
          id="dueDate"
          autocomplete="off"
          required
          label="Vencimento"
          value={form.dueDate}
          type="text"
          onFocus={handleFocus}
          onChange={handleChange}
        />

        <div className="select-form">
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
          autocomplete="off"
          required
          label="Data Pagamento"
          value={form.paymentDate}
          type="text"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <Input
          id="confirmation"
          autocomplete="off"
          required
          label="Confirmação"
          value={form.confirmation}
          type="number"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        <button>Enviar</button>
      </form>
    </div>
  );
};
export default AddExpensesForm;
