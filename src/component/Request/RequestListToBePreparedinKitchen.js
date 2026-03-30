import React, { useEffect } from 'react';
import { getBtnData, deleteData, getOneItemColleciton } from '../../api/Api.js';
import { db } from '../../config-firebase/firebase.js';
import PaymentMethod from '../Payment/PaymentMethod.js';
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
import style from '../../assets/styles/RequestListToBePreparedKitchen.module.scss';
import WarningAmoutMessage from '../Messages/WarningAmoutMessage';
import { Link } from 'react-router-dom';
import Title from '../title.js';
import {
  getFirstFourLetters,
  requestSorter,
  firstNameClient,
  isOrderFullyFinished,
} from '../../Helpers/Helpers.js';
import RecipeModal from './RecipeModal.js';

import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
import { GlobalContext } from '../../GlobalContext.js';
import { useNavigate } from 'react-router-dom';
import ButtonCustomerProfile from '../Promotions/ButtonCustomerProfile.js';
import MessagePromotions from '../Promotions/MessagePromotions.js';

//import { debugErrorMap } from 'firebase/auth';

const RequestListToBePrepared = () => {
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [ShowDefaultMessage, setShowDefaultMessage] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState(null);
  const [colorStatusRequest, setColorStatusRequest] = React.useState('red');
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
  const [sideDishesList, setSideDishesList] = React.useState([]);
  const [openRequests, setOpenRequests] = React.useState({});
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update current time every second for the stopwatch
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (ms) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min e ${seconds} seg`;
  };

  const parseDate = (str) => {
    if (!str) return new Date();
    // Remove optional ' - ' and split
    const normalized = str.replace(' - ', ' ');
    const [datePart, timePart] = normalized.split(' ');
    if (!datePart || !timePart) return new Date();
    const [day, month, year] = datePart.split('/');
    const timeParts = timePart.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = parseInt(timeParts[2] || 0, 10);
    return new Date(Number(year), Number(month) - 1, Number(day), hour, minute, second);
  };

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('requests', (data) => {
      // Filter: orders not delivered AND (has table OR is paid)
      let requestList = data.filter((item) =>
        item.orderDelivered === false && (item.tableNumber || item.mesa || item.paymentDone)
      );
      requestList = requestSorter(requestList);

      setRequestDoneList(requestList);
    });

    fetchData();

    return () => unsubscribe();
  }, []);

  // toda vez que a lista mudar, garante que o estado tenha as chaves corretas
  React.useEffect(() => {
    if (!requestsDoneList) return;
    setOpenRequests((prev) => {
      const next = {};
      requestsDoneList.forEach((item) => {
        // mantém valor antigo se já existia, senão começa fechado
        next[item.id] = prev[item.id] ?? false;
      });
      return next;
    });
  }, [requestsDoneList]);

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
    let requestList = await getBtnData('requests');
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

  const closeModal = () => {
    setShowDefaultMessage(false);
  };

  const RequestDone = (item) => {
    item.done = false;
    setDoc(doc(db, 'requests', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const handlePaymentMethodChange = (method, item) => {
  //   item.paymentMethod = method;
  //   setDoc(doc(db, 'requests', item.id), item)
  //     .then(() => {
  //       console.log('Document successfully updated !');
  //       fetchUserRequests();
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const descontFinalPrice = async (descont, idRequest) => {
    try {
      const requestRef = doc(db, 'requests', idRequest);

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
    setDoc(doc(db, 'requests', item.id), item)
      .then(() => {
        console.log('Document successfully updated !');
        fetchUserRequests();
        global.setUserNewRequest(item);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const displayStatus = (item) => {
  //   if (!item?.paymentDone) return 'Não pago';
  //   if (item?.paymentDone === false && item?.done === true) return 'Não pago';
  //   if (item?.paymentDone === true && item?.done === true) {
  //     return 'Pago';
  //   }
  //   if (item?.paymentDone === true && item?.done === false) {
  //     return 'Feito';
  //   }
  //   return;
  // };
  const getStatusAndColor = (item) => {
    const fullyFinished = isOrderFullyFinished(item);

    if (!item?.paymentDone) return { status: 'Não pago', color: 'red' };
    if (item?.paymentDone === false && item?.done === true)
      return { status: 'Não pago', color: 'red' };
    
    // Se o pagamento foi feito
    if (item?.paymentDone === true) {
      // Se já foi marcado como 'done' OU se todos os itens já estão prontos/entregues
      if (item?.done === false || fullyFinished) {
        return { status: 'Feito', color: 'green' };
      }
      return { status: 'Pago', color: 'yellow' };
    }

    return { status: '', color: 'black' };
  };

  const handleToggleItemStatus = async (parentRequestId, itemIndex, field, extraFields = {}) => {
    try {
      const requestRef = doc(db, 'requests', parentRequestId);
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists()) {
        const data = requestSnap.data();
        let newStatusValue = false;
        const updatedRequestItems = data.request.map((item) => {
          if (item.indexInRequest === itemIndex) {
            newStatusValue = !item[field];
            return { ...item, [field]: newStatusValue, ...extraFields };
          }
          return item;
        });

        await updateDoc(requestRef, { request: updatedRequestItems });
        console.log(`Item status ${field} updated for item index ${itemIndex}`);

        // Sincroniza com a coleção 'user' se o campo for 'entregue'
        if (field === 'entregue' && data.idUser) {
          const userRef = doc(db, 'user', data.idUser);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.request && Array.isArray(userData.request)) {
              const updatedUserRequest = userData.request.map((userItem) => {
                // Busca o item específico usando o ID do pedido original e o índice dentro desse pedido
                if (userItem.parentRequestId === parentRequestId && userItem.indexInRequest === itemIndex) {
                  return { ...userItem, status: newStatusValue ? 'Pronto' : '' };
                }
                return userItem;
              });
              await updateDoc(userRef, { request: updatedUserRequest });
              console.log(`Status sincronizado com a coleção 'user' para o pedido ${parentRequestId} item ${itemIndex}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error updating item status ${field}:`, error);
    }
  };

  const handleConfirmCancellation = async (parentRequestId, itemIndex, userId) => {
    try {
      const requestRef = doc(db, 'requests', parentRequestId);
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists()) {
        const data = requestSnap.data();
        const cancelledItem = data.request[itemIndex];
        const itemPrice = Number(cancelledItem.finalPrice) || 0;

        // Remove do array do pedido
        const updatedRequestItems = [...data.request];
        const arrayIndexToRemove = updatedRequestItems.findIndex(item => item.indexInRequest === itemIndex);
        if (arrayIndexToRemove !== -1) {
          updatedRequestItems.splice(arrayIndexToRemove, 1);
        }

        // Atualiza o valor total
        const newTotal = Math.max(0, (Number(data.finalPriceRequest) || 0) - itemPrice);

        await updateDoc(requestRef, {
          request: updatedRequestItems,
          finalPriceRequest: newTotal
        });

        // Sincroniza com o usuário
        if (userId) {
          const userRef = doc(db, 'user', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.request && Array.isArray(userData.request)) {
              const updatedUserRequest = userData.request.filter(
                (userItem) => !(userItem.parentRequestId === parentRequestId && userItem.indexInRequest === itemIndex)
              );
              await updateDoc(userRef, { request: updatedUserRequest });
            }
          }
        }
        console.log(`Item index ${itemIndex} cancelled in kitchen.`);
      }
    } catch (error) {
      console.error('Error confirming cancellation:', error);
    }
  };

  useEffect(() => {
    setColorStatusRequest('red');
  }, [requestsDoneList]);

  const updateIngredientsStock = async (item) => {
    // No pacote básico (1 ou 3), não realizamos baixa de estoque
    if (Number(global.packageTier) === 1 || Number(global.packageTier) === 3) {
      console.log('Pacote Básico: Baixa de estoque ignorada.');
      return;
    }

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

    if (request && request.length > 0) {
      await updateSideDihesInStock(request, dateTime, ObjPadrao);
    }

    for (let i = 0; i < request.length; i++) {
      const currentItem = request[i];

      if (!currentItem) {
        console.log('Item inválido na request:', request);
        continue;
      }

      if (!currentItem.recipe) {
        console.log('Item sem recipe:', currentItem);
        continue;
      }

      if (!currentItem.recipe.FinalingridientsList) {
        console.log('FinalingridientsList está undefined:', currentItem.recipe);
        continue;
      }
      const account = currentItem.name;
      const FinalingridientsList = currentItem?.recipe?.FinalingridientsList;
      if (!Array.isArray(FinalingridientsList)) {
        console.log(
          'ERRO: FinalingridientsList está indefinido para:',
          currentItem
        );
        continue; // pula para o próximo item da request
      }
      const size = currentItem?.size;
      const listBySize = FinalingridientsList?.[size];
      if (Array.isArray(listBySize)) {
        for (let i = 0; i < listBySize.length; i++) {
          const ingredient = listBySize[i];
          ObjPadrao.totalVolume = -Number(ingredient.amount.replace(',', '.'));
          ObjPadrao.product = ingredient.name;
          ObjPadrao.unitOfMeasurement = ingredient.unitOfMeasurement;
          ObjPadrao.CostPerUnit = ingredient.portionCost;
          const arrayParams = [ObjPadrao];
          await handleStock(arrayParams, account, dateTime);
        }
      } else {
        for (let i = 0; i < FinalingridientsList.length; i++) {
          const ingredient = FinalingridientsList[i];
          ObjPadrao.totalVolume = -Number(ingredient.amount.replace(',', '.'));
          ObjPadrao.product = ingredient.name;
          ObjPadrao.unitOfMeasurement = ingredient.unitOfMeasurement || '';
          ObjPadrao.CostPerUnit = ingredient.portionCost;
          const arrayParams = [ObjPadrao];
          await handleStock(arrayParams, account, dateTime);
        }
      }
    }
  };

  const updateSideDihesInStock = async (request, dateTime, ObjPadrao) => {
    if (!request || !Array.isArray(request) || request.length === 0) return;

    for (let i = 0; i < request.length; i++) {
      const currentItem = request[i];
      const account = request[i].name;
      if (
        currentItem.sideDishes &&
        Array.isArray(currentItem.sideDishes) &&
        currentItem.sideDishes.length > 0
      ) {
        for (let j = 0; j < currentItem.sideDishes.length; j++) {
          const sideDish = currentItem.sideDishes[j];
          if (sideDish.isBasic) continue; // Pula baixa de estoque se for modo básico (sem vínculo)
          
          ObjPadrao.totalVolume = -parseToNumber(sideDish.portionCost); // amount removed from stock
          ObjPadrao.product = sideDish.name;
          ObjPadrao.unitOfMeasurement = sideDish.unit || '';
          ObjPadrao.CostPerUnit = sideDish.portionCost;
          const arrayParams = [ObjPadrao];
          await handleStock(arrayParams, account, dateTime);
        }
      }
    }
  };

  function parseToNumber(value) {
    if (typeof value === 'string') {
      return Number(value.replace(',', '.'));
    }
    return Number(value);
  }

  function round(value, decimals = 2) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  }

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
      console.log('itemFinded', itemFinded);

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
          // currentItem.totalCost = previousCost - currentItem.CostPerUnit;

          const previousCost = parseToNumber(itemFinded.totalCost);
          const costPerUnit = parseToNumber(currentItem.CostPerUnit);
          currentItem.totalCost = round(previousCost - costPerUnit, 2);

          // Mantém a atualização de totalVolume
          // currentItem.totalVolume =
          //   (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
          const volumeBefore = parseToNumber(currentItem.totalVolume);
          const volumeAdd = parseToNumber(itemFinded.totalVolume);
          currentItem.totalVolume = round(volumeBefore + volumeAdd, 4);

          if (currentItem.totalVolume < 0) {
            alert(
              `Volume do item ${currentItem.name} está negativo. Verifique o estoque.`
            );
            currentItem.totalVolume = 0;
          }
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
        console.log('item atual atualizado   ', currentItem);
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
            `O cliente ${benefitedClientFinded.name
            } já usou a promoção ${title} na data ${item.dateTime
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
      setDoc(doc(db, 'requests', currentRequest.id), currentRequest);
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
      setDoc(doc(db, 'requests', currentRequest.id), currentRequest);
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
        `O cliente ${item.name
        } ainda não alcançou o valor mínimo para resgatar esse desconto. O valor atual acumulado pelo cliente referente a essa  promoção é de  ${benefitedClientObj.score
        } e o valor mínimo necessário é de ${currentPromotion.minimumValue
        } reais. Ele ainda deve consumir o valor de ${currentPromotion.minimumValue - benefitedClientObj.score
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
        `O cliente ${item.name
        } ainda não alcançou o valor mínimo para resgatar esse desconto. O valor atual acumulado pelo cliente referente a essa  promoção é de  ${item.finalPriceRequest
        } e o valor mínimo necessário é de ${currentPromotion.minimumValue
        } reais. Ele ainda deve consumir o valor de ${currentPromotion.minimumValue - finalPriceRequest
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

  const orderDelivery = async (item) => {
    if (item.name === 'anonimo' || item.name === 'anonymous') {
      await deleteData('user', item.idUser);
    } else if (item.idUser) {
      const userRef = doc(db, 'user', item.idUser);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.request && Array.isArray(userData.request)) {
          const updatedRequest = userData.request.map((reqItem) => {
            // Apenas marca como 'Pronto' os itens que pertencem a este pedido específico (item.id)
            if (reqItem.parentRequestId === item.id) {
              return { ...reqItem, status: 'Pronto' };
            }
            return reqItem;
          });
          await updateDoc(userRef, { request: updatedRequest });
        }
      }
    }

    await updateIngredientsStock(item);

    item.orderDelivered = true;
    try {
      await setDoc(doc(db, 'requests', item.id), item);
      console.log('Document successfully updated !');
      fetchUserRequests();
    } catch (error) {
      console.log(error);
    }
  };

  // const openPrintScreen = (item) => {
  //   console.log('item para nota fiscal');
  //   global.setUserNewRequest(item);
  //   navigate('/print');
  // };
  const toggleRequest = (id) => {
    setOpenRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      <Link to="/admin/admin">
        <Title mainTitle="COZINHA" />
      </Link>
      <WarningAmoutMessage />
      <div className={style.kitchenItemsList}>
        {requestsDoneList &&
          (() => {
            const allItems = [];
            requestsDoneList.forEach((request) => {
              if (request.request && Array.isArray(request.request)) {
                request.request.forEach((item, indexInRequest) => {
                  if (!item.entregue) {
                    allItems.push({
                      ...item,
                      parentRequestId: request.id,
                      indexInRequest: item.indexInRequest,
                      clientName: request.name,
                      tableNumber: request.tableNumber || request.mesa,
                      orderDate: item.sentToKitchenTime || request.dateTime,
                    });
                  }
                });
              }
            });

            // Order: oldest first
            const sortedItems = allItems.sort((a, b) => parseDate(a.orderDate).getTime() - parseDate(b.orderDate).getTime());

            return sortedItems.map((item, index) => {
              const orderDateTime = parseDate(item.orderDate);
              const elapsedMs = currentTime - orderDateTime;
              const formattedTime = formatDuration(elapsedMs);

              return (
                <div
                  className={`${style.kitchenItemRow} ${item.cancelRequested ? style.cancelRequestedRow : ''}`}
                  key={`${item.parentRequestId}-${item.id}-${index}`}
                  style={item.cancelRequested ? { border: '3px solid red', backgroundColor: '#fff5f5' } : {}}
                >
                  <div className={style.itemInfo}>
                    <h4>{item.name}</h4>
                    {item.cancelRequested && (
                      <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2rem' }}>⚠️ ITEM CANCELADO PELO GARÇOM</p>
                    )}
                    <p><span>Cliente:</span> {firstNameClient(item.clientName)}</p>
                    {item.tableNumber && <p><span>Mesa:</span> {item.tableNumber}</p>}
                    <p><span>Data:</span> {item.orderDate}</p>
                    <p style={{ fontWeight: 'bold', color: 'var(--title-font-color)' }}><span>Tempo:</span> {formattedTime}</p>
                  </div>

                  <div className={style.itemAccompaniment}>
                    <h5>Acompanhamentos:</h5>
                    {item.sideDishes && item.sideDishes.length > 0 ? (
                      <div className={style.sideDishes}>
                        {item.sideDishes.map((side, sIndex) => (
                          <span key={sIndex}>{side.name}{sIndex < item.sideDishes.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    ) : (
                      <p>Sem acompanhamentos</p>
                    )}
                    {item.size && <p>Tamanho: <strong>{item.size}</strong></p>}
                  </div>

                  <div className={style.itemActions}>
                    <button
                      disabled={item.pronto}
                      className={item.pronto ? style.done : style.pendent}
                      onClick={() => handleToggleItemStatus(item.parentRequestId, item.indexInRequest, 'pronto')}
                    >
                      Pronto
                    </button>
                    <button
                      disabled={item.entregue || item.cancelRequested}
                      className={item.entregue ? style.done : style.pendent}
                      onClick={() => {
                        const duration = currentTime - parseDate(item.orderDate);
                        const formattedDurationStr = `tempo levado: ${formatDuration(duration)}`;
                        handleToggleItemStatus(item.parentRequestId, item.indexInRequest, 'entregue', { tempo_levado: formattedDurationStr });
                      }}
                    >
                      Entregue
                    </button>
                    {item.cancelRequested ? (
                      <button
                        className={style.pendent}
                        style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold' }}
                        onClick={() => handleConfirmCancellation(item.parentRequestId, item.indexInRequest, requestsDoneList.find(r => r.id === item.parentRequestId)?.idUser)}
                      >
                        Confirmar Cancelamento
                      </button>
                    ) : (
                      <button
                        onClick={() => setRecipeModal({ openModal: true, id: item.id })}
                        className="btn btn-warning"
                      >
                        Receita
                      </button>
                    )}
                  </div>
                </div>
              );
            });
          })()}
      </div>

      {recipeModal.openModal && (
        <RecipeModal
          setRecipeModal={setRecipeModal}
          recipeModal={recipeModal}
        />
      )}
    </div>
  );
};
export default RequestListToBePrepared;

///admin/requestlist
