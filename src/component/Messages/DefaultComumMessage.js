import React, { useEffect } from 'react';
import '../../assets/styles/resultMessage.css';

const DefaultComumMessage = ({
  msg,
  onClose,
  onConfirm,
  item,
  negativeResponse,
  affirmativeResponse,
}) => {
  return (
    <>
      <div className="overlay" style={{ zIndex: 10000 }}></div> {/* Overlay com z-index alto */}
      <div className="default-comum-message-container" style={{ zIndex: 10001 }}>
        <h1>Mensagem importante</h1>
        <h3>{msg}</h3>
        <div className="container-button">
          {onClose && (
            <button onClick={onClose} type="button">
              {negativeResponse ? negativeResponse : 'Cancelar'}
            </button>
          )}

          {onConfirm && (
            <button
              onClick={() => {
                item ? onConfirm(item, true) : onConfirm();
              }}
            >
              {affirmativeResponse ? affirmativeResponse : 'Continuar'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
export default DefaultComumMessage;
