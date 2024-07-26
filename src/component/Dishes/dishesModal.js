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

const DishesModal = ({ item, openmodal }) => {
  const [totalPrice, setTotalPrice] = React.useState(Number(item.price));
  const [currentUser, setCurrentUser] = React.useState("");
  const [form, setForm] = React.useState({
    name: item.title,
    id: item.id,
    finalPrice: Number(item.price),
    image: item.image,
  });
  const navigate = useNavigate();
  const db = getFirestore(app);

  React.useEffect(() => {
    console.log(item);
    if (localStorage.hasOwnProperty("userMenu")) {
      const currentUserNew = JSON.parse(localStorage.getItem("userMenu"));
      setCurrentUser(currentUserNew.id);
    }
  }, [item]);

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

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="content-modal-dishes">
      <div className="close-btn">
        <button onClick={openmodal}>X</button>
      </div>
      <p>{currentUser}</p>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h4>Valor: R${totalPrice.toFixed(2)}</h4>
      <form className="my-3" onSubmit={handleSubmit}>
        <h4>Selecione o seu acompanhamento</h4>
        <div className="side-dishes-list">
          {item.sideDishesElementList &&
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
            ))}
        </div>
        <button className="request-client">Faça o seu pedido</button>
      </form>
    </div>
  );
};
export default DishesModal;
