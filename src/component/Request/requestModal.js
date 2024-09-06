import React from "react";
import { app } from "../../config-firebase/firebase.js";
import {
  getFirestore,
  getDoc,
  collection,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import CheckDishesModal from "../Dishes/CheckdishesModal.js";
import "../../assets/styles/requestModal.css";
import { deleteRequestItem, getOneItemColleciton } from "../../api/Api.js";
import WarningMessages from "../WarningMessages";
//import { GlobalContext } from "../../GlobalContext"; 15 08
//import { cardClasses } from "@mui/material";

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState("");
  const [userData, setUserData] = React.useState(null);
  const db = getFirestore(app);
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [disabledBtn, setDisabledBtn] = React.useState(true);
  const [finalPriceRequest, setFinalPriceRequest] = React.useState(null);
  const [isToten, setIsToten] = React.useState(null); //Habilita certos dispositivos a deslogar o cliente após o envio do pedido
  const [warningMsg, setWarningMsg] = React.useState(false); //Open message to before send request to next step
  const navigate = useNavigate();
  // const global = React.useContext(GlobalContext); 15-08

  React.useEffect(() => {
    if (localStorage.hasOwnProperty("userMenu")) {
      const currentUserNew = JSON.parse(localStorage.getItem("userMenu"));
      setCurrentUser(currentUserNew.id);
    }
    if (localStorage.hasOwnProperty("isToten")) {
      const toten = JSON.parse(localStorage.getItem("isToten"));
      if (toten) setIsToten(true);
    }
  }, []);

  React.useEffect(() => {
    if (userData && Array.isArray(userData.request)) {
      // Mudança aqui: Verificação de que userData existe e que request é um array

      requestFinalPrice(userData);
      if (userData.request.length > 0) {
        setDisabledBtn(false);
      } else {
        setDisabledBtn(true);
      }
    }
  }, [userData]);

  React.useEffect(() => {
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser]);

  //Take just one item of user collection

  async function fetchUser() {
    try {
      const userDocRef = doc(db, "user", currentUser);
      const userDocSnap = await getDoc(userDocRef);
      const data = userDocSnap.data();

      setUserData(data);

      if (userData) {
        if (userData.request.length > 0) {
          setDisabledBtn(true);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  }

  const requestFinalPrice = (data) => {
    if (userData && userData.request.length > 0) {
      const finalPrice = data.request
        .map((item) => item.finalPrice)
        .reduce((ac, el) => ac + el, 0);
      setFinalPriceRequest(finalPrice);
    }
  };

  const deleteRequest = async (index) => {
    await deleteRequestItem(currentUser, index);
    await fetchUser();
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
      addRequestUser(currentUser);
      if (isToten) {
        localStorage.removeItem("userMenu");
        navigate("/create-customer");
      } else {
        navigate("/orderqueue");
      }
    }
  };

  const takeDataTime = () => {
    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(
      2,
      "0"
    )}/${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${now.getFullYear()} - ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;
    return formattedDateTime;
  };

  //send request with finel price
  const addRequestUser = async (id) => {
    if (id) {
      const data = await getOneItemColleciton("user", id);

      const userNewRequest = {
        name: data.name,
        idUser: data.id,
        done: true,
        // recipe: item.recipe ? item.recipe : {},
        orderDelivered: false,
        request: data.request,
        finalPriceRequest: finalPriceRequest,
        dateTime: takeDataTime(),
      };

      if (userNewRequest) {
        addDoc(collection(db, "request"), userNewRequest); //Com o nome da coleção e o id ele traz o objeto dentro userDocRef usa o userDocRef para referenciar mudando somente o request, ou seja um item do objeto

        const userDocRef = doc(db, "user", id);
        await updateDoc(userDocRef, {
          request: [],
        });
      }
    }
  };

  return (
    <section className="container-modal-request">
      <div className="container-modalDihses-InCarrolse">
        {modal && <CheckDishesModal item={item} setModal={setModal} />}
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
      {userData &&
      Array.isArray(userData.request) &&
      userData.request.length > 0 ? (
        userData.request.map((item, index) => (
          <div className="individual-dishes my-3" key={index}>
            <h2 onClick={() => callDishesModal(item)} className="my-0">
              {item.name}
            </h2>
            <p className="dishes-price">R$ {item.finalPrice},00</p>
            <p className="status-request-pend">pendente</p>
            <p className="cancel" onClick={() => deleteRequest(index)}>
              Cancelar
            </p>
          </div>
        ))
      ) : (
        <p className="no-request">Não há pedidos por enquanto</p>
      )}
      <div className="btnFinalRequest">
        <Link className="keep-shopping" to="/">
          Continue Comprando
        </Link>
      </div>
      <div disabled={disabledBtn} className="btnFinalRequest">
        <button
          disabled={disabledBtn}
          className="send-request"
          onClick={sendRequestToKitchen}
        >
          Enviar pedido para cozinha
        </button>
      </div>
    </section>
  );
};
export default RequestModal;
