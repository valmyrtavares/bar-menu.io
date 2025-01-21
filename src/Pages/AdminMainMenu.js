import React from 'react';
import admin from '../assets/styles/AdminMainMenu.module.css';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import WarningMessage from '../component/WarningMessages';

const AdminMainMenu = ({ children }) => {
  const navigate = useNavigate();
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);

  React.useEffect(() => {
    if (!localStorage.hasOwnProperty('token')) {
      navigate('/admin/login');
    } else {
      const token = JSON.parse(localStorage.getItem('token'));
    }
  }, []);

  const logoutAdmin = () => {
    if (logoutAdminPopup) {
      localStorage.removeItem('token');
      navigate('/');
    }
    setLogoutAdminPopup(true);
  };
  return (
    <div>
      <div className={admin.WarningMessageContainer}>
        {logoutAdminPopup && (
          <WarningMessage
            message="Você está prestes a sair do sistema"
            setWarningMsg={setLogoutAdminPopup}
            sendRequestToKitchen={logoutAdmin}
          />
        )}
      </div>
      <div className={admin.containerAdminMainMenu}>
        <nav>
          <div className={admin.sideMenu}>
            <Link to="/" className="  sidedishe">
              Sair do Administrador
            </Link>

            <Link to="/admin/item" className="  sidedishe">
              Adcione um prato
            </Link>

            <Link to="/admin/editButton/dishes" className=" ">
              Edite seus pratos
            </Link>

            <Link to="/admin/category" className="  ">
              Adicione Botão{' '}
            </Link>

            <Link to="/admin/editButton/cat" className=" ">
              Edite suas categorias
            </Link>

            <Link to="/admin/sidedishes" className="  sidedishe">
              Adicione um novo acompanhamento
            </Link>

            <Link to="/admin/editButton/sidedishes" className=" sidedishe">
              Edite seus acompanhamentos
            </Link>

            <Link to="/admin/stock" className="  sidedishe">
              Estoque
            </Link>

            <Link to="/admin/customer" className=" sidedishe">
              Lista de Clientes
            </Link>

            <Link to="/admin/managementRecipes" className=" sidedishe">
              Receitas
            </Link>

            <Link to="/admin/request" className="  sidedishe">
              Vendas
            </Link>

            <Link to="/admin/sell-flow" className="  sidedishe">
              Fechamento de Caixa
            </Link>

            <Link to="/admin/frontimage" className=" ">
              Adicione sua marca
            </Link>

            <Link to="/admin/expenses" className=" ">
              Despesas
            </Link>

            <Link to="/admin/styles" className="">
              Gerenciando Estilos
            </Link>

            <Link to="/admin/welcome" className="">
              Saudação inicial
            </Link>

            <Link to="/admin/requestlist">Cozinha</Link>

            <Link to="/admin/requestlistcheck">Lista de Pedidos</Link>

            <button onClick={logoutAdmin}>Log out</button>
          </div>
        </nav>
        <section>
          <h1> Menu do administrador</h1>;
          <div className={admin.mainContent}>
            {' '}
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminMainMenu;
