import React from 'react';
import '../assets/styles/mainMenu.css';

const requestModal = ({ setShowModal }) => {
  return (
    <section
      className="container-modal-request"
      onClick={() => setShowModal(false)}
    >
      <div>
        <p>Valor Total do Consumo R$ 120,00</p>
        <p>Valor do Serviço R$ 12,00</p>
        <p>Valor Final R$ 132,00</p>
      </div>
    </section>
  );
};
export default requestModal;
