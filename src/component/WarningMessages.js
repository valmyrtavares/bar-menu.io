import React from 'react';
import '../assets/styles/WarningMessages.css';
import { GlobalContext } from '../GlobalContext';
import { useNavigate } from 'react-router-dom';

const WarningMessage = ({
  message,
  customer,
  finalPriceRequest,
  setWarningMsg,
  sendRequestToKitchen,
  requests,
}) => {
  const [dealingAnonymousCusomter, setDeaingAnonymousCustomer] =
    React.useState(false);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (customer === 'anonimo') {
      setDeaingAnonymousCustomer(true);
    }
    console.log('requests', requests);
  }, []);
  const newCustomerRegistration = () => {
    localStorage.setItem('backorder', JSON.stringify(requests));
    localStorage.removeItem('userMenu');
    global.setAuthorizated(false);
    navigate('/create-customer');
  };
  return (
    <div className="container-warning-message">
      {dealingAnonymousCusomter ? (
        <div>
          {' '}
          <h1>Quer ganhar um desconto na sua compra? Cadastre-se! </h1>
          <div className="container-btn">
            <button onClick={() => setDeaingAnonymousCustomer(false)}>
              Cancelar
            </button>
            <button onClick={newCustomerRegistration}>Cadastrar</button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Parabéns!</h1>
          <h1>{message}</h1>
          {finalPriceRequest && <h3>Valor Final R$ {finalPriceRequest},00</h3>}
          <div className="container-btn">
            <button onClick={() => setWarningMsg(false)}>Cancelar</button>
            <button onClick={sendRequestToKitchen}>Continuar</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default WarningMessage;
