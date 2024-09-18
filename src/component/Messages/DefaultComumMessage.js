import React from "react";
import "../../assets/styles/resultMessage.css";

const DefaultComumMessage = ({ msg, onClose, onConfirm }) => {
  return (
    <div className="default-comum-message-container">
      <h1>Mensagem importante</h1>
      <h3>{msg}</h3>

      <div className="container-button">
        <button onClick={onClose}>Cancelar</button>
        <button onClick={onConfirm}>Continuar</button>
      </div>
    </div>
  );
};
export default DefaultComumMessage;
