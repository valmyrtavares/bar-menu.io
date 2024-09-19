import React from "react";
import "../assets/styles/WarningMessages.css";

const WarningMessage = ({
  message,
  customer,
  finalPriceRequest,
  setWarningMsg,
  sendRequestToKitchen,
}) => {
  React.useEffect(() => {
    console.log(finalPriceRequest);
  }, []);
  return (
    <div className="container-warning-message">
      <h1>{customer}</h1>
      <h1>Parabéns!</h1>
      <h1>{message}</h1>
      {finalPriceRequest && <h3>Valor Final R$ {finalPriceRequest},00</h3>}
      <div className="container-btn">
        <button onClick={() => setWarningMsg(false)}>Cancelar</button>
        <button onClick={sendRequestToKitchen}>Continuar</button>
      </div>
    </div>
  );
};
export default WarningMessage;
