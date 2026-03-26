import React, { useEffect } from 'react';
import { getBtnData, deleteData, getOneItemColleciton } from '../../api/Api.js';
import { issueAutoNfce } from '../../services/fiscalService';
import { db } from '../../config-firebase/firebase.js';
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
  runTransaction,
} from 'firebase/firestore';
import style from '../../assets/styles/RequestListToBePrepared.module.scss';
import { Link } from 'react-router-dom';
import Title from '../title.js';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage';
import {
  getFirstFourLetters,
  requestSorter,
  firstNameClient,
  isOrderFullyFinished,
} from '../../Helpers/Helpers.js';
import RecipeModal from './RecipeModal';

import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { GlobalContext } from '../../GlobalContext';
import { useNavigate } from 'react-router-dom';
import ButtonCustomerProfile from '../Promotions/ButtonCustomerProfile';
import MessagePromotions from '../Promotions/MessagePromotions';
import {
  alertMinimunAmount,
  checkUnavaiableRawMaterial,
} from '../../Helpers/Helpers';

//import { getOneItemColleciton } from '../../api/Api';

const RequestListToBePrepared = ({ title, statusByUrl }) => {
  const [loadingAvailableMenuDishes, setLoadingAvailableMenuDishes] =
    React.useState(false);
  const [ShowDefaultMessage, setShowDefaultMessage] = React.useState(false);
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [selectedRequestId, setSelectedRequestId] = React.useState(null);
  const [colorStatusRequest, setColorStatusRequest] = React.useState('red');
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const [recipeModal, setRecipeModal] = React.useState({
    openModal: false,
    id: '',
  });

  // const { isOpen, toggle } = useModal();

  const [categories, setCategories] = React.useState([]);
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

  const [showFinalizarMessage, setShowFinalizarMessage] = React.useState(false);
  const [selectedItemToFinalize, setSelectedItemToFinalize] = React.useState(null);

  // NOVO: Estado para armazenar os chamados do garçom pendentes
  const [pendingWaiterCalls, setPendingWaiterCalls] = React.useState([]);
  const [pendingPaymentCalls, setPendingPaymentCalls] = React.useState([]);

  const openFinalizarModal = (item) => {
    setShowFinalizarMessage(true);
    setSelectedItemToFinalize(item);
  };

  const closeFinalizarModal = () => {
    setShowFinalizarMessage(false);
    setSelectedItemToFinalize(null);
  };

  const confirmFinalizarPedido = async () => {
    const itemToFinalize = selectedItemToFinalize;
    closeFinalizarModal(); // Fecha o modal imediatamente
    if (itemToFinalize) {
      await orderDelivery(itemToFinalize);
    }
  };

  const getPostpaidButtonState = (item) => {
    if (!item.request || item.request.length === 0) return { label: 'PENDENTE', color: 'red', className: style.pendent };

    const hasToDeliver = item.request.some((req) => req.entregue && !req.deliveredByWaiter);
    const allDelivered = item.request.every((req) => req.entregue && req.deliveredByWaiter);

    if (hasToDeliver) {
      return { label: 'NOVA ENTREGA', color: 'yellow', className: style.pendent, inlineStyle: { backgroundColor: 'yellow', color: 'black' } };
    } else if (allDelivered) {
      return { label: 'PRONTO', color: 'green', className: style.done, inlineStyle: {} };
    } else {
      return { label: 'PENDENTE', color: 'red', className: style.pendent, inlineStyle: {} };
    }
  };

  // isOrderFullyFinished importado de Helpers.js

  const handleWaiterDelivery = async (item) => {
    const currentState = getPostpaidButtonState(item);
    if (currentState.label === 'NOVA ENTREGA') {
      const updatedRequests = item.request.map((req) => {
        if (req.entregue && !req.deliveredByWaiter) {
          return { ...req, deliveredByWaiter: true };
        }
        return req;
      });
      item.request = updatedRequests;

      const allDelivered = updatedRequests.every((req) => req.entregue && req.deliveredByWaiter);
      if (allDelivered) {
        item.done = false;
      } else {
        item.done = true;
      }

      try {
        await setDoc(doc(db, 'requests', item.id), item);

        if (item.idUser) {
          const userDocRef = doc(db, 'user', item.idUser);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.request && Array.isArray(userData.request)) {
              const newUserDataRequests = userData.request.map((uReq) => {
                if (uReq.parentRequestId === item.id) {
                  const match = updatedRequests.find((r) => r.indexInRequest === uReq.indexInRequest);
                  if (match) {
                    // Preserve the 'status' field which is used by RequestModal
                    return { ...uReq, ...match, status: uReq.status || match.status };
                  }
                }
                return uReq;
              });
              await updateDoc(userDocRef, { request: newUserDataRequests });
            }
          }
        }
        fetchUserRequests();
      } catch (err) {
        console.error("Erro ao atualizar entregas", err);
      }
    }
  };

  //  const [newCustomerPromotion, setNewCustomerPromotion] = React.useState(null);
  //  const [shouldRunEffect, setShouldRunEffect] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('requests', (data) => {
      let requestList = data.filter((item) => !item.orderDelivered);
      requestList = requestSorter(requestList);

      setRequestDoneList(requestList);

      // NOVO: Verificar chamados pendentes
      const newWaiterCalls = requestList.filter(
        (req) => req.waiterCall && req.waiterCall.active === true
      );

      // Atualiza os chamados garantindo que novos pedidos sejam adicionados e os fechados saiam da tela
      setPendingWaiterCalls((prevCalls) => {
        const keepCalls = prevCalls.filter(pc => newWaiterCalls.some(nc => nc.id === pc.id));
        const addCalls = newWaiterCalls.filter(nc => !prevCalls.some(pc => pc.id === nc.id));
        return [...keepCalls, ...addCalls];
      });

      // NOVO: Verificar chamados de PAGAMENTO pendentes
      const newPaymentCalls = requestList.filter(
        (req) => req.paymentCall && req.paymentCall.active === true
      );

      setPendingPaymentCalls((prevCalls) => {
        const keepCalls = prevCalls.filter(pc => newPaymentCalls.some(nc => nc.id === pc.id));
        const addCalls = newPaymentCalls.filter(nc => !prevCalls.some(pc => pc.id === nc.id));
        return [...keepCalls, ...addCalls];
      });
    });

    fetchData();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // toda vez que a lista mudar, garante que o estado tenha as chaves corretas

  // toda vez que a lista mudar, garante que o estado tenha as chaves corretas
  React.useEffect(() => {
    if (!requestsDoneList) return;
    if (requestsDoneList.length > 0) {
      // Gatilho automático para NFC-e

      const triggerFiscal = async () => {
        console.log(`[DEBUG NFCe] Analisando fila (${requestsDoneList.length} pedidos). ` +
          `pdvLocal: ${localStorage.getItem('pdv')}, autoNfceContexto: ${global.enableAutoNfce}`);
        for (const order of requestsDoneList) {
          console.log(`[DEBUG NFCe] Olhando pedido ${order.countRequest} (ID: ${order.id}). ` +
            `paymentDone: ${order.paymentDone}, nfceIssued: ${order.nfceIssued}, sendingNfce: ${order.sendingNfce}`);

          // 1. FILTRO RÁPIDO EM MEMÓRIA (mesmo tab, mesmo ciclo React):
          if (
            order.paymentDone === true &&
            !order.nfceIssued &&
            !order.sendingNfce &&
            !global.processedOrdersGlobal.current.has(order.id)
          ) {
            // Marca IMEDIATAMENTE na memória para bloquear próximas renderizações
            global.processedOrdersGlobal.current.add(order.id);

            console.log(
              `[LOCK] Iniciando trava para pedido ${order.countRequest} (ID: ${order.id})`,
            );

            try {
              // 2. TRAVA ATÔMICA NO FIRESTORE (protege contra múltiplas abas/dispositivos):
              // runTransaction lê o documento fresco e só atualiza se ninguém mais travou.
              // Se duas abas tentarem ao mesmo tempo, o Firestore garante que apenas uma vence.
              const orderRef = doc(db, 'requests', order.id);
              const acquired = await runTransaction(db, async (transaction) => {
                const freshDoc = await transaction.get(orderRef);
                if (!freshDoc.exists()) return false;
                const freshData = freshDoc.data();

                // Verifica com dados FRESCOS do servidor (não do snapshot local)
                if (freshData.nfceIssued || freshData.sendingNfce) {
                  return false; // Outro processo já travou ou emitiu
                }

                // Trava atômica — ninguém mais pode travar até liberarmos
                transaction.update(orderRef, { sendingNfce: true });
                return true;
              });

              if (!acquired) {
                console.log(
                  `[LOCK] Pedido ${order.countRequest} já está sendo processado por outra instância. Ignorando.`,
                );
                continue; // Próximo pedido no loop
              }

              console.log(
                `[LOCK] Trava ATÔMICA ativada para ${order.countRequest}. Enviando para API (issueAutoNfce)...`,
              );

              // 3. ENVIA PARA A API (Processo demorado)
              let result;
              try {
                result = await issueAutoNfce(order);
                console.log(`[DEBUG NFCe] Retorno de issueAutoNfce para ${order.countRequest}:`, result);
              } catch (apiErr) {
                console.error(`[DEBUG NFCe] EXCEPTION no issueAutoNfce para ${order.countRequest}:`, apiErr);
                throw apiErr; // Lança para o catch de erro geral tratar a trava
              }

              // 4. FINALIZA
              if (
                result &&
                result.status === 'autorizado' &&
                result.caminho_danfe
              ) {
                // SUCESSO: Marca como emitido e solta a trava
                await updateDoc(orderRef, {
                  nfceIssued: true,
                  sendingNfce: false,
                  nfcePrinted: false,
                  caminho_danfe: result.caminho_danfe,
                  nfceStatus: result.status,
                  nfceRef: result.ref,
                });
                console.log(
                  `[SUCESSO] Nota emitida para ${order.countRequest}. Trava liberada.`,
                );
              } else {
                // ERRO NA API: Solta a trava para tentar de novo
                console.error(
                  `[ERRO API] Falha autorização para ${order.countRequest}. Soltando trava.`,
                  result,
                );
                await updateDoc(orderRef, { sendingNfce: false });
                global.processedOrdersGlobal.current.delete(order.id);
              }
            } catch (err) {
              // ERRO GERAL (Ex: Falha de rede ao travar)
              console.error(
                `[ERRO GERAL] Falha no processo para ${order.countRequest}:`,
                err,
              );
              // Solta ambas as travas para não travar o pedido para sempre
              global.processedOrdersGlobal.current.delete(order.id);
              try {
                await updateDoc(doc(db, 'requests', order.id), {
                  sendingNfce: false,
                });
              } catch (unlockErr) {
                console.error('Falha crítica ao destrancar pedido:', unlockErr);
              }
            }
          }
        }
      };

      const autoNfceActive = global.enableAutoNfce;
      const isPdv = localStorage.getItem('pdv') === 'true';

      const shouldTrigger = autoNfceActive && isPdv;

      console.log(`[DEBUG NFCe] Analisando gatilho de emissão: enableAutoNfce=${autoNfceActive}, isPdv=${isPdv}, shouldTrigger=${shouldTrigger}`);

      if (shouldTrigger) {
        triggerFiscal();
      }

      localStorage.removeItem('backorder');
    }

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

  // const handleAutomaticFiscalIssuance = (requestsDoneList) => {
  //   if (requestsDoneList.length > 0 && requestsDoneList.paymentDone === true) {

  //   }
  // }

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

  const handleDeleteRequest = async (id) => {
    const data = await getOneItemColleciton('requests', id);
    await deleteData('requests', id);
    if (data.name === 'anonimo' || data.name === 'anonymous') {
      await deleteData('user', data.idUser);
    } else if (data.idUser) {
      const userRef = doc(db, 'user', data.idUser);
      await updateDoc(userRef, { request: [] });
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
    setDoc(doc(db, 'requests', item.id), item)
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
    setDoc(doc(db, 'requests', item.id), item)
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
          updatedFinalPrice,
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

  useEffect(() => {
    setColorStatusRequest('red');
  }, [requestsDoneList]);

  const updateIngredientsStock = async (item) => {
    //second step
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

      const account = currentItem.name;
      const FinalingridientsList = currentItem?.recipe?.FinalingridientsList;

      if (
        !currentItem?.recipe?.FinalingridientsList ||
        currentItem.recipe.FinalingridientsList.length === 0
      ) {
        alert(
          'Este produto precisa ter uma receita cadastrada para ser vendido.',
        );
        return; // ou continue, dependendo do seu fluxo
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
          ObjPadrao.totalVolume = -parseToNumber(sideDish.portionUsed); // amount removed from stock
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
    //third step
    itemsStock,
    account = 'Editado',
    paymentDate = null,
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
        (itemSearch) => itemSearch.product === currentItem.product,
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
          if (currentItem.totalCost < 0) {
            currentItem.totalCost = 0;
          }

          // Mantém a atualização de totalVolume
          // currentItem.totalVolume =
          //   (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
          const volumeBefore = parseToNumber(currentItem.totalVolume);
          const volumeAdd = parseToNumber(itemFinded.totalVolume);
          currentItem.totalVolume = round(volumeBefore + volumeAdd, 4);
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
            currentItem.totalVolume,
          ),
        );
        console.log('item atual atualizado   ', currentItem);
        currentItem = cleanObject(currentItem);

        // Atualiza o registro no banco de dados
        const docRef = doc(db, 'stock', itemFinded.id);
        await updateDoc(docRef, currentItem);
        await updatingStockAndMenu(itemFinded, currentItem);
      } else {
        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
            0,
            currentItem.totalCost,
            currentItem.totalVolume,
          ),
        ];
        currentItem = cleanObject(currentItem);
        await addDoc(collection(db, 'stock'), currentItem);
        await updatingStockAndMenu(itemFinded, currentItem); //update warnings and menu after update stock
      }
    }
  };

  const updatingStockAndMenu = async (itemFinded, currentItem) => {
    if (currentItem.totalVolume < itemFinded.minimumAmount) {
      if (!hasWarningForProduct(currentItem.product)) {
        console.log(`Aviso já registrado para ${currentItem.product}`);
        alert(
          `Volume do item ${currentItem.product} está abaixo do recomendado. Verifique o estoque.`,
        );

        const check = alertMinimunAmount(
          currentItem.product,
          currentItem.totalVolume,
          itemFinded.minimumAmount,
          currentItem.totalCost,
        );

        if (check && check.message) {
          try {
            const key = 'warningAmountMessage';
            let stored = localStorage.getItem(key);
            let warnings = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(warnings)) warnings = [];
            warnings.push(check.message);
            localStorage.setItem(key, JSON.stringify(warnings));
            console.log('O que é esse global aqui  ', global);
            global.setWarningLowRawMaterial((prev) => [...prev, check.message]);
          } catch (err) {
            console.error(
              'Erro ao atualizar warningAmountMessage no localStorage',
              err,
            );
          }
        }
      }
      setLoadingAvailableMenuDishes(true);
      const res = await checkUnavaiableRawMaterial(itemFinded.id);
      setLoadingAvailableMenuDishes(res);
      if (currentItem.totalVolume < 0) {
        currentItem.totalVolume = 0;
      }
    }
  };

  const hasWarningForProduct = (productName) => {
    const raw = localStorage.getItem('warningAmountMessage');
    let parsed = JSON.parse(raw);
    const res =
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.some(
        (entry) => typeof entry === 'string' && entry.includes(productName),
      );
    return res;
  };

  const cleanObject = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, cleanObject(value)]), // Limpa recursivamente
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
    totalVolume,
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
      (client) => client.idUser === item.idUser,
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
          `Você está prestes a resgatar a promoção ${title} para o cliente ${item.name} concedendo um desconto de ${discount} reais. As regras são:${rules} `,
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
          (item) => item === title,
        );
        if (promotionFinded) {
          setAddPromotion(false);
          setMessagePromotionPopup(true);

          const purchasedProducts =
            benefitedClientFinded.benefitUsed.find(
              (item) => item.nomeDaPromocao === title,
            )?.listaDeProdutos || [];

          setSelectedPromotion('');
          setTextPromotion(
            `O cliente ${benefitedClientFinded.name
            } já usou a promoção ${title} na data ${item.dateTime
            } na compra dos itens ${purchasedProducts
              .map((item) => item)
              .join(', ')}`,
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
      `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${benefitedClientFinded.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `,
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
          ]?.nomeDaPromocao,
        )
      ) {
        benefitedClientEdited.promotionTitle.push(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao,
        );
      }
      //add the promotion title to the list of promotions used by the client
      setDoc(doc(db, 'requests', currentRequest.id), currentRequest);
      const docRef = await addDoc(
        collection(db, 'BenefitedCustomer'),
        benefitedClientEdited,
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
          ]?.nomeDaPromocao,
        )
      ) {
        benefitedClientEdited.promotionTitle.push(
          benefitedClientEdited.benefitUsed[
            benefitedClientEdited.benefitUsed.length - 1
          ]?.nomeDaPromocao,
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
          `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${item.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `,
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
        }. As regras são:${currentPromotion.rules} `,
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
        `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${item.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `,
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
        }. As regras são:${currentPromotion.rules} `,
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
    action,
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
        benefitedClientObj,
      );
      console.log('Document written with ID: ', docRef.id);
      fetchData();
      fetchUserRequests();
    }
  };

  const orderDelivery = async (item) => {
    try {
      // 1. Marcar como entregue IMEDIATAMENTE no Firestore para sumir da tela ativa
      const requestRef = doc(db, 'requests', item.id);
      await updateDoc(requestRef, { 
        orderDelivered: true,
        done: false // Garantir que está como "Feito" ao finalizar para sumir corretamente do 'Em preparo' se houver lag
      });

      console.log('Document marked as delivered. UI should update via listener.');

      // 2. Limpar carrinho do usuário se for anônimo ou resetar se for fixo
      if (item.name === 'anonimo' || item.name === 'anonymous') {
        await deleteData('user', item.idUser);
      } else if (item.idUser) {
        const userRef = doc(db, 'user', item.idUser);
        await updateDoc(userRef, { request: [] });
      }

      // 3. Atualizar estoque (processo mais pesado) - Apenas se o pacote for completo
      if (global.hasRawMaterial) {
        await updateIngredientsStock(item);
        console.log('Stock updated successfully!');
      } else {
        console.log('Stock update skipped (Basic Package)');
      }
      // fetchUserRequests(); // Removido: o listener de tempo real já cuida da atualização da lista
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Houve um erro ao finalizar o pedido, mas os dados básicos foram salvos.');
    }
  };

  const openPrintScreen = (item) => {
    global.setUserNewRequest(item);
    navigate('/print');
  };

  const handleEditOrder = async (item) => {
    if (global.orderBeingEdited) {
      alert('Já existe um pedido sendo editado. Finalize ou cancele a edição anterior para editar outro pedido.');
      return;
    }

    try {
      global.setOrderBeingEdited({
        id: item.id,
        countRequest: item.countRequest,
        dateTime: item.dateTime,
        discount: item.discount || 0,
        tableNumber: item.tableNumber || null
      });

      localStorage.setItem(
        'userMenu',
        JSON.stringify({ id: item.idUser, name: item.name })
      );

      if (item.tableNumber) {
        localStorage.setItem('tableNumber', item.tableNumber);
      } else {
        localStorage.removeItem('tableNumber');
      }

      const userDocRef = doc(db, 'user', item.idUser);
      // Aqui o problema reportado: o 'item.request' que vem da base já contém o pedido exato que queremos editar.
      // E ao adicionar a array 'request' do 'user' novamente por cima do 'item.request', as informações dobram.
      // A solução é recarregar no user.request APENAS os itens da requisição atual que está sendo editada.
      // E garantimos que as flags que o cliente usa para habilitar botões (sentToKitchen) estejam presentes.

      const cleanArray = item.request && item.request.length > 0
        ? item.request.map((r, idx) => ({
          ...cleanObject(r),
          sentToKitchen: true,
          parentRequestId: item.id,
          indexInRequest: idx
        }))
        : [];

      await updateDoc(userDocRef, {
        request: cleanArray,
      });

      global.setPdvRequest(true);
    } catch (error) {
      console.error('Error starting order edit:', error);
      alert('Houve um erro ao tentar editar o pedido. Tente novamente.');
      global.setOrderBeingEdited(null);
    }
  };

  const handleRequestItemCancellation = async (order, itemIndex) => {
    const dish = order.request[itemIndex];
    
    // Determina se o pedido já está na cozinha (se tem mesa ou se já foi pago)
    const isInKitchen = order.tableNumber || order.mesa || order.paymentDone;

    if (!isInKitchen) {
      // Fluxo PRÉ-PAGO e ainda não pago -> Item NÃO está na cozinha.
      // Podemos cancelar diretamente no PDV.
      const isConfirmed = window.confirm(`Deseja cancelar o item "${dish.name}"?`);
      if (!isConfirmed) return;

      try {
        const orderRef = doc(db, 'requests', order.id);
        const itemPrice = Number(dish.finalPrice) || 0;

        // Remove do array de itens do pedido
        const updatedRequest = [...order.request];
        updatedRequest.splice(itemIndex, 1);

        // Atualiza o valor total do pedido
        const newTotal = Math.max(0, (Number(order.finalPriceRequest) || 0) - itemPrice);

        await updateDoc(orderRef, {
          request: updatedRequest,
          finalPriceRequest: newTotal
        });

        // Sincroniza a remoção com o documento do usuário (carrinho/histórico ativo)
        if (order.idUser) {
          const userRef = doc(db, 'user', order.idUser);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.request && Array.isArray(userData.request)) {
              // Remove o item que corresponde a esta requisição e índice
              const updatedUserRequest = userData.request.filter(
                (userItem) => !(userItem.parentRequestId === order.id && userItem.indexInRequest === itemIndex)
              );
              await updateDoc(userRef, { request: updatedUserRequest });
            }
          }
        }
        alert('Item cancelado com sucesso.');
      } catch (err) {
        console.error('Erro ao cancelar item:', err);
        alert('Erro ao cancelar item. Tente novamente.');
      }
    } else {
      // Fluxo PÓS-PAGO ou já PAGO -> Item ESTÁ (ou esteve) na cozinha.
      // Solicita confirmação do cancelamento para a cozinha.
      const isConfirmed = window.confirm(`Deseja solicitar o cancelamento do item "${dish.name}" para a cozinha?`);
      if (!isConfirmed) return;

      try {
        const orderRef = doc(db, 'requests', order.id);
        const updatedRequest = [...order.request];
        updatedRequest[itemIndex] = { ...dish, cancelRequested: true };

        await updateDoc(orderRef, {
          request: updatedRequest
        });
        alert('Solicitação de cancelamento enviada para a cozinha.');
      } catch (err) {
        console.error('Erro ao solicitar cancelamento:', err);
        alert('Erro ao solicitar cancelamento. Tente novamente.');
      }
    }
  };

  const toggleRequest = (id) => {
    setOpenRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      {/* OVERLAY EXCLUSIVO DOS CHAMADOS DE GARÇOM E PAGAMENTO - CENTRALIZADO E COM FUNDO ESCURO */}
      {(pendingWaiterCalls.length > 0 || pendingPaymentCalls.length > 0) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Chamados de Mesa */}
          {pendingWaiterCalls.map((callReq) => (
            <div key={callReq.id} style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '25px 30px',
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '350px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>⚠️ Chamado de Mesa</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>
                O cliente <strong>{callReq.waiterCall?.callerName}</strong> da mesa <strong>{callReq.waiterCall?.tableNumber}</strong> pede a presença do responsável.
              </p>
              <button
                onClick={async () => {
                  try {
                    setPendingWaiterCalls(prev => prev.filter(p => p.id !== callReq.id));
                    const docSnap = await getDoc(doc(db, 'requests', callReq.id));
                    if (docSnap.exists() && docSnap.data().waiterCall?.active === true) {
                      await updateDoc(doc(db, 'requests', callReq.id), {
                        'waiterCall.active': false
                      });
                    }
                  } catch (e) { console.error('Error fechar chamado', e) }
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#f44336',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          ))}

          {/* Chamados de PAGAMENTO */}
          {pendingPaymentCalls.map((payReq) => (
            <div key={payReq.id} style={{
              backgroundColor: '#ff9800', // Cor laranja para pagamento
              color: 'white',
              padding: '25px 30px',
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '350px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>💰 Solicitação de Pagamento</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>
                Dirija-se a mesa <strong>{payReq.paymentCall?.tableNumber}</strong> para finalizar o pagamento.
              </p>
              <button
                onClick={async () => {
                  try {
                    setPendingPaymentCalls(prev => prev.filter(p => p.id !== payReq.id));
                    const docSnap = await getDoc(doc(db, 'requests', payReq.id));
                    if (docSnap.exists() && docSnap.data().paymentCall?.active === true) {
                      await updateDoc(doc(db, 'requests', payReq.id), {
                        'paymentCall.active': false
                      });
                    }
                  } catch (e) { console.error('Error fechar chamado pagamento', e) }
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#ff9800',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </div>
          ))}
        </div>
      )}

      <Link to="/admin/admin">
        <Title mainTitle={title} />
      </Link>
      <div className={style.updateMenuMessageWrapper}>
        {loadingAvailableMenuDishes && <UpdateMenuMessage />}
      </div>
      {showFinalizarMessage && (
        <DefaultComumMessage
          msg="Você tem certeza que deseja finalizar este pedido?"
          onClose={closeFinalizarModal}
          onConfirm={() => confirmFinalizarPedido()}
        />
      )}
      {requestsDoneList &&
        requestsDoneList.map((item, itemIndex) => {
          const { status, color } = getStatusAndColor(item); // 👈 aqui
          return (
            <div
              className={style.containerRequestListToBePrepared}
              key={item.id}
              style={{ border: `solid 2px ${color}` }}
            >
              <button
                onClick={() => toggleRequest(item.id)}
                className={style.btnToggle}
              >
                {openRequests[item.id] ? 'Recolher' : 'Expandir'}
              </button>
              {!openRequests[item.id] ? (
                <div
                  className={
                    openRequests[item.id]
                      ? style.requestId
                      : style.requestIdClosed
                  }
                >
                  <p>
                    <span>Nome</span> {firstNameClient(item.name)}
                  </p>
                  {item.tableNumber && (
                    <p>
                      <span>Mesa</span> {item.tableNumber}
                    </p>
                  )}
                  <p>
                    <span>Ordenação</span>: {item.countRequest}
                  </p>
                  <p>
                    <span>Data</span> {item.dateTime}
                  </p>

                  <p>
                    <span>Status</span> {status}
                  </p>
                  <p>
                    <span>Valor</span>R${' '}
                    {(Number(item.finalPriceRequest) || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ) : (
                <div className={style.userContainer}>
                  <div>
                    <p>
                      <span>Nome</span> {firstNameClient(item.name)}
                    </p>
                    {item.tableNumber && (
                      <p>
                        <span>Mesa</span> {item.tableNumber}
                      </p>
                    )}
                    <p>
                      <span>Pedido</span>: {getFirstFourLetters(item.id, 4)} ;
                    </p>
                    <p>
                      <span>Ordenação</span>: {item.countRequest}
                    </p>
                    <p>
                      <span>Data</span> {item.dateTime}
                    </p>
                    <h4 style={{ textAlign: 'center', margin: '5px 0', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                      Itens: R${' '}
                      {(
                        Number(item.finalPriceRequest || 0) -
                        Number(item.serviceChargeValue || 0)
                      ).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                    {item.serviceChargeEnabled && (
                      <h4 style={{ textAlign: 'center', margin: '5px 0', color: 'var(--btn-color)' }}>
                        Taxa de Serviço (10%): R${' '}
                        {(Number(item.serviceChargeValue) || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </h4>
                    )}
                    <h2 style={{ marginTop: '5px' }}>
                      Valor final R${' '}
                      {(Number(item.finalPriceRequest) || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h2>
                    
                    {item.customerFeedback && (
                      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '5px solid var(--btn-color)' }}>
                        {item.customerFeedback.service && (
                          <p style={{ fontSize: '0.9rem', textAlign: 'left', marginBottom: '4px' }}>
                            <span>Avaliação do serviço:</span> {item.customerFeedback.service} / 5
                          </p>
                        )}
                        {item.customerFeedback.product && (
                          <p style={{ fontSize: '0.9rem', textAlign: 'left', marginBottom: '4px' }}>
                            <span>Avaliação do produto:</span> {item.customerFeedback.product} / 5
                          </p>
                        )}
                        {item.customerFeedback.comment && (
                          <p style={{ fontSize: '0.9rem', textAlign: 'left', fontStyle: 'italic', marginTop: '8px' }}>
                            <span>Comentário:</span> "{item.customerFeedback.comment}"
                          </p>
                        )}
                      </div>
                    )}
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
                    {global.packageTier !== 1 && (
                      <div className={style.promotionSelect}>
                        <select
                          name="selectedPromotion"
                          value={selectedPromotion}
                          onChange={(e) => handleSelectChange(e, item)}
                        >
                          <option value="">Promoções</option>
                          {promotions &&
                            promotions.length > 0 &&
                            promotions.map((promotion, index) => (
                              <option key={index} value={index}>
                                {promotion.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className={style.btnStatus}>
                    <button
                      onClick={() => openShowModal(item.id)}
                      className={style.pendent}
                      disabled={global.orderBeingEdited?.id === item.id}
                    >
                      Cancelar pedido
                    </button>
                    <div>
                      {ShowDefaultMessage && selectedRequestId === item.id && (
                        <DefaultComumMessage
                          msg="Você está prestes a excluir esse pedido"
                          onClose={closeModal}
                          onConfirm={() =>
                            handleDeleteRequest(selectedRequestId)
                          }
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
                    {localStorage.getItem('pdv') === 'true' && !item.paymentDone && (
                      <button
                        className={style.pendent}
                        style={{ backgroundColor: 'orange', color: 'white' }}
                        onClick={() => handleEditOrder(item)}
                        disabled={global.orderBeingEdited?.id === item.id}
                      >
                        {global.orderBeingEdited?.id === item.id ? 'Editando...' : 'Editar Pedido'}
                      </button>
                    )}
                    <button
                      disabled={!item.paymentMethod || global.orderBeingEdited?.id === item.id}
                      className={item.paymentDone ? style.done : style.pendent}
                      onClick={() => changeStatusPaid(item)}
                    >
                      Pago
                    </button>
                    {item.tableNumber ? (() => {
                      const btnState = getPostpaidButtonState(item);
                      return (
                        <button
                          disabled={item.orderDelivered || global.orderBeingEdited?.id === item.id || btnState.label === 'PRONTO'}
                          className={btnState.className}
                          style={btnState.inlineStyle}
                          onClick={() => handleWaiterDelivery(item)}
                        >
                          {btnState.label}
                        </button>
                      );
                    })() : (
                    <button
                        disabled={true}
                        className={isOrderFullyFinished(item) ? style.done : style.pendent}
                      >
                        Pronto
                      </button>
                    )}
                    <button
                      disabled={!item.paymentDone || item.orderDelivered || global.orderBeingEdited?.id === item.id || !isOrderFullyFinished(item)}
                      className={style.pendent}
                      onClick={() => openFinalizarModal(item)}
                    >
                      Finalizar
                    </button>
                    <button
                      disabled={!item.paymentMethod || global.orderBeingEdited?.id === item.id}
                      className={style.btnFiscalAttributes}
                      onClick={() => openPrintScreen(item)}
                    >
                      Nota Fiscal
                    </button>
                  </div>
                </div>
              )}
              {item.request &&
                openRequests[item.id] &&
                item.request.map((item, recipeIndex) => (
                  <div className={style.requestItem} key={recipeIndex}>
                    {recipeModal.openModal && (
                      <RecipeModal
                        setRecipeModal={setRecipeModal}
                        recipeModal={recipeModal}
                      />
                    )}
                    <div>
                      <h5 style={{ textAlign: 'center', marginBottom: '8px' }}>{item.name}</h5>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        {item.pronto && <span className={style.indicatorPronto}>Pronto</span>}
                        {item.entregue && <span className={style.indicatorEntregue}>Entregue</span>}
                      </div>
                      {item.entregue && item.tempo_levado && (
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', fontWeight: 'bold', marginBottom: '5px' }}>
                          ({item.tempo_levado})
                        </div>
                      )}

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
                      <button
                        onClick={() => handleRequestItemCancellation(requestsDoneList[itemIndex], recipeIndex)}
                        className="btn btn-danger"
                        disabled={item.pronto || item.entregue || item.cancelRequested || requestsDoneList[itemIndex].paymentDone}
                        style={{ marginLeft: '10px' }}
                      >
                        {item.cancelRequested ? 'Cancelamento Solicitado' : 'Cancelar Item'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
    </div>
  );
};
export default RequestListToBePrepared;

///admin/requestlist
