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

import style from '../assets/styles/AddSideDishesForm.module.scss';
import { updateItemsSideDishes, getBtnData } from '../api/Api';

function AddSideDishesForm({
  dataObj,
  EditSideDishesTitle,
  setModalEditSideDishes,
}) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    price: 0,
    portionUsed: '',
    sideDishes: '',
    costPriceObj: {},
  });
  const [noNavigate, setNoNavigate] = React.useState(false);
  const [hideShowCheckForm, setHideShowCheckForm] = React.useState(true);
  const [showPopupCostAndPrice, setShowPopupCostAndPrice] =
    React.useState(false);
  const [productList, setProductList] = React.useState(null);

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    if (dataObj) {
      setHideShowCheckForm(false);
    }

    const fetchProduct = async () => {
      const dataProduct = await getBtnData('stock');

      if (dataProduct && dataProduct.length > 0) {
        const sortedData = dataProduct.sort((a, b) =>
          a.product.localeCompare(b.product)
        );
        setProductList(sortedData);
      }
    };
    fetchProduct();
  }, []);

  const addPriceObj = (obj) => {
    obj.profit = obj.price - obj.cost;

    // Atualizando o estado de forma correta
    setForm((prevForm) => ({
      ...prevForm,
      costPriceObj: obj,
      price: obj.price,
    }));

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
    <div className={style.EditAddPopupContainer}>
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
      <Link to="/admin/admin">
        <Title
          mainTitle={
            EditSideDishesTitle
              ? EditSideDishesTitle
              : 'Adicione um novo Acompanhamento123'
          }
        />
      </Link>
      <form onSubmit={handleSubmit} className="m-1">
        <select
          id="sideDishes"
          value={form.sideDishes}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o acompanhamento</option>
          {productList &&
            productList.map((category, index) => (
              <option key={index} value={category.product}>
                {category.product}
              </option>
            ))}
        </select>
        <input
          id="portionUsed"
          required
          placeholder="Volume da porçao"
          value={form.portionUsed}
          type="text"
          onChange={handleChange}
        />
        <button
          className="btn btn-success"
          type="button"
          onClick={() => setShowPopupCostAndPrice(true)}
        >
          Preço R$ {form.price},00
        </button>
        <div className="sidedishes-btn-container ">
          <button className="btn btn-primary">Enviar</button>
        </div>
      </form>{' '}
      <div className={style.outform}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={updateItemsSideDishes}
        >
          Atualizar pratos
        </button>
        {hideShowCheckForm && (
          <div className="form-check my-1">
            <input
              className="form-check-input"
              id="carrossel"
              type="checkbox"
              checked={noNavigate}
              onChange={changeUrl}
            />
            <label className={style.formLabel}>
              Mantenha clicado se não quiser mudar de tela
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
export default AddSideDishesForm;
