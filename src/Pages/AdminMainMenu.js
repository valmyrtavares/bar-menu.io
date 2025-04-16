import React from 'react';
import admin from '../assets/styles/AdminMainMenu.module.scss';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Sair do Administrador
            </NavLink>

            <NavLink
              to="/admin/item"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Adcione um prato
            </NavLink>

            <NavLink
              to="/admin/editButton/dishes"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Edite seus pratos
            </NavLink>

            <NavLink
              to="/admin/category"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Adicione Categoria{' '}
            </NavLink>

            <NavLink
              to="/admin/editButton/cat"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Edite suas categorias
            </NavLink>

            <NavLink
              to="/admin/sidedishes"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Adicione um novo acompanhamento
            </NavLink>

            <NavLink
              to="/admin/editButton/sidedishes"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Edite seus acompanhamentos
            </NavLink>

            <NavLink
              to="/admin/stock"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Estoque
            </NavLink>

            <NavLink
              to="/admin/customer"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Lista de Clientes
            </NavLink>
            <NavLink
              to="/admin/operationCost"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Cadastro de Custo de Operações
            </NavLink>

            <NavLink
              to="/admin/managementRecipes"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Receitas
            </NavLink>

            <NavLink
              to="/admin/request"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Vendas
            </NavLink>

            <NavLink
              to="/admin/sell-flow"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Fechamento de Caixa
            </NavLink>

            <NavLink
              to="/admin/frontimage"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Adicione sua marca
            </NavLink>

            <NavLink
              to="/admin/expenses"
              c
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Despesas
            </NavLink>

            <NavLink
              to="/admin/styles"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Gerenciando Estilos
            </NavLink>

            <NavLink
              to="/admin/welcome"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Saudação inicial
            </NavLink>
            <NavLink
              to="/admin/promotions"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Promoções
            </NavLink>

            <NavLink
              to="/admin/requestlist"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Cozinha
            </NavLink>

            <NavLink
              to="/admin/requestlistcheck"
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Lista de Pedidos
            </NavLink>

            <button
              onClick={logoutAdmin}
              className={({ isActive }) =>
                isActive ? `${admin.link} ${admin.active}` : admin.link
              }
            >
              Log out
            </button>
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
