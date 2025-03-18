import React from 'react';
import { app } from '../../config-firebase/firebase.js';
import {
  getFirestore,
  getDoc,
  collection,
  updateDoc,
  setDoc,
  query,
  where,
  getDocs,
  addDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CheckDishesModal from '../Dishes/CheckdishesModal.js';
import '../../assets/styles/requestModal.css';
import {
  deleteRequestItem,
  getOneItemColleciton,
  getBtnData,
} from '../../api/Api.js';
import WarningMessages from '../WarningMessages';
import TotenRegisterPopup from './TotenRegisterPopup.js';
import PrintRequestCustomer from './PrintRequestCustomer';
import { GlobalContext } from '../../GlobalContext';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
//import { cardClasses } from "@mui/material";
import { getAnonymousUser } from '../../Hooks/useEnsureAnonymousUser.js';

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState('');
  const [userData, setUserData] = React.useState(null);
  const [backorder, setBackorder] = React.useState(null);
  const db = getFirestore(app);
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [disabledBtn, setDisabledBtn] = React.useState(true);
  const [finalPriceRequest, setFinalPriceRequest] = React.useState(null);
  const [isToten, setIsToten] = React.useState(null); //Habilita certos dispositivos a deslogar o cliente após o envio do pedido
  const [warningMsg, setWarningMsg] = React.useState(false); //Open message to before send request to next step
  const [totenMessage, setTotenMessage] = React.useState(false); //Open message to before send request to next step
  const [openCloseTotenPupup, setOpenCloseTotenPopup] = React.useState(false); //Open message to before send request to next step
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);
  const location = useLocation();

  React.useEffect(() => {
    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      setCurrentUser(currentUserNew.id);
    }
    if (localStorage.hasOwnProperty('isToten')) {
      const toten = JSON.parse(localStorage.getItem('isToten'));
      if (toten) setIsToten(true);
    }

    if (localStorage.hasOwnProperty('backorder')) {
      let data = [];
      const orderStoraged = JSON.parse(localStorage.getItem('backorder'));
      if (orderStoraged && orderStoraged.length > 0) {
        orderStoraged.forEach((element) => {
          data.push(element);
        });
      }
      setBackorder(data);
    }
  }, []);

  React.useEffect(() => {
    if (userData && Array.isArray(userData.request)) {
      // Mudança aqui: Verificação de que userData existe e que request é um array

      if (localStorage.hasOwnProperty('backorder')) {
        const orderStoraged = JSON.parse(localStorage.getItem('backorder'));
        if (orderStoraged && orderStoraged.length > 0) {
          if (userData.request && userData.request) {
            orderStoraged.forEach((element) => {
              userData.request.push(element);
            });
          }
        }
        console.log('order Storaged   ', orderStoraged);
      }
      requestFinalPrice(userData);
      if (userData.request.length > 0) {
        setDisabledBtn(false);
      } else {
        setDisabledBtn(true);
      }
    }
    console.log('userData mudou:', userData);
  }, [userData]);

  React.useEffect(() => {
    if (currentUser) {
      fetchUser();

      if (backorder) {
        updateingNewCustomer(backorder);
      }
    }
  }, [currentUser]);

  React.useEffect(() => {
    setIsSubmitting(false); // Reabilita o botão quando a rota mudar
  }, [location]);

  React.useEffect(() => {
    console.log('isSubmitting mudou:', isSubmitting);
  }, [isSubmitting]);

  //Take just one item of user collection

  async function fetchUser() {
    try {
      console.log('Buscando usuário:', currentUser);
      const userDocRef = doc(db, 'user', currentUser);
      const userDocSnap = await getDoc(userDocRef);
      const data = userDocSnap.data();
      if (data) {
        setUserData(data);

        if (userData) {
          if (userData.request.length > 0) {
            setDisabledBtn(true);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  }

  const updateingNewCustomer = async (data) => {
    try {
      const userDocRef = doc(db, 'user', currentUser);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // Se o documento do usuário já existir, atualiza o array request
        const currentRequests = userDocSnap.data().request || [];
        console.log('DATA É    ', data);
        console.log('currentRequests É    ', currentRequests);
        // Acrescente o novo objeto 'form' ao array 'request'
        currentRequests.push(...data);
        console.log('form   ', currentRequests);

        // Atualize o documento com o novo array 'request'
        await updateDoc(userDocRef, {
          request: currentRequests,
        });
      } else {
        // Se o documento do usuário não existir, cria o documento com o array request
        await setDoc(userDocRef, {
          request: [data],
        });
      }
      fetchUser();
      localStorage.removeItem('backorder');
    } catch (error) {
      console.log(error);
    }
  };

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

  const openRegisterPopup = async () => {
    if (isToten && userData.name === 'anonymous') {
      if (userData.request) {
        // Salvar os pedidos do anonymous no localStorage antes de trocar o usuário
        localStorage.setItem('backorder', JSON.stringify(userData.request));

        try {
          // Buscar o documento do usuário "anonymous" pelo campo 'name'
          const userQuery = query(
            collection(db, 'user'),
            where('name', '==', 'anonymous')
          );
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Pegar o primeiro documento encontrado (deve ser único)
            const anonymousUserDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, 'user', anonymousUserDoc.id);
            // Atualizar o campo 'request' para []
            await updateDoc(userDocRef, { request: [] });
            // Buscar o documento atualizado
            const updatedDoc = await getDoc(userDocRef);
            console.log('Dados atualizados:', updatedDoc.data());
          } else {
            console.warn('Usuário anonymous não encontrado no Firestore.');
          }
        } catch (error) {
          console.error(
            'Erro ao buscar ou atualizar usuário anonymous:',
            error
          );
        }
      }

      setOpenCloseTotenPopup(true);
      return;
    }
    sendRequestToKitchen();
  };

  const isProcessing = React.useRef(false); // Bloqueia múltiplas execuções

  const sendRequestToKitchen = async (e) => {
    if (isProcessing.current) return; // Impede cliques repetidos
    isProcessing.current = true; // Bloqueia a função

    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      if (isToten && isToten === true) {
        addRequestUserToten(currentUserNew.id);
        setTotenMessage(true);
        setTimeout(() => {
          setTotenMessage(false);
          navigate('/');
        }, 5000);
        isProcessing.current = false; // Libera novamente após a ação
        //mostrar mensagem
        return;
      } else if (warningMsg) {
        setTotenMessage(true);
        const data = await getOneItemColleciton('user', currentUserNew.id);
        console.log('Atual cliente   ', data);
        if (data) {
          if (isSubmitting) return;
          setIsSubmitting(true);
          e.target.onclick = null;
          addRequestUser(data);
        }
      }
      setWarningMsg(true);
    }
    setTimeout(() => {
      setIsSubmitting(false);
      isProcessing.current = false; // Libera o botão novamente após um tempo
    }, 2000);
  };

  const takeDataTime = () => {
    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(
      2,
      '0'
    )}/${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${now.getFullYear()} - ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;
    return formattedDateTime;
  };

  const cleanObject = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, cleanObject(value)]) // Limpa recursivamente
      );
    }
    return obj; // Retorna o valor se não for objeto
  };

  const addRequestUser = async (data) => {
    try {
      const userNewRequest = {
        name: data.name === 'anonimo' ? data.fantasyName : data.name,
        idUser: data.id,
        done: true,
        // recipe: item.recipe ? item.recipe : {},
        orderDelivered: false,
        request: data.request, // Atribuir os pedidos recuperados
        finalPriceRequest: finalPriceRequest,
        dateTime: takeDataTime(),
        countRequest: await countingRequest(),
      };

      setIsSubmitting(true);
      if (userNewRequest) {
        const cleanedUserNewRequest = cleanObject(userNewRequest);
        addDoc(collection(db, 'request'), cleanedUserNewRequest); //Com o nome da coleção e o id ele traz o objeto dentro userDocRef usa o userDocRef para referenciar mudando somente o request, ou seja um item do objeto
        const userDocRef = doc(db, 'user', cleanedUserNewRequest.idUser);
        await updateDoc(userDocRef, {
          request: [],
        });
      }
      setTotenMessage(false);
      navigate('/orderqueue');
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
    }
  };

  //send request with finel price
  const addRequestUserToten = async (id) => {
    if (id) {
      const data = await getOneItemColleciton('user', id);

      // Recuperar os pedidos do anonymous, se existirem
      const storedRequests = localStorage.getItem('backorder');
      const previousRequests = storedRequests ? JSON.parse(storedRequests) : [];

      const userNewRequest = {
        name: data.name === 'anonimo' ? data.fantasyName : data.name,
        idUser: data.id,
        done: true,
        // recipe: item.recipe ? item.recipe : {},
        orderDelivered: false,
        request: previousRequests, // Atribuir os pedidos recuperados
        finalPriceRequest: finalPriceRequest,
        dateTime: takeDataTime(),
        countRequest: await countingRequest(),
      };
      //global.setUserNewRequest(userNewRequest);
      localStorage.removeItem('backorder');
      if (userNewRequest) {
        const cleanedUserNewRequest = cleanObject(userNewRequest);
        addDoc(collection(db, 'request'), cleanedUserNewRequest); //Com o nome da coleção e o id ele traz o objeto dentro userDocRef usa o userDocRef para referenciar mudando somente o request, ou seja um item do objeto
        const userDocRef = doc(db, 'user', id);
        await updateDoc(userDocRef, {
          request: [],
        });
      }
    }
  };

  const duplicateDish = async (index) => {
    // Cria uma cópia do array original
    const updatedRequest = [...userData.request];

    // Duplica o item no índice fornecido
    const duplicatedItem = { ...updatedRequest[index] };

    // Insere o item duplicado logo após o original
    updatedRequest.splice(index + 1, 0, duplicatedItem);
    try {
      // Referência ao documento do usuário no Firestore
      const userDocRef = doc(db, 'user', currentUser);

      // Atualiza o array request no Firestore
      await updateDoc(userDocRef, {
        request: updatedRequest,
      });

      console.log('Array atualizado com sucesso no Firestore!');
      fetchUser();
    } catch (error) {
      console.error('Erro ao atualizar o array no Firestore:', error);
    }
  };

  const countingRequest = async () => {
    const requestData = await getBtnData('request');
    const requestNumbers = requestData
      .filter((item) => item.countRequest !== undefined)
      .map((item) => item.countRequest);

    const maxRequestNumber =
      requestNumbers.length > 0 ? Math.max(...requestNumbers) : 0;

    return maxRequestNumber + 1;
  };
  //const userNewRequest = addRequestUser(currentUser);

  return (
    <section className="container-modal-request">
      {openCloseTotenPupup && (
        <TotenRegisterPopup
          setOpenCloseTotenPopup={setOpenCloseTotenPopup}
          setCurrentUser={setCurrentUser}
          sendRequestToKitchen={sendRequestToKitchen}
          isSubmitting={isSubmitting}
        />
      )}
      {totenMessage && (
        <DefaultComumMessage msg="Acompanhe o seu pedido na Fila de pedidos que está na TV acima" />
      )}
      <div className="container-modalDihses-InCarrolse">
        {modal && <CheckDishesModal item={item} setModal={setModal} />}
      </div>

      {warningMsg && (
        <WarningMessages
          message="Agora você pode ir ao caixa "
          customer={userData?.name}
          finalPriceRequest={finalPriceRequest}
          sendRequestToKitchen={sendRequestToKitchen}
          setWarningMsg={setWarningMsg}
          requests={userData.request}
          isSubmitting={isSubmitting}
        />
      )}

      <p className="current-client">
        <span>Cliente: </span>
        {userData?.name === 'anonimo' ? userData?.fantasyName : userData?.name}
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
            <button onClick={() => duplicateDish(index)}>+</button>
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
      <div className="btnFinalRequest">
        <button
          disabled={isSubmitting}
          className="send-request"
          onClick={openRegisterPopup}
        >
          Finalizar
        </button>
      </div>
    </section>
  );
};
export default RequestModal;
//testando git
