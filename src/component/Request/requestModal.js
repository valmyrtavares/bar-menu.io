import React from "react";
import { app } from "../../config-firebase/firebase.js";
import {
  getFirestore,
  getDoc,
  collection,
  addDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import CheckDishesModal from "../Dishes/CheckdishesModal.js";
import "../../assets/styles/requestModal.css";
import { deleteRequestItem, getOneItemColleciton } from "../../api/Api.js";
import WarningMessages from "../WarningMessages";
import { GlobalContext } from "../../GlobalContext";
//import { cardClasses } from "@mui/material";

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState("");
  const [userData, setUserData] = React.useState([]);
  const db = getFirestore(app);
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [finalPriceRequest, setFinalPriceRequest] = React.useState(0);
  const [warningMsg, setWarningMsg] = React.useState(false); //Open message to before send request to next step
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);

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
  }, [currentUser]);

  //Take just one item of user collection

  async function fetchUser() {
    const userDocRef = doc(db, "user", currentUser);
    const userDocSnap = await getDoc(userDocRef);
    const data = userDocSnap.data();
    requestFinalPrice(data);

    setUserData(data);
  }

  const requestFinalPrice = (data) => {
    if (data.request) {
      const finalPrice = data.request
        .map((item) => item.finalPrice)
        .reduce((ac, el) => ac + el, 0);
      setFinalPriceRequest(finalPrice);
    }
  };

  const deleteRequest = (index) => {
    deleteRequestItem(currentUser, index, (updatedRequest) => {
      setUserData(updatedRequest); // Atualiza o estado do dishes com o array atualizado
      fetchUser();
    });
  };
  const callDishesModal = (item) => {
    //chama o modal com o resumo do item
    if (item) {
      setItem(item);
      setModal(true);
    }
  };

  const sendRequestToKitchen = () => {
    if (!warningMsg) {
      setWarningMsg(true);
    } else {
      // global.setIdCustomer(currentUser);
      addRequestUser(currentUser);
      navigate("/orderqueue");
    }
  };

  //send request with finel price
  const addRequestUser = async (id) => {
    if (id) {
      const data = await getOneItemColleciton("user", id);
      const userNewRequest = {
        name: data.name,
        idUser: data.id,
        done: true,
        request: data.request,
        finalPriceRequest: finalPriceRequest,
      };

      if (userNewRequest) {
        debugger;
        addDoc(collection(db, "request"), userNewRequest);
      }
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
      {warningMsg && (
        <WarningMessages
          message="Se tiver dúvidas em relação ao seu pedido, clique em cancelar e retorne a tela anterior. Caso contrário clique em continuar e efetue o seu pagamento no caixa a frente "
          customer={userData?.name}
          finalPriceRequest={finalPriceRequest}
          sendRequestToKitchen={sendRequestToKitchen}
          setWarningMsg={setWarningMsg}
        />
      )}
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
      <div className="btnFinalRequest">
        <button onClick={sendRequestToKitchen}>
          Enviar pedido para cozinha
        </button>
      </div>
    </section>
  );
};
export default RequestModal;
