import React from 'react';
import { getBtnData, deleteData, getOneItemColleciton } from '../../api/Api.js';
import { app } from '../../config-firebase/firebase.js';
import PaymentMethod from '../Payment/PaymentMethod';
import { fetchInDataChanges } from '../../api/Api.js';
import {
  getFirestore,
  setDoc,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import style from '../../assets/styles/RequestListToBePrepared.module.scss';
import { Link } from 'react-router-dom';
import Title from '../title.js';
import {
  getFirstFourLetters,
  requestSorter,
  firstNameClient,
} from '../../Helpers/Helpers.js';
import RecipeModal from './RecipeModal';

import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { GlobalContext } from '../../GlobalContext';
import { useNavigate } from 'react-router-dom';
import ButtonCustomerProfile from '../Promotions/ButtonCustomerProfile';

const RequestListToBePrepared = () => {
  const db = getFirestore(app);

  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [ShowDefaultMessage, setShowDefaultMessage] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState(null);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const [recipeModal, setRecipeModal] = React.useState({
    openModal: false,
    id: '',
  });

  // const { isOpen, toggle } = useModal();

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('request', (data) => {
      let requestList = data.filter((item) => item.orderDelivered == false);
      requestList = requestSorter(requestList);
      console.log('requestList   ', requestList);

      setRequestDoneList(requestList);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserRequests = async () => {
    let requestList = await getBtnData('request');
    requestList = requestList.filter((item) => item.orderDelivered == false);
    requestList = requestSorter(requestList);
    setRequestDoneList(requestList);
  };

  const handleDeleteRequest = async (id) => {
    const data = await getOneItemColleciton('request', id);
    await deleteData('request', id);
    if (data.name === 'anonimo') {
      await deleteData('user', data.idUser);
    }
    setShowDefaultMessage(false); // Fecha o modal após excluir
  };

  const openShowModal = (id) => {
    setShowDefaultMessage(true);
    setSelectedRequestId(id);
  };

  const closeModal = () => {
    setShowDefaultMessage(false);
  };

  const RequestDone = (item) => {
    item.done = false;
    setDoc(doc(db, 'request', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePaymentMethodChange = (method, item) => {
    item.paymentMethod = method;
    setDoc(doc(db, 'request', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const descontFinalPrice = async (descont, idRequest) => {
    try {
      const requestRef = doc(db, 'request', idRequest);

      const requestSnap = await getDoc(requestRef);

      if (requestSnap.exists()) {
        // Obtém o valor atual de finalPriceRequest
        const currentFinalPrice = requestSnap.data().finalPriceRequest;

        // Calcula o novo valor subtraindo o desconto
        const updatedFinalPrice = currentFinalPrice - descont;

        // Atualiza o documento no Firestore com o novo valor
        await updateDoc(requestRef, {
          finalPriceRequest: updatedFinalPrice,
        });
        console.log(
          'finalPriceRequest atualizado com sucesso para:',
          updatedFinalPrice
        );

        // Aqui você pode atualizar o estado local para refletir a mudança imediatamente na interface
        // Exemplo:
        // fetchUserRequests(); // Supondo que setFinalPriceRequest seja um estado
      } else {
        console.log('Documento não encontrado!');
      }
    } catch (error) {
      console.error('Erro ao atualizar finalPriceRequest:', error);
    }
  };

  const changeStatusPaid = (item) => {
    item.paymentDone = true;
    setDoc(doc(db, 'request', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
        global.setUserNewRequest(item);
        navigate('/print');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateIngredientsStock = async (item) => {
    const ObjPadrao = {
      CostPerUnit: 0,
      amount: 0,
      product: '',
      totalCost: 0,
      totalVolume: 0,
      unitOfMeasurement: '',
      columePerUnit: 0,
    };

    const dateTime = item.dateTime;
    const { request } = item;

    for (let i = 0; i < request.length; i++) {
      const currentItem = request[i];
      const account = currentItem.name;
      const { FinalingridientsList } = currentItem.recipe;
      if (Array.isArray(FinalingridientsList[currentItem.size])) {
        for (
          let i = 0;
          i < FinalingridientsList[currentItem.size].length;
          i++
        ) {
          const ingredient = FinalingridientsList[currentItem.size][i];
          ObjPadrao.totalVolume = -Number(ingredient.amount.replace(',', '.'));
          ObjPadrao.product = ingredient.name;
          ObjPadrao.unitOfMeasurement = ingredient.unitOfMeasurement;
          const arrayParams = [ObjPadrao];
          await handleStock(arrayParams, account, dateTime);
        }
      } else {
        for (let i = 0; i < FinalingridientsList.length; i++) {
          const ingredient = FinalingridientsList[i];
          ObjPadrao.totalVolume = -Number(ingredient.amount.replace(',', '.'));
          ObjPadrao.product = ingredient.name;
          ObjPadrao.unitOfMeasurement = ingredient.unitOfMeasurement;
          const arrayParams = [ObjPadrao];
          await handleStock(arrayParams, account, dateTime);
        }
      }
    }
  };

  const handleStock = async (
    itemsStock,
    account = 'Editado',
    paymentDate = null
  ) => {
    if (!Array.isArray(itemsStock)) {
      itemsStock = [itemsStock];
    }

    if (!paymentDate) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é zero-based
      const year = today.getFullYear();
      paymentDate = `${day}/${month}/${year}`;
    }

    const data = await getBtnData('stock'); // Obtém todos os registros existentes no estoque

    for (let i = 0; i < itemsStock.length; i++) {
      let currentItem = itemsStock[i];

      // Verifica se o item já existe no banco de dados
      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );
      if (itemFinded) {
        // Atualiza os valores de custo e volume totais
        const previousCost = itemFinded.totalCost;
        const previousVolume = itemFinded.totalVolume;
        const cost = account === 'Editado' ? 0 : currentItem.totalCost;
        const pack =
          account === 'Editado'
            ? Number(currentItem.amount)
            : Number(itemFinded.amount) + Number(currentItem.amount);
        const volume = account === 'Editado' ? 0 : currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;

        if (
          account !== 'Editado' && // Não é "Editado"
          /^[^\d]+$/.test(account) && // Não contém números
          isNaN(account) // Não é um número
        ) {
          // Atualiza totalCost proporcionalmente
          currentItem.totalCost = previousCost - previousCost / previousVolume;

          // Mantém a atualização de totalVolume
          currentItem.totalVolume =
            (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
        }

        // Inicializa ou adiciona ao UsageHistory
        currentItem.UsageHistory = itemFinded.UsageHistory || [];

        currentItem.UsageHistory.push(
          stockHistoryList(
            itemFinded,
            account,
            paymentDate,
            pack,
            cost,
            unit,
            volume,
            previousVolume,
            previousCost,
            currentItem.totalCost,
            currentItem.totalVolume
          )
        );
        currentItem = cleanObject(currentItem);

        // Atualiza o registro no banco de dados
        const docRef = doc(db, 'stock', itemFinded.id);
        await updateDoc(docRef, currentItem);
      } else {
        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
            0,
            currentItem.totalCost,
            currentItem.totalVolume
          ),
        ];
        currentItem = cleanObject(currentItem);
        await addDoc(collection(db, 'stock'), currentItem);
      }
    }
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

  const stockHistoryList = (
    item,
    account,
    paymentDate,
    pack,
    cost,
    unit,
    volume,
    previousVolume,
    previousCost,
    totalCost,
    totalVolume
  ) => {
    const stockEventRegistration = {
      date: paymentDate,
      outputProduct: Number(volume).toFixed(2),
      category: account || 0,
      unit: unit,
      package: pack,
      inputProduct: 0,
      cost: cost,
      previousVolume: previousVolume,
      previousCost: previousCost,
      ContentsInStock: totalVolume,
      totalResourceInvested: Number(totalCost).toFixed(2),
    };
    return stockEventRegistration;
  };

  const orderDelivery = (item) => {
    if (item.name === 'anonimo') {
      deleteData('user', item.idUser);
    }
    updateIngredientsStock(item);

    item.orderDelivered = true;
    setDoc(doc(db, 'request', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div>
      <Link to="/admin/admin">
        <Title mainTitle="Cozinha" />
      </Link>
      {requestsDoneList &&
        requestsDoneList.map((item, itemIndex) => (
          <div className={style.containerRequestListToBePrepared} key={item.id}>
            <div className={style.userContainer}>
              <div>
                <p>
                  <span>Nome</span> {firstNameClient(item.name)}
                </p>
                <p>
                  <span>Pedido</span>: {getFirstFourLetters(item.id, 4)} ;
                </p>
                <p>
                  <span>Ordenação</span>: {item.countRequest}
                </p>
                <p>
                  <span>Data</span> {item.dateTime}
                </p>
                <h2>Valor final R$ {item.finalPriceRequest},00</h2>
                <div className={style.customerProfileButton}>
                  <ButtonCustomerProfile
                    item={item}
                    request={item.request}
                    descontFinalPrice={descontFinalPrice}
                  />
                </div>
                <PaymentMethod
                  item={item}
                  onPaymentMethodChange={handlePaymentMethodChange}
                />
              </div>
              <div className={style.btnStatus}>
                <button
                  onClick={() => openShowModal(item.id)}
                  className={style.pendent}
                >
                  Cancelar pedido
                </button>
                <div>
                  {ShowDefaultMessage && (
                    <DefaultComumMessage
                      msg="Você está prestes a excluir esse pedido"
                      onClose={closeModal}
                      onConfirm={() => handleDeleteRequest(selectedRequestId)}
                    />
                  )}
                </div>
                <button
                  disabled={!item.paymentMethod}
                  className={item.paymentDone ? style.done : style.pendent}
                  onClick={() => changeStatusPaid(item)}
                >
                  Pago
                </button>
                <button
                  disabled={!item.paymentDone}
                  className={item.done ? style.pendent : style.done}
                  onClick={() => RequestDone(item)}
                >
                  Pronto
                </button>
                <button
                  disabled={item.done}
                  className={item.orderDelivered ? style.done : style.pendent}
                  onClick={() => orderDelivery(item)}
                >
                  Entregue
                </button>
              </div>
            </div>

            {item.request &&
              item.request.map((item, recipeIndex) => (
                <div className={style.requestItem} key={recipeIndex}>
                  {recipeModal.openModal && (
                    <RecipeModal
                      setRecipeModal={setRecipeModal}
                      recipeModal={recipeModal}
                    />
                  )}
                  <div>
                    <h5>{item.name}</h5>
                    <p>{getFirstFourLetters(item.id, 4)}</p>
                    {item.category && (
                      <p className={style.category}>
                        Categoria {item.category}
                      </p>
                    )}
                    {item.size && (
                      <p>
                        Tamanho:<strong>{item.size}</strong>
                      </p>
                    )}
                    <h5>Acompanhamento</h5>
                    <div className={style.sideDishesList}>
                      {item.sideDishes && item.sideDishes.length > 0 ? (
                        item.sideDishes.map((item, index) => (
                          <p key={index}>{item.name},</p>
                        ))
                      ) : (
                        <p>Não tem acompanhamento</p>
                      )}
                    </div>
                  </div>
                  <div className={style.imageButton}>
                    <img src={item.image} alt="123" />
                    <button
                      onClick={() =>
                        setRecipeModal({ openModal: true, id: item.id })
                      }
                      className="btn btn-warning"
                    >
                      Receita
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      ;
    </div>
  );
};
export default RequestListToBePrepared;

///admin/requestlist
