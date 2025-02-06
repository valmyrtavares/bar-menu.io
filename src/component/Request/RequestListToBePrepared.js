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
import MessagePromotions from '../Promotions/MessagePromotions';
import { debugErrorMap } from 'firebase/auth';

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
  const [promotions, setPromotions] = React.useState([]);
  const [selectedPromotion, setSelectedPromotion] = React.useState('');
  const [benefitedClient, setBenefitedClient] = React.useState([]);
  const [messagePromotionPopup, setMessagePromotionPopup] =
    React.useState(false);
  const [textPromotion, setTextPromotion] = React.useState('');
  const [AddPromotion, setAddPromotion] = React.useState(false);
  const [benefitedClientEdited, setBenefitedClientEdited] = React.useState({});
  const [operation, setOperation] = React.useState('');
  const [currentDiscount, setCurrentDiscount] = React.useState(0);
  const [currentRequest, setCurrentRequest] = React.useState(null);
  //  const [newCustomerPromotion, setNewCustomerPromotion] = React.useState(null);
  //  const [shouldRunEffect, setShouldRunEffect] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('request', (data) => {
      let requestList = data.filter((item) => item.orderDelivered === false);
      requestList = requestSorter(requestList);

      setRequestDoneList(requestList);
    });

    fetchData();

    return () => unsubscribe();
  }, []);

  // React.useEffect(() => {
  //   if (shouldRunEffect) {
  //     if (newCustomerPromotion !== true) {
  //       if (newCustomerPromotion) {
  //         addBenefitedClientWithNoDescount(benefitedClientEdited, 'add');
  //       } else if (newCustomerPromotion === false) {
  //         addBenefitedClientWithNoDescount(benefitedClientEdited, 'edit');
  //       }
  //       setShouldRunEffect(false); // Resetar para evitar chamadas indesejadas
  //     }
  //   }
  // }, [newCustomerPromotion, shouldRunEffect]);

  const fetchUserRequests = async () => {
    let requestList = await getBtnData('request');
    requestList = requestList.filter((item) => item.orderDelivered === false);
    requestList = requestSorter(requestList);
    setRequestDoneList(requestList);
  };

  const fetchData = async () => {
    try {
      const [promotionsData, benefitedClientData] = await Promise.all([
        getBtnData('Promotions'),
        getBtnData('BenefitedCustomer'),
      ]);
      console.log('promotionsData      ', promotionsData);
      const today = new Date();
      const promotionsFilter = promotionsData.filter((promotion) => {
        const startDate = new Date(promotion.startDate);
        const finalDate = new Date(promotion.finalDate);
        return today >= startDate && today < finalDate;
      });

      setPromotions(promotionsFilter);
      setBenefitedClient(benefitedClientData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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

  // disparada quando o usuário seleciona uma promoção
  const handleSelectChange = async (e, item) => {
    const index = Number(e.target.value);
    const currentPromotion = promotions[index]; // Obtém a promoção selecionada
    const { title, reusable, rules, discount, minimumValue } = currentPromotion; // Extrai os dados da promoção
    setCurrentRequest(item);

    setSelectedPromotion(index);
    // Objeto para ser enviado pela primeira vez
    const benefitedClientObj = {
      name: item.name,
      idUser: item.idUser,
      promotionTitle: [title],
      dateTime: item.dateTime,
      currentFinalPriceRequest: item.finalPriceRequest,
      benefitUsed: [],
    };
    // benefitedClientObj.benefitUsed.push({
    //   date: item.dateTime,
    //   nomeDaPromocao: title,
    //   discount: currentPromotion.discount,
    //   listaDeProdutos: item.request.map((req) => req.name),
    // });

    // Verifica se o cliente já foi beneficiado
    const benefitedClientFinded = benefitedClient.find(
      (client) => client.idUser === item.idUser
    );
    // Se o cliente não foi beneficiado
    if (!benefitedClientFinded) {
      // setNewCustomerPromotion(true);Remove
      setMessagePromotionPopup(true); // Abre o modal
      setAddPromotion(true); // Habilita o botão de continuar
      if (minimumValue) {
        acumulativePurchase(item, benefitedClientObj, currentPromotion);
      } else {
        setTextPromotion(
          `Você está prestes a resgatar a promoção ${title} para o cliente ${item.name} concedendo um desconto de ${discount} reais. As regras são:${rules} `
        );
        benefitedClientObj.benefitUsed.push({
          date: item.dateTime,
          nomeDaPromocao: title,
          discount: currentPromotion.discount,
          listaDeProdutos: item.request.map((req) => req.name),
        });
        setSelectedPromotion(''); // Limpa o select
        setBenefitedClientEdited(benefitedClientObj); //Guarda o objeto para ser enviado de forma global
        setOperation('add'); // Define a operação como adição
      }
      return;
    } else if (benefitedClientFinded) {
      // Se o cliente foi beneficiado
      if (reusable === 'false') {
        // Se a promoção não é reutilizável
        const promotionFinded = benefitedClientFinded.promotionTitle.find(
          (item) => item === title
        );
        if (promotionFinded) {
          setAddPromotion(false);
          setMessagePromotionPopup(true);

          const purchasedProducts =
            benefitedClientFinded.benefitUsed.find(
              (item) => item.nomeDaPromocao === title
            )?.listaDeProdutos || [];

          setSelectedPromotion('');
          setTextPromotion(
            `O cliente ${
              benefitedClientFinded.name
            } já usou a promoção ${title} na data ${
              item.dateTime
            } na compra dos itens ${purchasedProducts
              .map((item) => item)
              .join(', ')}`
          );
          return;
        } else {
          redeemingBenefits(benefitedClientFinded, item, currentPromotion);
          return;
        }
      }
      redeemingBenefits(benefitedClientFinded, item, currentPromotion);
      return;
    }
  };

  const redeemingBenefits = (benefitedClientFinded, item, currentPromotion) => {
    if (currentPromotion.minimumValue) {
      acumulativePurchase(item, benefitedClientFinded, currentPromotion);
      return;
    }
    setAddPromotion(true); // Habilita o botão de continuar

    benefitedClientFinded.benefitUsed.push({
      date: item.dateTime,
      nomeDaPromocao: currentPromotion.title,
      discount: currentPromotion.discount,
      listaDeProdutos: item.request.map((req) => req.name),
    });

    setMessagePromotionPopup(true);
    setAddPromotion(true); // Habilita o botão de continuar
    setTextPromotion(
      `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${benefitedClientFinded.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `
    );
    setCurrentDiscount(currentPromotion.discount);
    setSelectedPromotion('');
    setOperation('edit');
    setBenefitedClientEdited(benefitedClientFinded);
    if (currentPromotion.minimumValue) {
      // If the client has a minimum value to use the promotion
      benefitedClientFinded.score += Number(item.finalPriceRequest); //
      acumulativePurchase(item, benefitedClientFinded, currentPromotion);
    }
  };

  const addEditBenefitedClient = async () => {
    if (operation === 'add') {
      const newFinalPriceDescounted = //calculate the new final price with discount
        Number(currentRequest.finalPriceRequest) -
        Number(benefitedClientEdited.benefitUsed[0].discount);
      if (newFinalPriceDescounted < 0) {
        currentRequest.finalPriceRequest = 0; //update the final price in firebase
      } else {
        currentRequest.finalPriceRequest = newFinalPriceDescounted; //update the final price in firebase
      }
      if (benefitedClientEdited.score) {
        benefitedClientEdited.score = 0.1;
      }
      if (
        Array.isArray(benefitedClientEdited.benefitUsed) &&
        benefitedClientEdited.benefitUsed.length > 0 &&
        Array.isArray(benefitedClientEdited.promotionTitle) &&
        !benefitedClientEdited.promotionTitle.includes(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao
        )
      ) {
        benefitedClientEdited.promotionTitle.push(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao
        );
      }
      //add the promotion title to the list of promotions used by the client
      setDoc(doc(db, 'request', currentRequest.id), currentRequest);
      const docRef = await addDoc(
        collection(db, 'BenefitedCustomer'),
        benefitedClientEdited
      );
      console.log('Document written with ID: ', docRef.id);
      fetchData();
      fetchUserRequests();
    } else if (operation === 'edit') {
      const newFinalPriceDescounted =
        Number(currentRequest.finalPriceRequest) - Number(currentDiscount);
      if (newFinalPriceDescounted < 0) {
        currentRequest.finalPriceRequest = 0; //update the final price in firebase
      } else {
        currentRequest.finalPriceRequest = newFinalPriceDescounted; //update the final price in firebase
      }

      if (benefitedClientEdited.score) {
        benefitedClientEdited.score = 0.1;
      }
      if (
        Array.isArray(benefitedClientEdited.benefitUsed) &&
        benefitedClientEdited.benefitUsed.length > 0 &&
        Array.isArray(benefitedClientEdited.promotionTitle) &&
        !benefitedClientEdited.promotionTitle.includes(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao
        )
      ) {
        benefitedClientEdited.promotionTitle.push(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao
        );
      }

      const NoEmpty = cleanObject(benefitedClientEdited);
      setBenefitedClientEdited(NoEmpty);
      setDoc(doc(db, 'request', currentRequest.id), currentRequest);
      const docRef = doc(db, 'BenefitedCustomer', benefitedClientEdited.id);
      await updateDoc(docRef, benefitedClientEdited);
      console.log('Document updated with ID: ', benefitedClientEdited.id);
      fetchData();
      fetchUserRequests();
    }
  };

  const acumulativePurchase = (item, benefitedClientObj, currentPromotion) => {
    const { finalPriceRequest } = item;
    const { minimumValue } = currentPromotion;

    if (benefitedClientObj.score) {
      //if the client has a score means he already bought something
      benefitedClientObj.score += Number(item.finalPriceRequest);
      if (benefitedClientObj.score >= currentPromotion.minimumValue) {
        //benefitedClientObj.score = 0.1;
        setMessagePromotionPopup(true);
        setAddPromotion(true);
        setTextPromotion(
          `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${item.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `
        );
        benefitedClientObj.benefitUsed.push({
          date: item.dateTime,
          nomeDaPromocao: currentPromotion.title,
          discount: currentPromotion.discount,
          listaDeProdutos: item.request.map((req) => req.name),
        });
        setSelectedPromotion('');
        setCurrentDiscount(currentPromotion.discount);
        setOperation('edit');
        setBenefitedClientEdited(benefitedClientObj);
        return;
      }
      setMessagePromotionPopup(true);
      //benefitedClientObj.score += Number(finalPriceRequest);
      benefitedClientObj.benefitUsed.push({
        date: item.dateTime,
        nomeDaPromocao: currentPromotion.title,
        discount: currentPromotion.discount,
        listaDeProdutos: item.request.map((req) => req.name),
      });
      setBenefitedClientEdited(benefitedClientObj);
      setTextPromotion(
        `O cliente ${
          item.name
        } ainda não alcançou o valor mínimo para resgatar esse desconto. O valor atual acumulado pelo cliente referente a essa  promoção é de  ${
          benefitedClientObj.score
        } e o valor mínimo necessário é de ${
          currentPromotion.minimumValue
        } reais. Ele ainda deve consumir o valor de ${
          currentPromotion.minimumValue - benefitedClientObj.score
        }. As regras são:${currentPromotion.rules} `
      );
      setAddPromotion(false);
      setSelectedPromotion('');
      if (benefitedClientObj.benefitUsed.length === 1) {
        addBenefitedClientWithNoDescount(benefitedClientObj, 'add');
      } else {
        addBenefitedClientWithNoDescount(benefitedClientObj, 'edit');
      }
      return;
    }

    if (finalPriceRequest >= minimumValue) {
      benefitedClientObj.benefitUsed.push({
        date: item.dateTime,
        nomeDaPromocao: currentPromotion.title,
        discount: currentPromotion.discount,
        listaDeProdutos: item.request.map((req) => req.name),
      });
      //benefitedClientObj.score = 0.1;
      setMessagePromotionPopup(true);
      setAddPromotion(true);
      setTextPromotion(
        `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${item.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `
      );
      setSelectedPromotion('');
      setOperation('add');
      setBenefitedClientEdited(benefitedClientObj);
    } else {
      benefitedClientObj.benefitUsed.push({
        date: item.dateTime,
        nomeDaPromocao: currentPromotion.title,
        discount: currentPromotion.discount,
        listaDeProdutos: item.request.map((req) => req.name),
      });

      setMessagePromotionPopup(true);
      benefitedClientObj.score = Number(finalPriceRequest);

      setBenefitedClientEdited(benefitedClientObj);
      setTextPromotion(
        `O cliente ${
          item.name
        } ainda não alcançou o valor mínimo para resgatar esse desconto. O valor atual acumulado pelo cliente referente a essa  promoção é de  ${
          item.finalPriceRequest
        } e o valor mínimo necessário é de ${
          currentPromotion.minimumValue
        } reais. Ele ainda deve consumir o valor de ${
          currentPromotion.minimumValue - finalPriceRequest
        }. As regras são:${currentPromotion.rules} `
      );
      setAddPromotion(false);
      setSelectedPromotion('');

      console.log(benefitedClientObj);
      if (benefitedClientObj.benefitUsed.length === 1) {
        addBenefitedClientWithNoDescount(benefitedClientObj, 'add');
      } else {
        addBenefitedClientWithNoDescount(benefitedClientObj, 'edit');
      }
      // setOperation('add');

      return;
    }
  };

  const addBenefitedClientWithNoDescount = async (
    benefitedClientObj,
    action
  ) => {
    //add the client to the benefited list without discount, cause he didn't reach the minimum value
    //

    if (action === 'edit') {
      const docRef = doc(db, 'BenefitedCustomer', benefitedClientObj.id);
      await updateDoc(docRef, benefitedClientObj);
      console.log('Document updated with ID: ', benefitedClientObj.id);
      fetchData();
      fetchUserRequests();
      return;
    }
    if (action === 'add') {
      const docRef = await addDoc(
        collection(db, 'BenefitedCustomer'),
        benefitedClientObj
      );
      console.log('Document written with ID: ', docRef.id);
      fetchData();
      fetchUserRequests();
    }
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
                <div className={style.promotionSelect}>
                  <select
                    name="selectedPromotion"
                    value={selectedPromotion}
                    onChange={(e) => handleSelectChange(e, item)}
                  >
                    <option value="">Selecione uma promoção </option>
                    {promotions &&
                      promotions.length > 0 &&
                      promotions.map((promotion, index) => (
                        <option key={index} value={index}>
                          {promotion.title}
                        </option>
                      ))}
                  </select>
                </div>
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
                <div>
                  {messagePromotionPopup && (
                    <MessagePromotions
                      message={textPromotion}
                      AddPromotion={AddPromotion}
                      setClose={setMessagePromotionPopup}
                      onContinue={addEditBenefitedClient}
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
