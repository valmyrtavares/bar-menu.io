import React from 'react';
import '../assets/styles/menuButton.css';
import { Link, useNavigate } from 'react-router-dom';

const MenuButton = () => {
  const [modal, setModal] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setModal(!modal);
  };

  React.useEffect(() => {
    setModal(false);
  }, [navigate]);

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
