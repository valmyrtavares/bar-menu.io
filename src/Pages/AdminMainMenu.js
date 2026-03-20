import React from 'react';
import admin from '../assets/styles/AdminMainMenu.module.scss';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import WarningMessage from '../component/WarningMessages';
import { GlobalContext } from '../GlobalContext';

const AdminMainMenu = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);
  const [hideSideMenu, setHideSideMenu] = React.useState(true);
  const [warningMessage, setWarningMessage] = React.useState(false);
  const { hasClients, hasRawMaterial, hasFinancial } = React.useContext(GlobalContext);

  React.useEffect(() => {
    if (!localStorage.hasOwnProperty('token')) {
      navigate('/admin/login');
    } else {
      const token = JSON.parse(localStorage.getItem('token'));
    }
    setWarningMessage(checkingWarningMessage());
  }, []);

  React.useEffect(() => {
    setWarningMessage(checkingWarningMessage());
  }, [location.pathname]);

  const checkingWarningMessage = () => {
    const raw = localStorage.getItem('warningAmountMessage');
    let warnings = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) warnings = parsed;
        else if (typeof parsed === 'string') warnings = [parsed];
      } catch (e) {
        // fallback caso não seja JSON: separar por vírgula
        warnings = raw.split(',').map((s) => s.trim());
      }
    }

    const hasFilledItem = warnings.some(
      (item) => typeof item === 'string' && item.trim() !== ''
    );

    return hasFilledItem;
  };

  React.useEffect(() => {
    if (location.pathname !== '/admin/admin') {
      setHideSideMenu(false);
    } else {
      setHideSideMenu(true);
    }
  }, [location.pathname, navigate]);

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
      <div
        className={`${admin.containerAdminMainMenu} ${!hideSideMenu ? admin.changeProportion : ''
          }`}
      >
        <nav
          className={`${admin.sidebar} ${!hideSideMenu ? admin.hideSideMenu : ''
            }`}
        >
          <div className={admin.sideMenu}>
            <NavLink to="/">Sair do Administrador</NavLink>

            <NavLink to="/admin/item">Adcione um prato</NavLink>

            <NavLink to="/admin/editButton/dishes">Edite seus pratos</NavLink>

            <NavLink to="/admin/category">Adicione Categoria </NavLink>

            <NavLink to="/admin/editButton/cat">Edite suas categorias</NavLink>

            <NavLink to="/admin/sidedishes">
              Adicione um novo acompanhamento
            </NavLink>

            <NavLink to="/admin/editButton/sidedishes">
              Edite seus acompanhamentos
            </NavLink>

            <NavLink
              to="/admin/stock"
              className={!hasRawMaterial ? admin.disabledLink : ''}
              style={{ color: warningMessage ? 'red' : undefined }}
              onClick={(e) => !hasRawMaterial && e.preventDefault()}
            >
              Estoque
            </NavLink>

            <NavLink
              to="/admin/customer"
              className={!hasClients ? admin.disabledLink : ''}
              onClick={(e) => !hasClients && e.preventDefault()}
            >
              Lista de Clientes
            </NavLink>
            <NavLink
              to="/admin/operationCost"
              className={!hasFinancial ? admin.disabledLink : ''}
              onClick={(e) => !hasFinancial && e.preventDefault()}
            >
              Cadastro de Custo de Operações
            </NavLink>

            <NavLink
              to="/admin/managementRecipes"
              className={!hasRawMaterial ? admin.disabledLink : ''}
              style={{ color: warningMessage ? 'red' : undefined }}
              onClick={(e) => !hasRawMaterial && e.preventDefault()}
            >
              Receitas
            </NavLink>

            <NavLink
              to="/admin/request"
              className={!hasFinancial ? admin.disabledLink : ''}
              onClick={(e) => !hasFinancial && e.preventDefault()}
            >
              Vendas
            </NavLink>

            <NavLink
              to="/admin/sell-flow"
              className={!hasFinancial ? admin.disabledLink : ''}
              onClick={(e) => !hasFinancial && e.preventDefault()}
            >
              Fechamento de Caixa
            </NavLink>

            <NavLink to="/admin/frontimage">Adicione sua marca</NavLink>

            <NavLink
              to="/admin/expenses"
              className={!hasRawMaterial ? admin.disabledLink : ''}
              onClick={(e) => !hasRawMaterial && e.preventDefault()}
            >
              Despesas
            </NavLink>

            <NavLink to="/admin/styles">Gerenciando Estilos</NavLink>

            <NavLink
              to="/admin/welcome"
              className={!hasFinancial ? admin.disabledLink : ''}
              onClick={(e) => !hasFinancial && e.preventDefault()}
            >
              Saudação inicial
            </NavLink>
            <NavLink
              to="/admin/promotions"
              className={!hasClients ? admin.disabledLink : ''}
              onClick={(e) => !hasClients && e.preventDefault()}
            >
              Promoções
            </NavLink>
            
            <NavLink to="/admin/documentation">Documentação</NavLink>

            <NavLink to="/admin/requestlist">PDV</NavLink>
            <NavLink to="/admin/kitchen">Cozinha</NavLink>

            <NavLink to="/admin/requestlistcheck">Lista de Pedidos</NavLink>

            <button onClick={logoutAdmin}>Log out</button>
          </div>
        </nav>
        <section>
          <div className={admin.containerIcon}>
            <a
              href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.7uh3xmsl0731#heading=h.txjco12lav7r"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir documentação"
            >
              <span>?</span>
            </a>
          </div>
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
