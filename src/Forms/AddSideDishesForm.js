import React from 'react';
import Title from '../component/title.js';
import { app, storage } from '../config-firebase/firebase.js';

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
    costPerUnit: '',
    sideDishes: '',
    portionCost: '',
    unit: '',
    totalVolume: '',
    totalCost: '',
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

    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const dataProduct = await getBtnData('stock');

    if (dataProduct && dataProduct.length > 0) {
      const sortedData = dataProduct.sort((a, b) =>
        a.product.localeCompare(b.product)
      );
      setProductList(sortedData);
    }
  };

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

  //After used delete this useEffect
  React.useEffect(() => {
    console.log('Form atualizado    ', form);
  }, [form]);

  function handleChange({ target }) {
    const { id, value } = target;

    const newForm = {
      ...form,
      [id]: value,
    };

    // Recalcular portionCost sempre que qualquer valor mudar
    const portionCost = Number(newForm.portionUsed) * Number(newForm.price);

    if (id === 'sideDishes') {
      const itemSelected = productList.find((item) => item.product === value);

      if (itemSelected) {
        setForm({
          ...newForm,
          sideDishes: itemSelected.product,
          unit: itemSelected.unitOfMeasurement,
          totalVolume: itemSelected.totalVolume,
          totalCost: itemSelected.totalCost,
          portionCost,
          costPriceObj: {
            ...form.costPriceObj,
            cost: portionCost,
          },
        });
      } else {
        setForm({
          ...newForm,
          sideDishes: '',
          unit: '',
          portionCost,
          costPriceObj: {
            ...form.costPriceObj,
            cost: portionCost,
          },
        });
      }
    } else {
      setForm({
        ...newForm,
        portionCost,
        costPriceObj: {
          ...form.costPriceObj,
          cost: portionCost,
        },
      });
    }
  }

  function isFormComplete(form) {
    return (
      form.sideDishes &&
      form.portionUsed &&
      form.totalVolume &&
      form.totalCost &&
      form.unit &&
      form.portionCost &&
      form.costPriceObj &&
      typeof form.costPriceObj.cost === 'number'
    );
  }

  function buildFormWithComputedData(form, productList) {
    if (!form.sideDishes || !form.portionUsed) return form;

    const itemSelected = productList.find(
      (item) => item.product === form.sideDishes
    );

    // Arredondar para 2 casas decimais
    const totalVolume = form.totalVolume
      ? parseFloat(parseFloat(form.totalVolume).toFixed(2))
      : parseFloat(parseFloat(itemSelected?.totalVolume || '1').toFixed(2));

    const totalCost = form.totalCost
      ? parseFloat(parseFloat(form.totalCost).toFixed(2))
      : parseFloat(parseFloat(itemSelected?.totalCost || '0').toFixed(2));

    const unit = form.unit || itemSelected?.unitOfMeasurement || '';
    if (
      isNaN(totalVolume) ||
      totalVolume <= 0 ||
      isNaN(totalCost) ||
      totalCost <= 0
    ) {
      alert(
        'O acompanhamento selecionado parece estar com volume ou custo inválido.\n' +
          'Verifique se o produto ainda está disponível no estoque e atualize ou remova o acompanhamento.'
      );
      return form;
    }

    let portionCost = form.portionCost;
    const portionUsed = parseFloat(form.portionUsed || '1'); // Convertido para número

    if (!portionCost && totalVolume > 0 && totalCost > 0) {
      const costPerUnit = parseFloat((totalCost / totalVolume).toFixed(2));
      portionCost = parseFloat((costPerUnit * portionUsed).toFixed(2));
    }

    return {
      ...form,
      totalVolume,
      totalCost,
      portionUsed, // agora como número
      unit,
      portionCost,
      costPriceObj: {
        ...form.costPriceObj,
        cost: portionCost,
      },
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const enrichedForm = isFormComplete(form)
      ? form
      : buildFormWithComputedData(form, productList);
    //     if(en  enrichedForm.portionCost > enrichedForm.price)
    if (!dataObj) {
      if (form.price && form.sideDishes) {
        addDoc(collection(db, 'sideDishes'), enrichedForm)
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
      setDoc(doc(db, 'sideDishes', dataObj.id), enrichedForm)
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
      <div className={style.editCloseButton}>
        <button onClick={() => setModalEditSideDishes(false)}>X</button>
      </div>
      <Link to="/admin/admin">
        <Title
          mainTitle={
            EditSideDishesTitle
              ? EditSideDishesTitle
              : 'Adicione um novo Acompanhamento'
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
