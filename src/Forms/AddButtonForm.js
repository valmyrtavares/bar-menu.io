import React from 'react';
import Input from '../component/Input.js';
import {
  fetchCategories,
  fetchCategoriesItem,
  fetchCategoriesButton,
} from '../api/Api.js';
import MenuButton from '../component/menuHamburguerButton.js';
import Title from '../component/title.js';
import { app } from '../config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/form.css';
import { Link } from 'react-router-dom';

function AddButtonForm({ dataObj, EditButtonTitle, setModalEditButton }) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    parent: '',
    display: 'true',
  });
  const [categories, setCategories] = React.useState([]);

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {    
    const fetchCategory = async () => {
      const grabCategory = await fetchCategoriesButton('item');     
      grabCategory.unshift('Selecione uma Categoria', 'main'); // Add a first option
      setCategories(grabCategory);
    };
    fetchCategory();
  }, []);

  React.useEffect(() => {
    const categories = fetchCategoriesButton('item');
  }, [dataObj]);

  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
    }
  }, [dataObj]);

  React.useEffect(() => {
    // Atualiza o valor de parent sempre que o título muda
    setForm(prevForm => ({
      ...prevForm,
      parent: returningParent(prevForm.title),
    }));
  }, [form.title]);

  function handleSubmit(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página
    if (!dataObj) {
      alert('this is pushing');
      addDoc(collection(db, 'button'), form)
        .then((docRef) => {
          setForm({
            title: '',
            category: '',
            parent: returningParent(''), 
            display: "true",
          });
          navigate('/');
          console.log("FORM   ", form)
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setDoc(doc(db, 'button', dataObj.id), form)
        .then(() => {
          console.log('Document successfully updated !');
          navigate('/');
        })
        .catch((error) => {
          console.log(error);
        });
      return;
    }
  }

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value, [id]: value, [id]: value });
  }

  function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  
  function returningParent(title) {    
    const words = title.split(' ');  
    let result = words.map(word => normalizeString(word).toLowerCase()).join('');
    return result
  }

  return (
    <div className="Edit-Add-Popup mt-2 p-3 bg-body-tertiar">
      <button onClick={returningParent}>TESTE</button>
      <div className="close-btn">
        {setModalEditButton ? (
          <button onClick={() => setModalEditButton(false)}>X</button>
        ) : (
          <Link to="/admin/admin">X</Link>
        )}
      </div>
      <Title
        mainTitle={EditButtonTitle ? EditButtonTitle : 'Adicione um novo botão'}
      />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="title"
          label="Título"
          value={form.title}
          type="text"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Categoria</label>
          <select
            id="category"
            className="form-select custom-select"
            value={form.category}
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
          id="parent"          
          value={form.parent}
          type="hidden"  
           
        />
        <Input
          id="display"          
          value={form.display}
          type="hidden"       
           
        />
        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}
export default AddButtonForm;
