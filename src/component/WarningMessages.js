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
      <h3>{customer}</h3>
      <p>{message}</p>
      {finalPriceRequest && <h3>Valor Final R$ {finalPriceRequest},00</h3>}
      <div className="container-btn">
        <button onClick={sendRequestToKitchen}>Continuar</button>
        <button onClick={() => setWarningMsg(false)}>Cancelar</button>
      </div>
    </div>
  );
};
export default WarningMessage;
