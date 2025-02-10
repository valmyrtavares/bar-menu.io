import React from 'react';
import styles from '../../assets/styles/WarningMessages.module.scss';
import { GlobalContext } from '../../GlobalContext';
import { useNavigate } from 'react-router-dom';
import NameForm from '../../Forms/Login/NameForm';

const PromotionsRegisterMessages = ({
  message,
  style,
  customer,
  finalPriceRequest,
  setWarningMsg,
  sendRequestToKitchen,
  requests,
}) => {
  const [dealingAnonymousCusomter, setDeaingAnonymousCustomer] =
    React.useState(false);
  const [popupName, setPopupName] = React.useState(false);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    debugger;
    if (customer?.fantasyName) {
      // It does not need to be registered
      setDeaingAnonymousCustomer(false);
    } else {
      setDeaingAnonymousCustomer(true); // It needs to be registered
    }
  }, []);

  const hadleAnonymousCustomer = () => {
    debugger;
    if (localStorage.hasOwnProperty('noFantasyName')) {
      setDeaingAnonymousCustomer(false);
      if (localStorage.hasOwnProperty('token')) {
        localStorage.removeItem('noFantasyName');
      }
    } else {
      localStorage.setItem('backorder', JSON.stringify(requests));
      localStorage.setItem('noFantasyName', JSON.stringify({ id: true }));
      global.setAuthorizated(false);
      localStorage.removeItem('userMenu');
      navigate('/create-customer');
    }
  };

  const AnonymousCustomerInFinalScreen = () => {
    if (localStorage.hasOwnProperty('noFantasyName')) {
      localStorage.setItem('noFantasyName', JSON.stringify({ id: true }));
      navigate('/create-customer');
      setWarningMsg(false);
    }
  };

  const newCustomerRegistration = () => {
    localStorage.setItem('backorder', JSON.stringify(requests));
    localStorage.removeItem('userMenu');
    global.setAuthorizated(false);
    navigate('/create-customer');
  };
  return (
    <div className={styles.containerWarningMessage}>
      {dealingAnonymousCusomter ? (
        <div>
          {' '}
          <h1>Quer ganhar um desconto na sua compra? Cadastre-se! </h1>
          <div className={styles.containerBtn}>
            <button onClick={newCustomerRegistration}>Cadastrar</button>
            <button onClick={newCustomerRegistration}>Sou Cadastrado</button>
            <button onClick={hadleAnonymousCustomer}>
              Como podemos te chamar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Parabéns!</h1>
          <h1 style={style}>{message}</h1>
          {finalPriceRequest && <h3>Valor Final R$ {finalPriceRequest},00</h3>}
          <div className={styles.containerBtn}>
            <button onClick={AnonymousCustomerInFinalScreen}>Cancelar</button>
            <button onClick={sendRequestToKitchen}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PromotionsRegisterMessages;
