import React from 'react';
import Input from '../component/Input.js';
import Title from '../component/title.js';
import { app, storage } from '../config-firebase/firebase.js';
import MenuButton from '../component/menuHamburguerButton.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import PriceAndExpenseBuilder from '../component/Payment/PriceAndExpenseBuilder';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/styles/form.css';
import { updateItemsSideDishes } from '../api/Api';
//import { cardClasses } from "@mui/material";

function AddSideDishesForm({
  dataObj,
  EditSideDishesTitle,
  setModalEditSideDishes,
}) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    price: 0,
    sideDishes: '',
    costPriceObj: {},
  });
  const [noNavigate, setNoNavigate] = React.useState(false);
  const [hideShowCheckForm, setHideShowCheckForm] = React.useState(true);
  const [showPopupCostAndPrice, setShowPopupCostAndPrice] =
    React.useState(true);

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    if (dataObj) {
      setHideShowCheckForm(false);
    }
  }, []);

  const addPriceObj = (obj) => {
    obj.profit = obj.price - obj.cost;
    console.log('Objeto recebido   ', obj);

    // Atualizando o estado de forma correta
    setForm((prevForm) => ({
      ...prevForm,
      costPriceObj: obj,
      price: obj.price,
    }));
    console.log('form atualizado   ', form);
    setShowPopupCostAndPrice(false);
  };

  React.useEffect(() => {
    console.log('Form atualizado    ', form);
  }, [form]);

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!dataObj) {
      if (form.price && form.sideDishes) {
        addDoc(collection(db, 'sideDishes'), form)
          .then((docRef) => {
            if (!noNavigate) {
              navigate('/admin/editButton/sidedishes');
            } else {
              setForm({ price: 0, sideDishes: '' });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      setDoc(doc(db, 'sideDishes', dataObj.id), form)
        .then(() => {
          console.log('Document successfully updated !');
          setModalEditSideDishes(false);
        })
        .catch((error) => {
          console.log(error);
        });
      return;
    }
  }
  function changeUrl() {
    setNoNavigate(!noNavigate);
  }
  // Bring the data from listToEditAndDelete to form local
  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
    }
  }, [dataObj]);

  return (
    <div className="Edit-Add-Popup mt-5 p-3 bg-body-tertiar">
      {showPopupCostAndPrice && (
        <PriceAndExpenseBuilder
          setShowPopupCostAndPrice={setShowPopupCostAndPrice}
          addPriceObj={addPriceObj}
          objPriceCost={form.costPriceObj}
        />
      )}
      <div className="close-btn">
        <Link to="/admin/admin">X</Link>
      </div>
      <Title
        mainTitle={
          EditSideDishesTitle
            ? EditSideDishesTitle
            : 'Adicione um novo Acompanhamento'
        }
      />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="sideDishes"
          required
          label="Acompanhamento"
          value={form.sideDishes}
          type="text"
          onChange={handleChange}
        />
        {/* <Input
          id="price"
          label="Valor"
          value={form.price}
          type="text"
          onChange={handleChange}
        /> */}
        <button
          className="btn btn-success"
          type="button"
          onClick={() => setShowPopupCostAndPrice(true)}
        >
          Preço R$ {form.price},00
        </button>
        <div className="sidedishes-btn-container ">
          <button className="btn btn-primary">Enviar</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={updateItemsSideDishes}
          >
            Atualizar pratos
          </button>
        </div>
      </form>{' '}
      {hideShowCheckForm && (
        <div className="form-check my-1">
          <input
            className="form-check-input"
            id="carrossel"
            type="checkbox"
            checked={noNavigate}
            onChange={changeUrl}
          />
          <label className="form-check-label">
            Mantenha clicado se não quiser mudar de tela
          </label>
        </div>
      )}
    </div>
  );
}
export default AddSideDishesForm;
