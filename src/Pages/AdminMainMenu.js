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
            <button>
              <Link to="/admin/item" className=" btn btn-success sidedishe">
                Adcione um prato
              </Link>
            </button>
            <button>
              <Link to="/admin/editButton/dishes" className=" btn btn-success">
                Lista de pratos
              </Link>
            </button>
            <button>
              <Link to="/admin/category" className="btn btn-success  ">
                Adicione Botão{' '}
              </Link>
            </button>
            <button>
              <Link to="/admin/editButton/cat" className=" btn btn-success">
                Lista de Botões
              </Link>
            </button>

            <button>
              <Link
                to="/admin/sidedishes"
                className=" btn btn-success sidedishe"
              >
                Adicione Acompanhamentos
              </Link>
            </button>
            <button>
              <Link
                to="/admin/editButton/sidedishes"
                className="btn btn-success sidedishe"
              >
                Lista de acompanhamentos
              </Link>
            </button>
            <button>
              <Link to="/admin/stock" className=" btn btn-success sidedishe">
                Estoque
              </Link>
            </button>
            <button>
              <Link to="/admin/customer" className="btn btn-success sidedishe">
                Lista de Clientes
              </Link>
            </button>
            <button>
              <Link to="/admin/request" className=" btn btn-success sidedishe">
                Lista de Pedidos
              </Link>
            </button>
            <button>
              <Link
                to="/admin/sell-flow"
                className=" btn btn-success sidedishe"
              >
                Fechamento de Caixa
              </Link>
            </button>
            <button>
              <Link to="/admin/frontimage" className="btn btn-success ">
                Adicione sua marca
              </Link>
            </button>
            <button>
              <Link to="/admin/expenses" className="btn btn-success ">
                Despesas
              </Link>
            </button>
            <button>
              <Link to="/admin/stock" className="btn btn-success ">
                Estoque
              </Link>
            </button>
            <button>
              <Link to="/admin/styles" className="btn btn-success">
                Gerenciando Estilo
              </Link>
            </button>
            <button>
              <Link to="/admin/welcome" className="btn btn-success">
                Saudação inicial
              </Link>
            </button>
            <button>
              <Link
                to="/admin/requestlist"
                className="col-sm-4 btn btn-success nostyle m-2"
              >
                Pedidos da Cozinha
              </Link>
            </button>
            <button onClick={logoutAdmin}>Log out</button>
          </div>
        </nav>
        <section>
          <h1>Grande Menu do administrador</h1>;
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
