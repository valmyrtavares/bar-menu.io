import React from 'react';
import { db } from '../../config-firebase/firebase.js';
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
  onSnapshot,
} from 'firebase/firestore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CheckDishesModal from '../Dishes/CheckdishesModal.js';
import AutoPayment from '../Payment/AutoPayment.js';
import '../../assets/styles/requestModal.css';
import {
  deleteRequestItem,
  getOneItemColleciton,
  getBtnData,
} from '../../api/Api.js';
import WarningMessages from '../WarningMessages';
import useLocalStorage from '../../Hooks/useLocalStorage.js';
import TotenRegisterPopup from './TotenRegisterPopup.js';
import PrintRequestCustomer from './PrintRequestCustomer';
import { GlobalContext } from '../../GlobalContext';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
//import { cardClasses } from "@mui/material";
import { getAnonymousUser } from '../../Hooks/useEnsureAnonymousUser.js';
import BillFeedbackPopup from './BillFeedbackPopup';
import BillSummaryPopup from './BillSummaryPopup';
import { TRUE } from 'sass';
import DeliveryAddressPopup from './DeliveryAddressPopup';
import MessagePromotions from '../Promotions/MessagePromotions';

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState('');
  const [userData, setUserData] = React.useState(null);
  const [backorder, setBackorder] = React.useState(null);
  const [showDeliveryPopup, setShowDeliveryPopup] = React.useState(false);
  const [showDeliveryRegistrationPrompt, setShowDeliveryRegistrationPrompt] = React.useState(false);
  const [deliveryAddress, setDeliveryAddress] = React.useState(null);
  const [showAddressConfirmedMsg, setShowAddressConfirmedMsg] = React.useState(false);

  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [disabledBtn, setDisabledBtn] = React.useState(true);
  const [finalPriceRequest, setFinalPriceRequest] = React.useState(null);
  const [isToten, setIsToten] = React.useState(null); //Habilita certos dispositivos a deslogar o cliente após o envio do pedido
  const [warningMsg, setWarningMsg] = React.useState(false); //Open message to before send request to next step
  const [totenMessage, setTotenMessage] = React.useState(false); //Open message to before send request to next step
  const [openCloseTotenPupup, setOpenCloseTotenPopup] = React.useState(false); //Open message to before send request to next step
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoPayment, setAutoPayment] = React.useState(false); //Habilita o pagamento automático
  const [errorPaymentMessage, setErrorPaymentMessage] = React.useState('false');
  const [autoPaymentMachineOn, setAutoPaymentMachineOn] = React.useState(true);
  const [totenRejectPaymentMessage, setTotenRejectPaymentMessage] = React.useState(false);
  const [billPopUpStep, setBillPopUpStep] = React.useState(0); // 0: closed, 1: ratings, 2: bill summary
  const [serviceRating, setServiceRating] = React.useState(0);
  const [foodRating, setFoodRating] = React.useState(0);
  const [waiterComment, setWaiterComment] = React.useState('');
  const [includeServiceCharge, setIncludeServiceCharge] = React.useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [activeRequestDocId, setActiveRequestDocId] = React.useState(null);
  const [promotions, setPromotions] = React.useState([]);
  const [selectedPromotion, setSelectedPromotion] = React.useState('');
  const [activePromoIndex, setActivePromoIndex] = React.useState(null);
  const [messagePromotionPopup, setMessagePromotionPopup] = React.useState(false);
  const [textPromotion, setTextPromotion] = React.useState('');
  const [AddPromotion, setAddPromotion] = React.useState(false);
  const [benefitedClient, setBenefitedClient] = React.useState([]);
  const [benefitedClientEdited, setBenefitedClientEdited] = React.useState({});
  const [operation, setOperation] = React.useState('');
  const [currentDiscount, setCurrentDiscount] = React.useState(0);

  const syncServiceChargeToFirestore = async (isEnabled) => {
    try {
      const currentTable = localStorage.getItem('tableNumber');
      if (userData && currentTable) {
        const q = query(
          collection(db, 'requests'),
          where('tableNumber', '==', currentTable),
          where('idUser', '==', userData.id),
          where('orderDelivered', '==', false)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const openOrderDoc = querySnapshot.docs[0];
          const requestDocRef = doc(db, 'requests', openOrderDoc.id);
          const itemsTotal = userData.request.reduce((acc, curr) => acc + curr.finalPrice, 0);

          await updateDoc(requestDocRef, {
            serviceChargeEnabled: isEnabled,
            serviceChargeValue: isEnabled ? Number((itemsTotal * 0.1).toFixed(2)) : 0,
            finalPriceRequest: isEnabled ? Number((itemsTotal * 1.1).toFixed(2)) : itemsTotal
          });
        }
      }
    } catch (error) {
      console.error('Error syncing service charge:', error);
    }
  };

  const handleServiceChargeChange = (isEnabled) => {
    setIncludeServiceCharge(isEnabled);
    syncServiceChargeToFirestore(isEnabled);
  };

  const handlePaymentFinalization = async () => {
    setIsProcessingPayment(true);
    try {
      const currentTable = localStorage.getItem('tableNumber');
      if (userData && currentTable) {
        const q = query(
          collection(db, 'requests'),
          where('tableNumber', '==', currentTable),
          where('idUser', '==', userData.id),
          where('orderDelivered', '==', false)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const openOrderDoc = querySnapshot.docs[0];
          const requestDocRef = doc(db, 'requests', openOrderDoc.id);

          const itemsTotal = userData.request.reduce((acc, curr) => acc + curr.finalPrice, 0);
          const totalFinalWithService = includeServiceCharge 
            ? itemsTotal * 1.1 
            : itemsTotal;

          const feedback = {};
          if (serviceRating > 0) feedback.service = serviceRating;
          if (foodRating > 0) feedback.product = foodRating;
          if (waiterComment.trim()) {
            const words = waiterComment.trim().split(/\s+/);
            const truncatedComment = words.length > 5 
              ? words.slice(0, 5).join(' ') + '...' 
              : waiterComment.trim();
            feedback.comment = truncatedComment;
            feedback.fullComment = waiterComment.trim();
          }

          const updateData = {};
          if (Object.keys(feedback).length > 0) {
            updateData.customerFeedback = feedback;
          }

          updateData.serviceChargeEnabled = includeServiceCharge;
          updateData.serviceChargeValue = includeServiceCharge ? Number((itemsTotal * 0.1).toFixed(2)) : 0;
          updateData.finalPriceRequest = Number(totalFinalWithService.toFixed(2));

          // Adiciona a notificação de pagamento para o PDV
          updateData.paymentCall = {
            active: true,
            tableNumber: currentTable,
            callerName: userData.name || 'Cliente'
          };

          setActiveRequestDocId(openOrderDoc.id);
          await updateDoc(requestDocRef, updateData);
        }
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  // Close popups when order is finalized by waiter
  React.useEffect(() => {
    if (!isProcessingPayment || !activeRequestDocId) return;

    const requestDocRef = doc(db, 'requests', activeRequestDocId);

    const unsubscribe = onSnapshot(requestDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().orderDelivered === true) {
        // Order was finalized by waiter. Close the process.
        console.log('Active order finalized by waiter. Closing popups.');
        setIsProcessingPayment(false);
        setBillPopUpStep(0); // Fecha os popups completamente
        setActiveRequestDocId(null);
      }
    });

    return () => unsubscribe();
  }, [isProcessingPayment, activeRequestDocId]);

  // Waiter Call Feature State
  const [waiterCallActive, setWaiterCallActive] = React.useState(false);
  const [waiterCallMessage, setWaiterCallMessage] = React.useState(false);

  const idPayerRef = React.useRef('');

  const [pdv, setPdv] = useLocalStorage('pdv', false);

  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);
  const location = useLocation();
  const isAdminOrigin = !!location.state?.isAdminOrigin;
  const [stylePdv, setStylePdv] = React.useState(false);
  let methodPayment = '';
  let cpfForInvoice = '';
  let paymentTransactionData = null;

  const isTableClient = !pdv && !global.isToten && localStorage.getItem('tableNumber');

  React.useEffect(() => {
    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      setCurrentUser(currentUserNew.id);
    }
    if (localStorage.hasOwnProperty('isToten')) {
      const toten = JSON.parse(localStorage.getItem('isToten'));
      if (toten) setIsToten(true);
    }

    if (localStorage.hasOwnProperty('autoPaymentMachineOn')) {
      const autoPaymentAllow = JSON.parse(
        localStorage.getItem('autoPaymentMachineOn'),
      );
      autoPaymentAllow
        ? setAutoPaymentMachineOn(true)
        : setAutoPaymentMachineOn(false);
    }

    if (localStorage.hasOwnProperty('backorder')) {
      const raw = localStorage.getItem('backorder');
      let orderStoraged = [];

      if (raw) {
        try {
          orderStoraged = JSON.parse(raw);
        } catch (err) {
          console.warn("Valor inválido para 'backorder':", raw);
          orderStoraged = [];
        }
      }

      setBackorder(orderStoraged);
    }
  }, []);

  React.useEffect(() => {
    console.log('pdv é ', pdv);
    console.log('É DO ADMINISTRADOR isAdminOrigin é ', global.pdvRequest);

    if (pdv && global.pdvRequest) {
      setStylePdv(true);
    } else {
      setStylePdv(false);
    }
  }, [pdv, global]);

  React.useEffect(() => {
    if (userData && Array.isArray(userData.request)) {
      // Mudança aqui: Verificação de que userData existe e que request é um array

      if (localStorage.hasOwnProperty('backorder')) {
        const orderStoraged = JSON.parse(localStorage.getItem('backorder'));
        if (orderStoraged && orderStoraged.length > 0) {
          if (userData.request && userData.request.length > 0) {
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
      checkWaiterCallStatus();
    }
    console.log('userData mudou:', userData);
  }, [userData]);

  // Reset payment processing if order is cleared/paid by PDV (requests array becomes empty or null)
  React.useEffect(() => {
    if (!userData?.request || userData.request.length === 0) {
      if (billPopUpStep > 0) {
        setIsProcessingPayment(false);
        setBillPopUpStep(0);
        setActiveRequestDocId(null);
      }
    }
  }, [userData, billPopUpStep]);

  const allRequestsReady = React.useMemo(() => {
    if (!userData || !userData.request || userData.request.length === 0) return false;
    return userData.request.every(item => item.status === 'Pronto');
  }, [userData]);

  const checkWaiterCallStatus = async () => {
    try {
      if (isTableClient && userData && userData.id) {
        const currentTable = localStorage.getItem('tableNumber');
        const q = query(
          collection(db, 'requests'),
          where('idUser', '==', userData.id),
          where('tableNumber', '==', currentTable),
          where('orderDelivered', '==', false)
        );
        // NOVO: Usando onSnapshot para reagir quando o PDV fechar o chamado
        onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const orderData = snapshot.docs[0].data();
            if (orderData.waiterCall && orderData.waiterCall.active) {
              setWaiterCallActive(true);
            } else {
              setWaiterCallActive(false);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking waiter call status', error);
    }
  };


  React.useEffect(() => {
    let unsubscribe;
    if (currentUser) {
      if (backorder) {
        updateingNewCustomer(backorder);
      }
      const userDocRef = doc(db, 'user', currentUser);
      unsubscribe = onSnapshot(userDocRef, (userDocSnap) => {
        const data = userDocSnap.data();
        if (data) {
          setUserData({ ...data, id: userDocSnap.id });
          if (data.request && data.request.length > 0) {
            setDisabledBtn(true);
          }
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  React.useEffect(() => {
    const fetchPromos = async () => {
      const promosData = await getBtnData('promotions');
      const benefited = await getBtnData('BenefitedCustomer');
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const filteredPromos = promosData.filter((promotion) => {
        if (!promotion.startDate || !promotion.finalDate) return false;
        const startParts = promotion.startDate.split('-');
        const finalParts = promotion.finalDate.split('-');
        const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        const finalDate = new Date(finalParts[0], finalParts[1] - 1, finalParts[2]);
        return today >= startDate && today <= finalDate;
      });

      setPromotions(filteredPromos);
      setBenefitedClient(benefited);
    };
    
    if (stylePdv) {
      fetchPromos();
    }
  }, [stylePdv]);

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
        setUserData({ ...data, id: userDocSnap.id });

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
        // Acrescente o novo objeto 'form' ao array 'requests'
        currentRequests.push(...data);
        console.log('form   ', currentRequests);

        // Atualize o documento com o novo array 'requests'
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
    if (data && data.request && data.request.length > 0) {
      let finalPrice = data.request
        .map((item) => item.finalPrice || item.price || 0)
        .reduce((ac, el) => ac + el, 0);

      // Aplica desconto acumulado se houver
      const selectedPromo = promotions[selectedPromotion];
      if (!selectedPromo?.promotionalItemId && (operation === 'edit' || operation === 'add')) {
          finalPrice -= Number(selectedPromo?.discount || 0);
      }

      setFinalPriceRequest(Number(finalPrice.toFixed(2)));
    }
  };

  const deleteRequest = async (index) => {
    await deleteRequestItem(currentUser, index);
    // fetchData() não existe aqui, o onSnapshot deve lidar com o update
  };

  const callDishesModal = (item) => {
    //chama o modal com o resumo do item
    if (item) {
      setItem(item);
      setModal(true);
    }
  };

  // Promoções Logic
  const handleSelectChange = async (e) => {
    const { value } = e.target;
    
    // GATILHO LIMPO: Reseta o select imediatamente para "Promoções" assim que é clicado.
    // Isso garante que o evento onChange dispare sempre no próximo clique.
    setSelectedPromotion(''); 
    
    if (!value) return; 
    
    const indexStr = Number(value);
    const currentPromotion = promotions[indexStr];
    if (!currentPromotion) return;
    
    const { title, reusable, rules, discount, minimumValue, promotionalItemId, promotionalItemName } = currentPromotion;
    setActivePromoIndex(indexStr); // Garante que o índice numérico seja salvo

    const benefitedClientObj = {
      name: userData.name,
      idUser: userData.id,
      promotionTitle: [title],
      dateTime: takeDataTime(),
      currentFinalPriceRequest: finalPriceRequest,
      benefitUsed: [],
    };

    const benefitedClientFinded = benefitedClient.find(
      (client) => client.idUser === userData.id
    );

    if (!benefitedClientFinded) {
      setMessagePromotionPopup(true);
      setAddPromotion(true);
      if (minimumValue) {
        acumulativePurchase(benefitedClientObj, currentPromotion);
      } else {
        if (promotionalItemId) {
          try {
            const itemPromo = await getOneItemColleciton('item', promotionalItemId);
            if (!itemPromo || itemPromo.display === false) {
              setTextPromotion(`Infelizmente o produto da promoção (${promotionalItemName}) está indisponível no momento.`);
              setAddPromotion(false);
              setMessagePromotionPopup(true);
              // setSelectedPromotion(''); // REMOVIDO
              return;
            }
          } catch (error) {
            console.error("Erro ao verificar item da promoção", error);
          }
        }

        const promoMsg = promotionalItemId 
          ? `Você está prestes a resgatar a promoção ${title} para o cliente ${userData.name}, acrescentando o item ${promotionalItemName} por R$ ${discount || 0}. As regras são:${rules} `
          : `Você está prestes a resgatar a promoção ${title} para o cliente ${userData.name} concedendo um desconto de ${discount} reais. As regras são:${rules} `;
        
        setTextPromotion(promoMsg);
        benefitedClientObj.benefitUsed.push({
          date: takeDataTime(),
          nomeDaPromocao: title,
          discount: discount,
          listaDeProdutos: userData.request.map((req) => req.name),
        });
        setBenefitedClientEdited(benefitedClientObj);
        setOperation('add');
      }
      return;
    } else {
      if (reusable === 'false') {
        const promotionFinded = benefitedClientFinded.promotionTitle.find(
          (item) => item === title
        );
        if (promotionFinded) {
          setAddPromotion(false);
          setMessagePromotionPopup(true);
          // setSelectedPromotion(''); // REMOVIDO
          setTextPromotion(`O cliente ${userData.name} já usou a promoção ${title}.`);
          return;
        }
      }
      redeemingBenefits(benefitedClientFinded, currentPromotion);
    }
  };

  const redeemingBenefits = (benefitedClientFinded, currentPromotion) => {
    if (currentPromotion.minimumValue) {
      acumulativePurchase(benefitedClientFinded, currentPromotion);
      return;
    }
    setAddPromotion(true);
    
    benefitedClientFinded.benefitUsed.push({
      date: takeDataTime(),
      nomeDaPromocao: currentPromotion.title,
      discount: currentPromotion.discount,
      listaDeProdutos: userData.request.map((req) => req.name),
    });

    const promoMsg = currentPromotion.promotionalItemId 
      ? `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${userData.name}, acrescentando o item ${currentPromotion.promotionalItemName} por R$ ${currentPromotion.discount || 0}. As regras são:${currentPromotion.rules} `
      : `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${userData.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `;
    
    setTextPromotion(promoMsg);
    setCurrentDiscount(currentPromotion.discount);
    setMessagePromotionPopup(true);
    setOperation('edit');
    setBenefitedClientEdited(benefitedClientFinded);
  };

  const acumulativePurchase = (benefitedClientObj, currentPromotion) => {
    const currentScore = benefitedClientObj.score || 0;
    const totalWithNew = currentScore + finalPriceRequest;

    if (totalWithNew >= currentPromotion.minimumValue) {
      setMessagePromotionPopup(true);
      setAddPromotion(true);
      const promoMsg = currentPromotion.promotionalItemId 
        ? `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${userData.name}, acrescentando o item ${currentPromotion.promotionalItemName} por R$ ${currentPromotion.discount || 0}. As regras são:${currentPromotion.rules} `
        : `Você está prestes a resgatar a promoção ${currentPromotion.title} para o cliente ${userData.name}, concedendo um desconto de ${currentPromotion.discount} reais. As regras são:${currentPromotion.rules} `;
      
      setTextPromotion(promoMsg);
      benefitedClientObj.benefitUsed.push({
        date: takeDataTime(),
        nomeDaPromocao: currentPromotion.title,
        discount: currentPromotion.discount,
        listaDeProdutos: userData.request.map((req) => req.name),
      });
      setBenefitedClientEdited(benefitedClientObj);
      setOperation(benefitedClientObj.id ? 'edit' : 'add');
    } else {
      setMessagePromotionPopup(true);
      setAddPromotion(false);
      setTextPromotion(`O valor acumulado (${totalWithNew}) ainda é inferior ao mínimo (${currentPromotion.minimumValue}).`);
      benefitedClientObj.score = totalWithNew;
      addBenefitedClientWithNoDescount(benefitedClientObj, benefitedClientObj.id ? 'edit' : 'add');
    }
  };

  const addBenefitedClientWithNoDescount = async (benefitedClientObj, action) => {
    if (action === 'edit') {
      await updateDoc(doc(db, 'BenefitedCustomer', benefitedClientObj.id), benefitedClientObj);
    } else {
      await addDoc(collection(db, 'BenefitedCustomer'), benefitedClientObj);
    }
  };

  const applyPromotionToFirestore = async () => {
    const selectedPromo = promotions[activePromoIndex];
    const userDocRef = doc(db, 'user', currentUser);
    
    if (selectedPromo?.promotionalItemId) {
      try {
        const itemPromo = await getOneItemColleciton('item', selectedPromo.promotionalItemId);
        const updatedRequest = [...userData.request];
        const nextIndex = updatedRequest.length > 0 
          ? Math.max(...updatedRequest.map(r => r.indexInRequest ?? 0)) + 1 
          : 0;

        const newPromoItem = {
          ...itemPromo,
          finalPrice: Number(selectedPromo.discount || 0),
          promotional: true,
          status: 'pendente',
          indexInRequest: nextIndex,
          sentToKitchen: false
        };
        
        updatedRequest.push(newPromoItem);
        await updateDoc(userDocRef, { request: updatedRequest });
      } catch (error) {
        console.error("Erro ao adicionar item promocional", error);
      }
    }

    if (operation === 'add') {
      await addDoc(collection(db, 'BenefitedCustomer'), benefitedClientEdited);
    } else if (operation === 'edit') {
      await updateDoc(doc(db, 'BenefitedCustomer', benefitedClientEdited.id), benefitedClientEdited);
    }
    
    // NOVO: Limpar ao final da operação
    setMessagePromotionPopup(false);
    setSelectedPromotion('');
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
            where('name', '==', 'anonymous'),
          );
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Pegar o primeiro documento encontrado (deve ser único)
            const anonymousUserDoc = querySnapshot.docs[0];
            const userDocRef = doc(db, 'user', anonymousUserDoc.id);
            // Atualizar o campo 'requests' para []
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
            error,
          );
        }
      }

      setOpenCloseTotenPopup(true);
      return;
    }

    sendRequestToKitchen();
  };

  const isProcessing = React.useRef(false); // Bloqueia múltiplas execuções

  const handleDeliveryClick = () => {
    if (userData?.name && userData.name !== 'anonimo' && userData.name !== 'anonymous') {
      setShowDeliveryPopup(true);
    } else {
      setShowDeliveryRegistrationPrompt(true);
    }
  };

  const handleRegisterForDelivery = async () => {
    if (userData?.request) {
      localStorage.setItem('backorder', JSON.stringify(userData.request));
      try {
        const userQuery = query(collection(db, 'user'), where('name', '==', 'anonymous'));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const anonymousUserDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'user', anonymousUserDoc.id), { request: [] });
        }
      } catch (err) {}
    }
    logout();
  };

  const sendRequestToKitchen = async (e) => {
    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));

      if (pdv === true && global.pdvRequest) {
        if (isProcessing.current) return;
        isProcessing.current = true;
        try {
          const data = await getOneItemColleciton('user', currentUserNew.id);
          await addRequestUser(data);
          global.setPdvRequest(false);
        } catch (err) {
          console.error('Erro no envio PDV:', err);
        } finally {
          isProcessing.current = false;
        }
        return;
      } else if (isToten && isToten === true) {
        if (isProcessing.current) return;
        isProcessing.current = true;
        try {
          await addRequestUserToten(currentUserNew.id);
          setTotenMessage(true);
          // O Toten tem um tempo de espera visual antes de voltar ao início
          await new Promise(resolve => setTimeout(resolve, 5000));
          setTotenMessage(false);
          navigate('/');
        } catch (err) {
          console.error('Erro no envio Toten:', err);
        } finally {
          isProcessing.current = false;
        }
        return;
      } else if (warningMsg) {
        if (isProcessing.current) return;
        if (isSubmitting) return;

        isProcessing.current = true;
        setIsSubmitting(true);

        try {
          const data = await getOneItemColleciton('user', currentUserNew.id);
          if (data) {
            await addRequestUser(data);
            // Fechamos o modal ANTES de liberar o botão, garantindo que o usuário não clique de novo
            setWarningMsg(false);
          }
        } catch (err) {
          console.error('Erro no envio Mobile:', err);
        } finally {
          setIsSubmitting(false);
          isProcessing.current = false;
        }
      } else {
        setWarningMsg(true);
      }
    }
  };

  const takeDataTime = () => {
    const now = new Date();
    const formattedDateTime = `${String(now.getDate()).padStart(
      2,
      '0',
    )}/${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}/${now.getFullYear()} - ${String(now.getHours()).padStart(
      2,
      '0',
    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds(),
    ).padStart(2, '0')}`;
    return formattedDateTime;
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

  const addRequestUser = async (data) => {
    try {
      const userNewRequest = {
        name:
          data.name === 'anonimo' || data.name === 'anonymous'
            ? data.fantasyName
            : data.name,
        idUser: data.id,
        done: true,
        // recipe: item.recipe ? item.recipe : {},
        orderDelivered: false,
        paymentDone: deliveryAddress ? false : undefined,
        deliveryAddress: deliveryAddress || null,
        request: data.request.map((item, idx) => ({
          ...item,
          sentToKitchen: true,
          sentToKitchenTime: item.sentToKitchenTime || takeDataTime(),
          parentRequestId: global.orderBeingEdited ? global.orderBeingEdited.id : null,
          indexInRequest: idx
        })),
        finalPriceRequest: finalPriceRequest,
        idPayer: idPayerRef.current,
        dateTime: global.orderBeingEdited ? global.orderBeingEdited.dateTime : takeDataTime(),
        countRequest: global.orderBeingEdited ? global.orderBeingEdited.countRequest : await countingRequest(),
        tableNumber: global.orderBeingEdited ? (global.orderBeingEdited.tableNumber || localStorage.getItem('tableNumber')) : (localStorage.getItem('tableNumber') || null),
      };

      setIsSubmitting(true);
      if (userNewRequest) {
        const cleanedUserNewRequest = cleanObject(userNewRequest);
        if (global.orderBeingEdited) {
          const requestDocRef = doc(db, 'requests', global.orderBeingEdited.id);
          await updateDoc(requestDocRef, cleanedUserNewRequest);
          global.setOrderBeingEdited(null);
          // Só limpa o tableNumber se estivermos explicitamente no modo PDV/Admin
          if (pdv || stylePdv) {
            localStorage.removeItem('tableNumber');
          }

          const userDocRef = doc(db, 'user', cleanedUserNewRequest.idUser);
          if (global.orderBeingEdited.tableNumber) {
            const updatedRequests = data.request.map((item, idx) => ({
              ...item,
              sentToKitchen: true,
              parentRequestId: global.orderBeingEdited.id,
              indexInRequest: idx
            }));
            await updateDoc(userDocRef, { request: updatedRequests });
          } else {
            await updateDoc(userDocRef, { request: [] });
          }
        } else {
          const docRef = await addDoc(collection(db, 'requests'), cleanedUserNewRequest);

          // Se acabamos de criar o pedido, atualizamos os documentos com o ID real
          const finalItemsWithId = cleanedUserNewRequest.request.map(item => ({
            ...item,
            parentRequestId: docRef.id
          }));
          await updateDoc(docRef, { request: finalItemsWithId });

          const userDocRef = doc(db, 'user', cleanedUserNewRequest.idUser);
          if (cleanedUserNewRequest.tableNumber) {
            const updatedRequests = data.request.map((item, idx) => ({
              ...item,
              sentToKitchen: true,
              parentRequestId: docRef.id,
              indexInRequest: idx
            }));
            await updateDoc(userDocRef, { request: updatedRequests });
          } else {
            await updateDoc(userDocRef, { request: [] });
          }
        }
      }
      setTotenMessage(false);

      const isPdvLocal = localStorage.getItem('pdv') === 'true';
      if (isPdvLocal) {
        try {
          if (!userNewRequest.tableNumber) {
            const userDocRef = doc(db, 'user', currentUser);
            await updateDoc(userDocRef, { request: [] });
          }
          localStorage.removeItem('userMenu');
          global.setAuthorizated(false);
        } catch (err) {
          console.error('Erro ao limpar sessão PDV:', err);
        }
      }

      if (pdv && global.pdvRequest) {
        navigate('/admin/requestlist');
        global.setPdvRequest(false);
        global.setPdvMobileView('orders');
      } else {
        navigate('/orderqueue');
      }
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
      setIsSubmitting(false);
      isProcessing.current = false;
    }
  };

  //send request with finel price
  const addRequestUserToten = async (id) => {
    try {
      if (id) {
        setIsSubmitting(true);
        const data = await getOneItemColleciton('user', id);
        // ... rest of the function (condensed for tool usage)
        const storedRequests = localStorage.getItem('backorder');
        const previousRequests = storedRequests ? JSON.parse(storedRequests) : [];

        const userNewRequest = {
          name:
            data.name === 'anonimo' || data.name === 'anonymous'
              ? data.fantasyName
              : data.name,
          idUser: data.id,
          done: true,
          cpfForInvoice: cpfForInvoice ? cpfForInvoice : '',
          paymentDone:
            methodPayment &&
              methodPayment !== 'CASH' &&
              methodPayment !== 'desabled' &&
              methodPayment !== 'ABORTED' &&
              methodPayment !== 'REJECTED'
              ? true
              : false,
          paymentMethod: methodPayment,
          paymentDetails: paymentTransactionData ? {
            idPayer: paymentTransactionData.idPayer,
            cardBrand: paymentTransactionData.cardBrand,
            cardBrandCode: paymentTransactionData.cardBrandCode,
            nsu: paymentTransactionData.nsu,
            nsuAuthorizer: paymentTransactionData.nsuAuthorizer,
            authorizationCode: paymentTransactionData.authorizationCode,
            transactionDateTime: paymentTransactionData.transactionDateTime,
            acquirer: paymentTransactionData.acquirer,
            acquirerCNPJ: paymentTransactionData.acquirerCNPJ,
            value: paymentTransactionData.value,
            installments: paymentTransactionData.installments,
            terminalId: paymentTransactionData.terminalId,
            paymentMethod: paymentTransactionData.paymentMethod,
            paymentType: paymentTransactionData.paymentType,
            customerReceipt: paymentTransactionData.customerReceipt,
            shopReceipt: paymentTransactionData.shopReceipt,
          } : null,
          orderDelivered: false,
          request: previousRequests.map((item, idx) => ({
            ...item,
            sentToKitchen: true,
            sentToKitchenTime: item.sentToKitchenTime || takeDataTime(),
            indexInRequest: idx
          })),
          finalPriceRequest: finalPriceRequest,
          idPayer: idPayerRef.current,
          dateTime: global.orderBeingEdited ? global.orderBeingEdited.dateTime : takeDataTime(),
          countRequest: global.orderBeingEdited ? global.orderBeingEdited.countRequest : await countingRequest(),
          tableNumber: global.orderBeingEdited ? (global.orderBeingEdited.tableNumber || localStorage.getItem('tableNumber')) : (localStorage.getItem('tableNumber') || null),
        };

        localStorage.removeItem('backorder');
        if (userNewRequest) {
          const cleanedUserNewRequest = cleanObject(userNewRequest);
          if (global.orderBeingEdited) {
            const requestDocRef = doc(db, 'requests', global.orderBeingEdited.id);
            await updateDoc(requestDocRef, cleanedUserNewRequest);
            global.setOrderBeingEdited(null);
            if (pdv || stylePdv) {
              localStorage.removeItem('tableNumber');
            }

            const userDocRef = doc(db, 'user', id);
            if (global.orderBeingEdited.tableNumber) {
              const updatedRequests = (data.request || []).map((item, idx) => ({
                ...item,
                sentToKitchen: true,
                parentRequestId: global.orderBeingEdited.id,
                indexInRequest: idx,
              }));
              await updateDoc(userDocRef, { request: updatedRequests });
            } else {
              await updateDoc(userDocRef, { request: [] });
            }
          } else {
            const docRef = await addDoc(
              collection(db, 'requests'),
              cleanedUserNewRequest,
            );
            const userDocRef = doc(db, 'user', id);
            if (cleanedUserNewRequest.tableNumber) {
              const updatedRequests = (data.request || []).map((item, idx) => ({
                ...item,
                sentToKitchen: true,
                parentRequestId: docRef.id,
                indexInRequest: idx,
              }));
              await updateDoc(userDocRef, { request: updatedRequests });
            } else {
              await updateDoc(userDocRef, { request: [] });
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar pedido Toten:', error);
      setIsSubmitting(false);
      isProcessing.current = false;
    }
  };

  const sendOrderToKitchenOnly = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setIsSubmitting(true);

    try {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      const data = await getOneItemColleciton('user', currentUserNew.id);

      if (data && data.request) {
        // Filtra apenas itens novos (ainda não enviados para a cozinha)
        const newItems = data.request.filter((item) => !item.sentToKitchen);

        if (newItems.length === 0) {
          isProcessing.current = false;
          return; // Nada novo para enviar
        }

        // Calcula o preco final apenas dos itens novos
        const newItemsPrice = newItems
          .map((item) => item.finalPrice)
          .reduce((ac, el) => ac + el, 0);

        const currentTable = localStorage.getItem('tableNumber');
        let orderAddedOrUpdated = false;

        // Tentar encontrar um pedido aberto para esta mesa e para ESTE usuário específico
        if (currentTable) {
          const requestsRef = collection(db, 'requests');
          const q = query(
            requestsRef,
            where('tableNumber', '==', currentTable),
            where('idUser', '==', data.id),
            where('orderDelivered', '==', false)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Existe um ou mais pedidos abertos. Vamos pegar o primeiro (idealmente só deve haver um)
            const openOrderDoc = querySnapshot.docs[0];
            const openOrderData = openOrderDoc.data();

            // Calcula o próximo índice disponível para indexInRequest baseando-se no maior índice atual
            const currentMaxIndex = openOrderData.request && openOrderData.request.length > 0
              ? Math.max(...openOrderData.request.map((item) => item.indexInRequest || 0))
              : -1;

            // Prepara os novos itens com a flag de envio
            const newItemsPrepared = newItems.map((item, idx) => ({
              ...item,
              sentToKitchen: true,
              sentToKitchenTime: takeDataTime(),
              parentRequestId: openOrderDoc.id,
              indexInRequest: currentMaxIndex + 1 + idx
            }));

            // Junta os pratos que já estavam lá com os novos
            const updatedOrderRequests = [...(openOrderData.request || []), ...newItemsPrepared];
            const updatedPrice = (openOrderData.finalPriceRequest || 0) + newItemsPrice;

            const requestDocRef = doc(db, 'requests', openOrderDoc.id);
            const updateFields = {
              request: updatedOrderRequests,
              finalPriceRequest: Number(updatedPrice.toFixed(2)),
              done: true
            };

            // Se estamos editando, garantimos que o tableNumber não mude para null se o original tinha um
            if (global.orderBeingEdited && !currentTable) {
              updateFields.tableNumber = openOrderData.tableNumber || null;
            }

            await updateDoc(requestDocRef, updateFields);

            // Mapeamos os novos itens para associar o ID do pedido e o novo índice neles.
            // Os itens novos começam a partir do comprimento antigo do array 'request' do pedido aberto.
            const startIndex = openOrderData.request ? openOrderData.request.length : 0;
            let newItemsCount = 0;
            const updatedUserRequests = data.request.map((uItem) => {
              if (!uItem.sentToKitchen) {
                const updatedItem = {
                  ...uItem,
                  sentToKitchen: true,
                  parentRequestId: openOrderDoc.id,
                  indexInRequest: startIndex + newItemsCount
                };
                newItemsCount++;
                return updatedItem;
              }
              return uItem;
            });

            const userDocRef = doc(db, 'user', data.id);
            await updateDoc(userDocRef, { request: updatedUserRequests });
            setUserData({ ...data, request: updatedUserRequests });

            if (global.orderBeingEdited) {
              global.setOrderBeingEdited(null);
              if (pdv || stylePdv) {
                localStorage.removeItem('tableNumber');
              }
            }

            orderAddedOrUpdated = true;
          }
        }

        // Se não encontrou pedido aberto (ou não tem mesa), cria um novo
        if (!orderAddedOrUpdated) {
          const newRequestForKitchen = {
            name: data.name === 'anonimo' || data.name === 'anonymous' ? data.fantasyName : data.name,
            idUser: data.id,
            done: true,
            orderDelivered: false,
            paymentDone: deliveryAddress ? false : undefined,
            deliveryAddress: deliveryAddress || null,
            request: newItems.map((item, idx) => ({
              ...item,
              sentToKitchen: true,
              sentToKitchenTime: takeDataTime(),
              indexInRequest: idx
            })),
            finalPriceRequest: newItemsPrice,
            idPayer: idPayerRef.current,
            dateTime: takeDataTime(),
            countRequest: await countingRequest(),
            tableNumber: currentTable || null,
          };

          // Caso extratégico: se estamos vindo do PDV e o currentTable falhou na busca, mas sabemos o que estamos editando
          if (global.orderBeingEdited && !currentTable) {
            newRequestForKitchen.tableNumber = global.orderBeingEdited.tableNumber || null;
          }

          const cleanedUserNewRequest = cleanObject(newRequestForKitchen);
          const docRef = await addDoc(collection(db, 'requests'), cleanedUserNewRequest);

          // Atualiza o parentRequestId nos itens recém criados
          const itemsWithParentId = cleanedUserNewRequest.request.map(item => ({
            ...item,
            parentRequestId: docRef.id
          }));
          await updateDoc(doc(db, 'requests', docRef.id), { request: itemsWithParentId });

          const updatedUserRequests = data.request.map((uItem, idx) => {
            if (!uItem.sentToKitchen) {
              const itemIndexInBatch = newItems.indexOf(uItem);
              return {
                ...uItem,
                sentToKitchen: true,
                parentRequestId: docRef.id,
                indexInRequest: itemIndexInBatch
              };
            }
            return uItem;
          });

          const userDocRef = doc(db, 'user', data.id);
          await updateDoc(userDocRef, { request: updatedUserRequests });
          setUserData({ ...data, request: updatedUserRequests });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar pedido para a cozinha:', error);
    } finally {
      isProcessing.current = false;
      setIsSubmitting(false);
      if (pdv && global.pdvRequest) {
        global.setPdvMobileView('orders');
      }
    }
  };

  const handleCallWaiter = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    try {
      const currentTable = localStorage.getItem('tableNumber');
      if (userData && currentTable) {
        const q = query(
          collection(db, 'requests'),
          where('tableNumber', '==', currentTable),
          where('idUser', '==', userData.id),
          where('orderDelivered', '==', false)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const openOrderDoc = querySnapshot.docs[0];
          const requestDocRef = doc(db, 'requests', openOrderDoc.id);

          await updateDoc(requestDocRef, {
            waiterCall: {
              active: true,
              callerName:
                userData.name === 'anonimo' || userData.name === 'anonymous'
                  ? userData.fantasyName
                  : userData.name,
              tableNumber: currentTable,
              timestamp: Date.now(),
            },
          });

          setWaiterCallActive(true);

        } else {
          alert('Você precisa enviar um pedido antes de chamar o garçom.');
        }
      }
    } catch (error) {
      console.error('Erro ao chamar o garçom:', error);
    } finally {
      isProcessing.current = false;
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
  const onChoose = async (selectedPayment, cpf, paymentData) => {
    if (!autoPaymentMachineOn) {
      await sendRequestToKitchen();
      return;
    }
    if (!autoPayment) {
      setAutoPayment(true);
      return;
    } else {
      if (selectedPayment === 'CASH') {
        sendRequestToKitchen();
        setAutoPayment(false);
      } else if (selectedPayment === 'desabled') {
        setAutoPayment(false);
        setErrorPaymentMessage(
          'Seu pagamento foi recusado. Você pode tentar novamente ou ir ao caixa e efetuar o pagamento com o/a atendente',
        );
        setTotenRejectPaymentMessage(true);
        setTimeout(() => {
          setTotenRejectPaymentMessage(false);
        }, 100000);
      } else if (selectedPayment === 'ABORTED') {
        console.log('Pagamento abortado pelo usuário.  ', selectedPayment);
        setAutoPayment(false);
        setErrorPaymentMessage('O seu pagamento foi cancelado');
        setTotenRejectPaymentMessage(true);
        setTimeout(() => {
          setTotenRejectPaymentMessage(false);
        }, 7000);
      } else {
        methodPayment = selectedPayment;
        cpfForInvoice = cpf;
        paymentTransactionData = paymentData;
        sendRequestToKitchen();
        setAutoPayment(false);
      }
    }
  };

  const countingRequest = async () => {
    const requestData = await getBtnData('requests');
    const requestNumbers = requestData
      .filter((item) => item.countRequest !== undefined)
      .map((item) => item.countRequest);

    const maxRequestNumber =
      requestNumbers.length > 0 ? Math.max(...requestNumbers) : 0;

    return maxRequestNumber + 1;
  };
  //const userNewRequest = addRequestUser(currentUser);

  const handleRoute = () => {
    if (!stylePdv) {
      const table = localStorage.getItem('tableNumber');
      if (table) {
        navigate(`/${table}`);
      } else {
        navigate('/');
      }
    } else {
      global.setPdvRequest(false);
      navigate('/admin/requestlist');
      return;
    }
  };
  const logout = () => {
    if (global.orderBeingEdited) {
      alert("Você não pode trocar de cliente enquanto edita um pedido. Cancele ou finalize a edição primeiro.");
      return;
    }
    localStorage.removeItem('userMenu');
    global.setAuthorizated(false);
    navigate('/create-customer');
  };

  const cancelEditOrder = async () => {
    try {
      const isConfirmed = window.confirm("Tem certeza que deseja cancelar a edição? As adições ou remoções feitas no pedido não serão salvas.");
      if (!isConfirmed) return;

      if (userData && userData.id) {
        const userDocRef = doc(db, 'user', userData.id);
        await updateDoc(userDocRef, { request: [] });
      }

      global.setOrderBeingEdited(null);
      global.setPdvRequest(false);
      if (pdv || stylePdv) {
        localStorage.removeItem('tableNumber');
      }
      navigate('/admin/requestlist');
    } catch (err) {
      console.error("Erro ao cancelar edição:", err);
    }
  };

  const onClose = () => {
    setTotenRejectPaymentMessage(false);
    sendRequestToKitchen();
  };

  const onConfirm = () => {
    console.log('Confirmando mensagem de rejeição de pagamento do toten');
    setTotenRejectPaymentMessage(false);
    setAutoPayment(true);
  };
  return (
    <section
      className={`container-modal-request ${stylePdv ? 'pdv-change' : ''}`}
    >
      {global.orderBeingEdited && (
        <div style={{ backgroundColor: '#ff9800', padding: '10px', textAlign: 'center', fontWeight: 'bold', color: 'white', borderRadius: '5px', marginBottom: '10px' }}>
          Você está editando o pedido #{global.orderBeingEdited.countRequest}
          <button
            style={{ marginLeft: '15px', backgroundColor: '#d32f2f', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            onClick={cancelEditOrder}
          >
            Cancelar Edição
          </button>
        </div>
      )}
      {openCloseTotenPupup && (
        <TotenRegisterPopup
          setOpenCloseTotenPopup={setOpenCloseTotenPopup}
          setCurrentUser={setCurrentUser}
          sendRequestToKitchen={sendRequestToKitchen}
          onChoose={onChoose}
          isSubmitting={isSubmitting}
        />
      )}
      {showDeliveryRegistrationPrompt && (
        <DefaultComumMessage
          msg="A entrega só pode ser feita para clientes cadastrados. Cadastre-se agora para receber seu pedido em casa!"
          onClose={() => setShowDeliveryRegistrationPrompt(false)}
          onConfirm={handleRegisterForDelivery}
          negativeResponse="Cancelar"
          affirmativeResponse="Cadastrar"
        />
      )}
      {showDeliveryPopup && (
        <DeliveryAddressPopup 
          customerName={userData?.name}
          onClose={() => setShowDeliveryPopup(false)}
          onSubmit={(address) => {
            setDeliveryAddress(address);
            setShowDeliveryPopup(false);
            setShowAddressConfirmedMsg(true);
          }}
        />
      )}
      {showAddressConfirmedMsg && (
        <DefaultComumMessage 
          msg="Endereço confirmado! Clique em Fazer Pedido (Entrega) para enviar à cozinha." 
          onConfirm={() => setShowAddressConfirmedMsg(false)}
          affirmativeResponse="Continuar"
        />
      )}
      {totenMessage && (
        <DefaultComumMessage msg="Acompanhe o seu pedido na Fila de pedidos que está na TV acima" />
      )}
      {totenRejectPaymentMessage && (
        <DefaultComumMessage
          msg={errorPaymentMessage}
          onClose={onClose}
          onConfirm={onConfirm}
          negativeResponse="Fechar e pagar com o atendente"
          affirmativeResponse="Tentar Novamente"
        />
      )}
      <div className="container-modalDihses-InCarrolse">
        {modal && <CheckDishesModal item={item} setModal={setModal} />}
      </div>
      {autoPayment && (
        <div className="container-autoPayment">
          <AutoPayment
            onChoose={onChoose}
            setIdPayer={(value) => (idPayerRef.current = value)}
            price={finalPriceRequest}
            setAutoPayment={setAutoPayment}
          />
        </div>
      )}
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

      {(!stylePdv && global.hasClients && Number(global.packageTier) > 1 && !localStorage.getItem('tableNumber')) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '10%', marginTop: '10px' }}>
          <button
            className="call-waiter-btn"
            style={{ 
              width: '150px',
              opacity: (isSubmitting || !userData || !userData.request || userData.request.length === 0) ? 0.7 : 1,
              cursor: (isSubmitting || !userData || !userData.request || userData.request.length === 0) ? 'not-allowed' : 'pointer'
            }}
            onClick={handleDeliveryClick}
            disabled={isSubmitting || !userData || !userData.request || userData.request.length === 0}
          >
            ENTREGA
          </button>
        </div>
      )}

      <p
        className="current-client"
        onClick={stylePdv ? logout : undefined}
        style={stylePdv ? { cursor: 'pointer' } : {}}
        title={stylePdv ? 'Clique para trocar de cliente' : ''}
      >
        <span>Cliente: </span>
        {userData?.name === 'anonimo' || userData?.name === 'anonymous'
          ? userData?.fantasyName
          : userData?.name}
        {localStorage.getItem('tableNumber') && (
          <span style={{ marginLeft: '15px', color: 'var(--title-font-color)' }}>
            Mesa: {localStorage.getItem('tableNumber')}
          </span>
        )}
      </p>

      {stylePdv && (
        <div className="promotion-selection" style={{ margin: '15px 10%', textAlign: 'center' }}>
          <select 
            className="form-select" 
            value={selectedPromotion} 
            onChange={handleSelectChange}
            style={{ padding: '8px', borderRadius: '5px', width: '100%', maxWidth: '400px', backgroundColor: 'var(--input-bg-color)', color: 'var(--main-font-color)', border: '1px solid var(--btn-color)' }}
          >
            <option value="">Aplicar Promoção...</option>
            {promotions.map((promo, index) => (
              <option key={index} value={index}>{promo.title}</option>
            ))}
          </select>
        </div>
      )}

      {messagePromotionPopup && (
        <MessagePromotions
          message={textPromotion}
          setClose={setMessagePromotionPopup}
          onContinue={applyPromotionToFirestore}
          AddPromotion={AddPromotion}
        />
      )}

      {isTableClient && (
        <div className="call-waiter-container" style={{ textAlign: 'center', marginBottom: '15px' }}>
          <button
            className="call-waiter-btn"
            style={{
              color: 'var(--title-font-color)',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: waiterCallActive ? 'not-allowed' : 'pointer',
              opacity: waiterCallActive ? 0.7 : 1
            }}
            disabled={waiterCallActive || isSubmitting}
            onClick={handleCallWaiter}
          >
            {waiterCallActive ? "Garçom a caminho..." : "Chame o Garçom"}
          </button>
        </div>
      )}

      <h3>Esses são os seus pedidos até o momento</h3>
      {userData &&
        Array.isArray(userData.request) &&
        userData.request.length > 0 ? (
        userData.request.map((item, index) => (
          <div className="individual-dishes my-3" key={index}>
            <h2 onClick={() => callDishesModal(item)} className="my-0">
              {item.name}
            </h2>
            <p className="dishes-price">
              R${' '}
              {item.finalPrice.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {item.status === 'Pronto' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <p className="status-request-pend" style={{ color: 'var(--btn-color)', margin: 0 }}>Pronto</p>
                {item.tempo_levado && (
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{item.tempo_levado}</p>
                )}
              </div>
            ) : item.sentToKitchen ? (
              <p className="status-request-pend" style={{ color: 'var(--title-font-color)' }}>Em preparo</p>
            ) : (
              <>
                <p className="status-request-pend">pendente</p>
                <p className="cancel" onClick={() => deleteRequest(index)}>
                  Cancelar
                </p>
                <button onClick={() => duplicateDish(index)}>+</button>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="no-request">Não há pedidos por enquanto</p>
      )}
      <div className="btnFinalRequest">
        <button className="keep-shopping" onClick={handleRoute}>
          Continue Comprando
        </button>
      </div>
      {isTableClient && (
        <div className="btnFinalRequest" style={{ marginTop: '10px', marginBottom: '10px' }}>
          <button
            disabled={isSubmitting || !userData || (userData.request && userData.request.filter(item => !item.sentToKitchen).length === 0)}
            className="send-request"
            onClick={sendOrderToKitchenOnly}
          >
            {isSubmitting ? "ENVIANDO..." : "Enviar pedido"}
          </button>
        </div>
      )}
      <div className="btnFinalRequest">
        <button
          disabled={isSubmitting || (isTableClient && !allRequestsReady)}
          className="send-request"
          onClick={
            deliveryAddress
              ? sendOrderToKitchenOnly
              : isTableClient
                ? () => setBillPopUpStep(1)
                : openRegisterPopup
          }
        >
          {deliveryAddress ? "Fazer Pedido (Entrega)" : isTableClient ? "Pedir a conta" : "Finalizar"}
        </button>
      </div>

      {/* Bill Popups Refactored */}
      {billPopUpStep === 1 && (
        <BillFeedbackPopup 
          serviceRating={serviceRating}
          setServiceRating={setServiceRating}
          foodRating={foodRating}
          setFoodRating={setFoodRating}
          waiterComment={waiterComment}
          setWaiterComment={setWaiterComment}
          onCancel={() => setBillPopUpStep(0)}
          onConfirm={() => setBillPopUpStep(2)}
        />
      )}

      {billPopUpStep === 2 && (
        <BillSummaryPopup 
          requests={userData.request}
          subtotal={finalPriceRequest}
          includeServiceCharge={includeServiceCharge}
          setIncludeServiceCharge={handleServiceChargeChange}
          isProcessingPayment={isProcessingPayment}
          onBack={() => setBillPopUpStep(1)}
          onPay={handlePaymentFinalization}
        />
      )}
    </section>
  );
};
export default RequestModal;
//testando git
