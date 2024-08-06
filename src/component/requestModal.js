import React from "react";
import { app } from "../config-firebase/firebase.js";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import CheckDishesModal from "./Dishes/CheckdishesModal.js";
import "../assets/styles/requestModal.scss";
import { deleteRequestItem } from "../api/Api.js";

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState("");
  const [userData, setUserData] = React.useState([]);
  const db = getFirestore(app);
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.hasOwnProperty("userMenu")) {
      const currentUserNew = JSON.parse(localStorage.getItem("userMenu"));
      setCurrentUser(currentUserNew.id);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser, userData]);

  //Take just one item of user collection

  async function fetchUser() {
    const userDocRef = doc(db, "user", currentUser);
    const userDocSnap = await getDoc(userDocRef);
    const data = userDocSnap.data();
    setUserData(data);
  }
  const deleteRequest = (index) => {
    deleteRequestItem(currentUser, index, (updatedRequest) => {
      setUserData(updatedRequest); // Atualiza o estado do dishes com o array atualizado
    });
  };
  const callDishesModal = (item) => {
    if (item) {
      setItem(item);
      setModal(true);
    }
  };

  return (
    <section className="container-modal-request">
      <div className="container-modalDihses-InCarrolse">
        {modal && <CheckDishesModal item={item} setModal={setModal} />}
      </div>
      <div className="close-btn">
        <button>
          <Link to="/menu">X</Link>
        </button>
        )
      </div>
      <p className="current-client">
        <span>Cliente: </span>
        {userData?.name}
      </p>
      <h3>Esses são os seus pedidos até o momento</h3>
      {userData && userData.request ? (
        userData.request.map((item, index) => (
          <div className="individual-dishes my-3" key={item.id}>
            <h2 onClick={() => callDishesModal(item)} className="my-0">
              {item.name}
            </h2>
            <p className="dishes-price">R$ {item.finalPrice}</p>
            <p className="status-request-pend">pendente</p>
            <p onClick={() => deleteRequest(index)}>Cancelar</p>
          </div>
        ))
      ) : (
        <p className="no-request">Não há pedidos por enquanto</p>
      )}
    </section>
  );
};
export default RequestModal;
