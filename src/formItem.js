import React from 'react';
import { fetchCategoriesItem } from './api/buttonApi';
import Input from './component/Input';
import Title from './component/title';
import { app } from './config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function FormItem({ dataObj }) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    comment: '',
    price: 0,
    image: '',
    display: false,
    carrossel: false,
  });
  const [categories, setCategories] = React.useState([]);

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
    }
  }, [dataObj]);

  const fetchCategories = async () => {
    const categories = await fetchCategoriesItem('button');
    categories.unshift('Selecione uma categoria'); // Add a first option
    setCategories(categories);
  };

  function handleChange({ target }) {
    const { id, value, type, checked } = target;

    if (type === 'checkbox') {
      setForm({
        ...form,
        [id]: checked, // Use checked diretamente, que já é um booleano
      });
    } else {
      setForm({
        ...form,
        [id]: value,
      });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!dataObj) {
      addDoc(collection(db, 'item'), form)
        .then((docRef) => {
          console.log(docRef.id);
          navigate('/');
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setDoc(doc(db, 'item', dataObj.id), form)
        .then(() => {
          console.log('Document successfully updated !');
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Title title="Adicione um novo prato" />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="title"
          label="Titulo"
          value={form.title}
          type="text"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Categoria</label>
          <select
            id="category"
            value={form.category}
            className="form-select"
            onChange={handleChange}
          >
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <Input
          id="comment"
          label="Comentário"
          value={form.comment}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="price"
          label="Preço"
          value={form.price}
          type="number"
          onChange={handleChange}
        />
        <Input
          id="image"
          label="Image"
          value={form.image}
          type="text"
          onChange={handleChange}
        />
        <div className="form-check my-5">
          <input
            className="form-check-input"
            id="carrossel"
            type="checkbox"
            checked={form.carrossel}
            onChange={handleChange}
          />
          <label className="form-check-label">
            Adicionar item ao carrossel
          </label>
        </div>
        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}
export default FormItem;
