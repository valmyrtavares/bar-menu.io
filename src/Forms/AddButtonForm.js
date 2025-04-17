import React from 'react';
import Input from '../component/Input.js';
import {
  fetchCategories,
  fetchCategoriesItem,
  fetchCategoriesButton,
} from '../api/Api.js';
import MenuButton from '../component/menuHamburguerButton.js';
import Title from '../component/title.js';
import { app, storage } from '../config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/form.css';
import style from '../assets/styles/AddButtonForm.module.scss';
import { Link } from 'react-router-dom';

function AddButtonForm({ dataObj, EditButtonTitle, setModalEditButton }) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    parent: '',
    display: 'true',
    image: '',
  });
  const [categories, setCategories] = React.useState([]);
  const [url, setUrl] = React.useState('');
  const [progress, setProgress] = React.useState(0);

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
    setForm((prevForm) => ({
      ...prevForm,
      parent: returningParent(prevForm.title),
    }));
  }, [form.title]);

  function handleSubmit(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página
    if (!dataObj) {
      addDoc(collection(db, 'button'), form)
        .then((docRef) => {
          setForm({
            title: '',
            category: '',
            parent: returningParent(''),
            display: 'true',
          });
          navigate('/');
          console.log('FORM   ', form);
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

  //Deletes all accents
  function normalizeString(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Trasform a sentence with 2 or 3 words in a unique word with no accents and no upper case
  function returningParent(title) {
    const words = title.split(' ');
    let result = words
      .map((word) => normalizeString(word).toLowerCase())
      .join('');
    return result;
  }

  const onfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = `button/${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress function (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error(error);
        },
        async () => {
          // Handle successful uploads
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          form.image = downloadURL;
        }
      );
    }
  };

  return (
    <div className={style.containerAddButtonForm}>
      <div className="close-btn">
        {setModalEditButton ? (
          <button onClick={() => setModalEditButton(false)}>X</button>
        ) : (
          <Link to="/admin/admin">X</Link>
        )}
      </div>
      <Link to="/admin/admin">
        <Title
          mainTitle={
            EditButtonTitle ? EditButtonTitle : 'Adicione um novo botão'
          }
        />
      </Link>
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="title"
          required
          label="Título"
          value={form.title}
          type="text"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Categoria</label>
          <select
            id="category"
            className="form-select"
            value={form.category}
            required
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Selecione uma categoria
            </option>
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <div className={style.hiddenInput}>
          <Input id="parent" value={form.parent} type="hidden" />
          <Input id="display" value={form.display} type="hidden" />
        </div>
        <Input
          id="image"
          label="Image"
          value={form.image}
          type="text"
          onChange={handleChange}
        />
        <div className={style.uploadImage}>
          <input type="file" onChange={onfileChange} />
          <progress value={progress} max="100" />
          {url && (
            <img className="image-preview" src={url} alt="Uploaded file" />
          )}
        </div>
        <div className={style.formButtonSubmit}>
          <button className="btn btn-primary">Enviar</button>
        </div>
      </form>
    </div>
  );
}
export default AddButtonForm;
