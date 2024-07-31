import React from "react";
import "../../assets/styles/dishes.css";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { app } from "../../config-firebase/firebase.js";
import { useNavigate, Link } from "react-router-dom";
import CustomizedPrice from "./CustomizedPrice.js";

//React variables
const DishesModal = ({ item, setModal }) => {
  const [totalPrice, setTotalPrice] = React.useState(Number(item.price));
  const [currentUser, setCurrentUser] = React.useState("");
  const [disabledSelect, setDisabledSelect] = React.useState(true);
  const [form, setForm] = React.useState({
    name: item.title,
    id: item.id,
    finalPrice: Number(item.price),
    image: item.image,
  });
  const [itemOnScreen, setItemOnScreen] = React.useState("");
  const [sideDishesListOnScreen, setSideDishesListOnScreen] = React.useState(
    []
  );

  const navigate = useNavigate();
  const db = getFirestore(app);

  React.useEffect(() => {
    if (localStorage.hasOwnProperty("userMenu")) {
      const currentUserNew = JSON.parse(localStorage.getItem("userMenu"));
      setCurrentUser(currentUserNew.id);
    }
  }, [item]);

  //load side dishes on  screen
  React.useEffect(() => {
    if (itemOnScreen) {
      const arrayList = [...sideDishesListOnScreen, itemOnScreen];
      setSideDishesListOnScreen(arrayList);
      checkAmountOfsideDishes(arrayList);
    }
  }, [itemOnScreen]);

  React.useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      finalPrice: totalPrice,
    }));
  }, [totalPrice]);

  //select side dishes
  const selectMaximumNumberSideDishes = (e) => {
    const id = e.target.value;
    const selectedItem = item.sideDishesElementList[id];
    setTotalPrice(totalPrice + Number(selectedItem.price));

    setItemOnScreen(selectedItem.sideDishes);
  };

  //Check number of side dishes to disabled select
  const checkAmountOfsideDishes = (arrayList) => {
    if (arrayList.length == item.maxLimitSideDishes) {
      setDisabledSelect(false);
    } else {
      setDisabledSelect(true);
    }
  };

  //upload price
  function handleChange(e) {
    const additionalPrice = Number(e.target.value);
    if (e.target.checked) {
      setTotalPrice((prevTotal) => prevTotal + additionalPrice);
    } else {
      setTotalPrice((prevTotal) => prevTotal - additionalPrice);
    }
    // Atualiza o preço final no form sempre que um item é selecionado/desselecionado
    setForm((prevForm) => ({
      ...prevForm,
      finalPrice: totalPrice + additionalPrice,
    }));
  }

  const closeModal = () => {
    setModal(false);
    setItemOnScreen([]);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const userDocRef = doc(db, "user", currentUser);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Se o documento do usuário já existir, atualiza o array request
        await updateDoc(userDocRef, {
          request: arrayUnion(form),
        });
      } else {
        // Se o documento do usuário não existir, cria o documento com o array request
        await setDoc(userDocRef, {
          request: [form],
        });
      }

      setForm({
        name: item.title,
        id: item.id,
        finalPrice: Number(item.price),
        image: item.image,
      });

      navigate("/request");
    } catch (error) {
      console.log(error);
    }
  }
  function onPriceChange(price) {
    setTotalPrice(Number(price));
  }

  return (
    <div className="content-modal-dishes">
      <div className="close-btn">
        <button onClick={closeModal}>X</button>
      </div>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h4>Valor: R${totalPrice.toFixed(2)}</h4>
      {item.CustomizedPrice && (
        <CustomizedPrice
          item={item.CustomizedPrice}
          onPriceChange={onPriceChange}
        />
      )}
      <form className="my-3" onSubmit={handleSubmit}>
        {item.sideDishesElementList && (
          <>
            <h4>Selecione o seu acompanhamento</h4>
            <div
              className={
                item.maxLimitSideDishes === 0
                  ? "side-dishes-list"
                  : "limit-dishes"
              }
            >
              {item.maxLimitSideDishes == 0 ? (
                item.sideDishesElementList.map((sideDishItem, index) => (
                  <div key={index}>
                    <input
                      className="form-check-input"
                      id="carrossel"
                      value={sideDishItem.price}
                      type="checkbox"
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      {sideDishItem.sideDishes}
                    </label>
                  </div>
                ))
              ) : (
                <div className="select-limit-sidedishes">
                  {disabledSelect ? (
                    <select
                      id="sideDishesElement"
                      value={form.sideDishesElement}
                      className="form-select"
                      onChange={selectMaximumNumberSideDishes}
                    >
                      <option value="">Selecione um acompanhamento</option>
                      {item.sideDishesElementList &&
                        item.sideDishesElementList.map((item, index) => (
                          <option key={index} value={index}>
                            {" "}
                            {item.sideDishes}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <p>
                      O Numero máximo de acompanhamentos é{" "}
                      {item.maxLimitSideDishes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <div className="added-side-dishes">
          {sideDishesListOnScreen &&
            sideDishesListOnScreen.map((item) => <p>{item}</p>)}
        </div>
        <button className="request-client">Faça o seu pedido</button>
      </form>
    </div>
  );
};
export default DishesModal;
