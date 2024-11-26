import React, { useEffect } from 'react';
import '../../assets/styles/resultMessage.css';

const DefaultComumMessage = ({ msg, onClose, onConfirm, item }) => {
  useEffect(() => {
    if (item) {
      console.log('ITEM   ', item);
    }
  }, [item]);
  return (
    <>
      <div className="overlay"></div> {/* Overlay para o fundo escuro */}
      <div className="default-comum-message-container">
        <h1>Mensagem importante</h1>
        <h3>{msg}</h3>
        <div className="container-button">
          {onClose && <button onClick={onClose}>Cancelar</button>}
          {onConfirm && (
            <button
              onClick={() => {
                item ? onConfirm(item, true) : onConfirm();
              }}
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </>
  );
};
export default DefaultComumMessage;
