import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from '../assets/styles/mainMenu.module.scss';
import { GlobalContext } from '../GlobalContext.js';

const PedidoButton = React.memo(({ navigate }) => {
  console.log('🎯 PedidoButton renderizado!');

  return (
    <button
      onClick={() => {
        navigate(); // Chamamos a navegação aqui para ver se dispara corretamente
      }}
    >
      Seus Pedidos
    </button>
  );
});

const SubHeaderCustomer = ({ logoutCustomer, nameClient }) => {
  const globalData = React.useContext(GlobalContext);
  const { isToten, pdvRequest, hasClients } = globalData;

  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => {
    console.log('🚀 Navegação acionada!');
    if (!pdvRequest) {
      navigate('/request');
    }
  }, [navigate]);

  return (
    <div
      className={`${style.containerBtn} ${isToten ? style.toten : ''}`}
    >
      <section className={isToten ? style.headerToten : ''}>
        {!isToten && (
          <div>
            <p onClick={!hasClients ? null : logoutCustomer}>
              Bem vindo {nameClient && <span>{nameClient}</span>}
            </p>
          </div>
        )}
        {/* <button onClick={() => setTimeout(() => navigate('/request'), 1000)}>
          Seus Pedidos
        </button> */}

        <PedidoButton navigate={handleNavigate} />

        {!isToten && (
          <button>
            <Link to="/orderqueue">Fila de pedidos</Link>
          </button>
        )}

        {isToten && <Link to="/admin/admin" style={{ opacity: 0, display: 'block', width: '50px', height: '50px' }}></Link>}
      </section>
    </div>
  );
};
export default SubHeaderCustomer;
