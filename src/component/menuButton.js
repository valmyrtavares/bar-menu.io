import React from 'react';
import '../assets/styles/menuButton.css';
import { Link } from 'react-router-dom';
const MenuButton = () => {
  const [modal, setModal] = React.useState(false);

  const toggleMenu = () => {
    setModal(!modal);
  };

  return (
    <>
      <button data-menu="button" onClick={toggleMenu}></button>;
      {modal && (
        <div className="modal_menu">
          <button data-menu="close" onClick={toggleMenu}>
            X
          </button>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>Pedidos</li>
            <li>Conta</li>
            <li>Promoções</li>
            <li>Pedidos</li>
            <li>
              <Link to="/admin/item">Sobre</Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};
export default MenuButton;
