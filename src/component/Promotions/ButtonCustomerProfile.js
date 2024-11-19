import React from 'react';
import '../../assets/styles/ButtonCustomerProfile.css';
import { getOneItemColleciton, getBtnData } from '../../api/Api';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../config-firebase/firebase.js';

const ButtonCustomerProfile = ({ item, request, descontFinalPrice }) => {
  const [noRegistration, setNoRegistration] = React.useState(null);
  const [promotionClient, setPromotionClient] = React.useState({});
  const [showPopup, setShowPopup] = React.useState(false);
  const [disabledCustomer, setDisabledCustomer] = React.useState(true);

  const [form, setForm] = React.useState({
    name: '',
    dateTime: '',
    idUserVoucher: '',
    phone: '',
    cpf: '',
    requestDone: [],
  });

  // FIRESTORE
  const db = getFirestore(app);

  //Fetch user in firebase and check out if is it anonymous to fill the button's color and load the PromotionCient useState
  React.useEffect(() => {
    const fetchOneCustomer = async () => {
      const data = await getOneItemColleciton('user', item.idUser);

      if (data && data.name !== 'anonimo') {
        setDisabledCustomer(false);
        setNoRegistration('registrated');
        const isInVoucher = await fetchVoucherClients(item.idUser);

        setPromotionClient(data);

        if (isInVoucher) {
          setDisabledCustomer(true);
        } else {
          setDisabledCustomer(false);
        }
      }
    };
    console.log('item   ', item);
    if ((item, request)) {
      fetchOneCustomer();
    }
  }, []);

  const fetchVoucherClients = async (idUser) => {
    const data = await getBtnData('voucherPromotion');
    const customerSelected = data.filter(
      (client) => client.idUserVoucher === idUser
    );

    console.log(
      'Retorna todos os clientes que já usaram o voucher   ',
      customerSelected
    );
    if (customerSelected.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    const sendVoucherPromotion = async () => {
      try {
        // Tenta adicionar o documento no Firestore
        const response = await addDoc(collection(db, 'voucherPromotion'), form);

        console.log('Documento adicionado com sucesso!', response);
        setDisabledCustomer(true);
        descontFinalPrice(3, item.id);
      } catch (error) {
        // Captura e exibe o erro, se houver
        console.error('Erro ao adicionar o documento:', error);
      }
    };

    // Só chama a função se o form estiver preenchido
    if (form.name && form.requestDone && form.requestDone.length > 0) {
      sendVoucherPromotion();
    }
  }, [form]);

  const ReadyToDescont = () => {
    setShowPopup(true);
  };

  const forwardedVoucher = () => {
    const requests = [];
    if (request && request.length > 0) {
      for (let i = 0; i < request.length; i++) {
        requests.push(request[i].name);
      }
    }
    setForm({
      name: item.name,
      dateTime: item.dateTime,
      discount: 3,
      idUserVoucher: item.idUser,
      cpf: promotionClient.cpf,
      phone: promotionClient.phone,
      requestDone: requests,
    });
    setShowPopup(false);
  };

  return (
    <div className="button=customer=profile-container">
      {showPopup && (
        <DefaultComumMessage
          onClose={() => setShowPopup(false)}
          msg="Você está prestes a resgatar o Voucher desse cliente"
          onConfirm={forwardedVoucher}
        />
      )}
      <button
        disabled={disabledCustomer}
        className={`${noRegistration ? 'registrated' : ''} button-profile`}
        onClick={ReadyToDescont}
      >
        {noRegistration ? promotionClient.name : 'Cliente'}
      </button>
    </div>
  );
};
export default ButtonCustomerProfile;
