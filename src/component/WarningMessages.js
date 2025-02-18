import React from 'react';
import styles from '../assets/styles/WarningMessages.module.scss';
import { GlobalContext } from '../GlobalContext';
import { useNavigate } from 'react-router-dom';
import NameForm from '../Forms/Login/NameForm';

const WarningMessage = ({
  message,
  style,
  customer,
  finalPriceRequest,
  setWarningMsg,
  sendRequestToKitchen,
  requests,
  isSubmitting,
}) => {
  const [dealingAnonymousCusomter, setDeaingAnonymousCustomer] =
    React.useState(false);
  const [popupName, setPopupName] = React.useState(false);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (customer === 'anonimo') {
      setDeaingAnonymousCustomer(true);
    }
    console.log('requests', requests);
  }, []);

  const hadleAnonymousCustomer = () => {
    localStorage.setItem('backorder', JSON.stringify(requests));
    localStorage.setItem('noFantasyName', JSON.stringify({ id: true }));
    setDeaingAnonymousCustomer(false);
    global.setAuthorizated(false);
    // localStorage.removeItem('userMenu');
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
            {/* <button onClick={() => setDeaingAnonymousCustomer(false)}>
              Cancelar
            </button> */}
            <button onClick={hadleAnonymousCustomer}>Cancelar</button>
            <button onClick={newCustomerRegistration}>Cadastrar</button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Parabéns!</h1>
          <h1 style={style}>{message}</h1>
          {finalPriceRequest && <h3>Valor Final R$ {finalPriceRequest},00</h3>}
          <div className={styles.containerBtn}>
            <button onClick={() => setWarningMsg(false)}>Cancelar</button>
            <button disabled={isSubmitting} onClick={sendRequestToKitchen}>
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default WarningMessage;
