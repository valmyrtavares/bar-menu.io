import React from 'react';
import { Link } from 'react-router-dom';
import style from '../assets/styles/mainMenu.module.scss';

const SubHeaderCustomer = ({ logoutCustomer, nameClient, isToten }) => {
  return (
    <div className={`${style.containerBtn} ${isToten ? style.toten : ''}`}>
      <section className={isToten ? style.headerToten : ''}>
        <div>
          <p onClick={logoutCustomer}>
            Bem vindo {nameClient && <span>{nameClient}</span>}
          </p>
        </div>
        <button>
          <Link to="/request">Seus Pedidos</Link>
        </button>
        {!isToten && (
          <button>
            <Link to="/orderqueue">Fila de pedidos</Link>
          </button>
        )}
      </section>
    </div>
  );
};
export default SubHeaderCustomer;
