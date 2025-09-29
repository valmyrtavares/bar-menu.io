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
  const global = React.useContext(GlobalContext);

  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => {
    console.log('🚀 Navegação acionada!');
    if (!global.pdvRequest) {
      navigate('/request');
    }
  }, [navigate]);

  return (
    <div
      className={`${style.containerBtn} ${global.isToten ? style.toten : ''}`}
    >
      <section className={global.isToten ? style.headerToten : ''}>
        {!global.isToten && (
          <div>
            <p onClick={logoutCustomer}>
              Bem vindo {nameClient && <span>{nameClient}</span>}
            </p>
          </div>
        )}
        {/* <button onClick={() => setTimeout(() => navigate('/request'), 1000)}>
          Seus Pedidos
        </button> */}

        <PedidoButton navigate={handleNavigate} />

        {!global.isToten && (
          <button>
            <Link to="/orderqueue">Fila de pedidos</Link>
          </button>
        )}
        {global.isToten && <Link to="/admin/admin"></Link>}
      </section>
    </div>
  );
};
export default SubHeaderCustomer;
