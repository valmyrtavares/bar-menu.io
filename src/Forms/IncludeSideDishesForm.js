import React from 'react';
import { getBtnData } from '../api/Api.js';
import Title from '../component/title.js';
import style from '../assets/styles/includeSideDishesForm.module.scss';
import Input from '../component/Input.js';

function IncludeSideDishesForm({
  setShowPopupSideDisehs,
  setNewSideDishesList,
  newSideDishesList,
  setMaxLimitSideDishes,
  maxLimitSideDishes,
  closeModal,
}) {
  //React Data
  const [form, setForm] = React.useState({
    sideDishesElement: '',
  }); //Use State Obj
  const [selectedSideDishes, setSelectedSideDishes] = React.useState([]);
  const [sideDishes, setSideDishes] = React.useState([]); //Array que recebe os dados do Fetch

  //Load the component
  React.useEffect(() => {
    fetchDataSideDishes();
  }, []);

  React.useEffect(() => {
    if (newSideDishesList.length > 0) {
      setSelectedSideDishes(newSideDishesList);
    }
    if (maxLimitSideDishes) {
      setMaxLimitSideDishes(Number(maxLimitSideDishes));
    }
  }, []);

  //Fetch
  const fetchDataSideDishes = async () => {
    const data = await getBtnData('sideDishes');

    // data.unshift({ sideDishes: "Selecione uma categoria", price: 0, id: "" });
    setSideDishes(data);
  };

  //Selected items in Select
  const selectSideDishes = (e) => {
    const selectedId = e.target.value; //Take the id object
    const selectedDish = sideDishes.find((item) => item.id === selectedId); //Find the id object inside of original Array and grag intire object inside of selectedDish Array
    if (
      selectedDish &&
      !selectedSideDishes.some((dish) => dish.id === selectedId) // It is a intersting way to check out if there is ond item inside another
    ) {
      const newDish = {
        id: selectedDish.id,
        price: selectedDish.price,
        portionUsed: selectedDish.portionUsed,
        totalVolume: selectedDish.totalVolume || 0,
        totalCost: selectedDish.totalCost || 0,
        portionCost: selectedDish.portionCost || 0,
        costPerUnit: selectedDish.costPerUnit || 0,
        unit: selectedDish.unit || '',
        sideDishes: selectedDish.sideDishes,
        ...(selectedDish.costPriceObj && {
          costPriceObj: selectedDish.costPriceObj,
        }),
      };
      setSelectedSideDishes([...selectedSideDishes, newDish]); // If there is no similar id inside of  selectedSideDishes this new object is adding in selectedSideDishes
      setNewSideDishesList([...newSideDishesList, newDish]); // It is a way to update the newSideDishesList with the new object
    }
  };

  //Removed items of list
  const removeSideDish = (id) => {
    setSelectedSideDishes(selectedSideDishes.filter((dish) => dish.id !== id)); //It search for some dish.id wiht id param
  };
  //Envia lista de acompanhamentos e fecha o modal
  const sendArrayList = () => {
    setShowPopupSideDisehs(false);
    setNewSideDishesList(selectedSideDishes);
  };

  const handleChange = ({ target }) => {
    const { value } = target;
    if (value < 0) {
      setMaxLimitSideDishes(Math.abs(value));
    } else {
      setMaxLimitSideDishes(value);
    }
  };

  return (
    <div className={style.includeSideDishesContainer}>
      <div className="close-btn">
        <button onClick={() => setShowPopupSideDisehs(false)}>X</button>
      </div>
      <Title mainTitle="Formulário de acompanhamentos" />
      {sideDishes && (
        <div className="my-3">
          <label>Selecione os acompanhamentos do prato</label>
          <select
            id="sideDishesElement"
            value={form.sideDishesElement}
            className="form-select"
            onChange={(e) => {
              selectSideDishes(e);
              setForm({ ...form, sideDishesElement: e.target.value });
            }}
          >
            <option value="">Selecione </option>
            {sideDishes.map((item, index) => (
              <option key={index} value={item.id}>
                {' '}
                {item.sideDishes}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="selected-dishes">
        {selectedSideDishes.map((dish) => (
          <div key={dish.id} className="selected-item">
            <p>{dish.sideDishes}</p>
            <button onClick={() => removeSideDish(dish.id)}>x</button>
          </div>
        ))}
      </div>
      <Input
        id="limitSideDishes"
        label="Quantidade máxima de acompanhamentos"
        value={maxLimitSideDishes}
        type="number"
        onChange={handleChange}
      />
      <div className={style.formButtonSubmit}>
        <button onClick={sendArrayList}>Adicionar </button>
      </div>
    </div>
  );
}
export default IncludeSideDishesForm;
