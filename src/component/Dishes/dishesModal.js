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
    sideDishes: [],
  });
  const [itemOnScreen, setItemOnScreen] = React.useState("");
  const [sideDishesListOnScreen, setSideDishesListOnScreen] = React.useState(
    []
  );
  const [radioDisabled, setRadioDisabled] = React.useState(false);

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
      const arrayList = [...sideDishesListOnScreen, itemOnScreen]; //itemOnScreen is add in sideDishesOnScreen, it is the new
      setSideDishesListOnScreen(arrayList);
      checkAmountOfsideDishes(arrayList);
      disabledRadio();
    }
  }, [itemOnScreen]);

  // React.useEffect(() => {
  //   if (sideDishesListOnScreen.length > 0) {
  //     setRadioDisabled(false);
  //     setDisabledSelect(true);
  //   }
  // }, [sideDishesListOnScreen]);

  const disabledRadio = () => {
    if (itemOnScreen) {
      setRadioDisabled(true);
    }
  };

  React.useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      finalPrice: totalPrice,
      sideDishes: sideDishesListOnScreen,
    }));
  }, [totalPrice, sideDishesListOnScreen]);

  //select side dishes
  const addSelectedMaximumNumberSideDishes = (e) => {
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
      setRadioDisabled(true);
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
      //Esse retorna o endereço do documento procurao (userDocRef.path)     user/u3lrJowKgANuCC9Nuw4o
      const userDocSnap = await getDoc(userDocRef);
      //Esse retonra o objeto userDocSnap.data()  Como está

      if (userDocSnap.exists()) {
        // Se o documento do usuário já existir, atualiza o array request

        await updateDoc(userDocRef, {
          request: arrayUnion(form), //o array union acrescenta um novo objeto a um array, sem deixar duplicar form é um objeto
        });
      } else {
        // Se o documento do usuário não existir, cria o documento com o array request
        await setDoc(userDocRef, {
          //Cria o que não tem
          request: [form],
        });
      }
      //item é  a props que está vindo do pai
      setForm({
        name: item.title,
        id: item.id,
        finalPrice: Number(item.price),
        image: item.image,
        sideDishes: sideDishesListOnScreen,
      });

      navigate("/request");
    } catch (error) {
      console.log(error);
    }
  }

  function onPriceChange(price) {
    setTotalPrice(Number(price));
  }

  const removeSideDish = (index) => {
    const itemSelected = sideDishesListOnScreen[index]; //Peguei o nome do acompanhamento

    const oneSideDishe = item.sideDishesElementList.filter(
      //Seleciona o objeto
      (item) => item.sideDishes == itemSelected
    );
    const nameOnScreen = sideDishesListOnScreen.filter(
      (item) => item != itemSelected
    ); //Tirar da tela
    setSideDishesListOnScreen(nameOnScreen); //atualiza a lista de nomes da tela

    setTotalPrice(totalPrice - Number(oneSideDishe[0].price)); //Troca o valor total na tela
    if (sideDishesListOnScreen.length == 1) {
      setRadioDisabled(false);
    }

    if (sideDishesListOnScreen.length <= item.maxLimitSideDishes) {
      setDisabledSelect(true);
    }
  };

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
          radioDisabled={radioDisabled}
        />
      )}
      <form className="my-3" onSubmit={handleSubmit}>
        {item.sideDishesElementList && (
          <>
            {item.sideDishesElementList.length > 0 && (
              <h4 className="label-side-dishes">
                Selecione o seu acompanhamento
              </h4>
            )}
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
                      onChange={addSelectedMaximumNumberSideDishes}
                    >
                      <option value="">Selecione</option>
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
            sideDishesListOnScreen.map((item, index) => (
              <div className="side-dishe">
                <p>{item}</p>{" "}
                <button
                  type="button"
                  className="btn-close-side-dishes"
                  onClick={() => removeSideDish(index)}
                >
                  x
                </button>{" "}
              </div>
            ))}
        </div>
        <button type="submit" className="request-client-modal">
          Faça o seu pedido'
        </button>
      </form>
    </div>
  );
};
export default DishesModal;
