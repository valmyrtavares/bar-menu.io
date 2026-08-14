import React from 'react';
import admin from '../assets/styles/AdminMainMenu.module.scss';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import WarningMessage from '../component/WarningMessages';
import { GlobalContext } from '../GlobalContext';
import { initializeDatabase } from '../services/dbInitService';
import { logAction } from '../api/AuditLogger';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config-firebase/firebase';

const AdminMainMenu = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);
  const [hideSideMenu, setHideSideMenu] = React.useState(true);
  const [warningMessage, setWarningMessage] = React.useState(false);
  const [hasOverdueSupplies, setHasOverdueSupplies] = React.useState(false);
  const {
    hasClients,
    hasRawMaterial,
    hasFinancial,
    currentUser,
    logoutUser
  } = React.useContext(GlobalContext);

  const hasAccess = (moduleName) => {
    const role = localStorage.getItem('currentUserRole');
    if (role === 'admin_TOTAL') return true;

    try {
      const permsRaw = localStorage.getItem('currentUserPermissions');
      if (permsRaw) {
        const perms = JSON.parse(permsRaw);
        if (Array.isArray(perms) && perms.includes(moduleName)) return true;
      }
    } catch (e) {
      console.error(e);
    }

    if (currentUser) {
      if (currentUser.role === 'admin_TOTAL') return true;
      return currentUser.permissions?.includes(moduleName);
    }
    return false;
  };

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
    if (!hasRawMaterial) return;

    const parseToDate = (dateVal) => {
      if (!dateVal) return null;
      if (dateVal instanceof Date) return dateVal;
      if (typeof dateVal.toDate === 'function') return dateVal.toDate();
      if (typeof dateVal.seconds === 'number') return new Date(dateVal.seconds * 1000);
      if (typeof dateVal === 'number') {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? null : d;
      }
      if (typeof dateVal === 'string') {
        const str = dateVal.trim();
        if (!str) return null;
        if (str.includes('/')) {
          const parts = str.split(' - ')[0].split(' ')[0].split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
          }
        }
        if (str.includes('-')) {
          const parts = str.split('T')[0].split(' ')[0].split('-');
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            } else {
              return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
            }
          }
        }
      }
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d;
    };

    const unsub = onSnapshot(collection(db, 'stock'), (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let overdue = false;

      snapshot.forEach((doc) => {
        const item = doc.data();
        if (item.operationSupplies === true && (item.activityStatus === undefined || item.activityStatus === false)) {
          const purchaseDate = parseToDate(item.lastUpdate || item.date || item.createdAt);
          if (purchaseDate && item.regularityDays) {
            const limitDate = new Date(purchaseDate);
            limitDate.setDate(limitDate.getDate() + Number(item.regularityDays));
            limitDate.setHours(0, 0, 0, 0);
            if (limitDate < today) {
              overdue = true;
            }
          }
        }
      });
      setHasOverdueSupplies(overdue);
    });

    return () => unsub();
  }, [hasRawMaterial]);

  React.useEffect(() => {
    if (location.pathname !== '/admin/admin') {
      setHideSideMenu(false);
    } else {
      setHideSideMenu(true);
    }
  }, [location.pathname, navigate]);

  const logoutAdmin = () => {
    if (logoutAdminPopup) {
      logoutUser();
      navigate('/');
    }
    setLogoutAdminPopup(true);
  };

  const handleInitialSetup = async () => {
    if (window.confirm('Deseja executar a inicialização padrão do banco de dados? Isso criará as coleções obrigatórias se elas não existirem.')) {
      const response = await initializeDatabase();
      if (response.success) {
        await logAction('Setup Inicial', 'Inicialização padrão do banco de dados executada com sucesso.');
        alert('Sucesso:\n' + response.log.join('\n'));
      } else {
        await logAction('Falha no Setup Inicial', `Tentativa de inicializar banco falhou: ${response.error}`);
        alert('Erro ao inicializar: ' + response.error);
      }
    }
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
            {currentUser && (
              <div style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                👤 <strong>{currentUser.name}</strong>
                <br />
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: currentUser.role === 'admin_TOTAL' ? '#856404' : '#555', fontWeight: 'bold' }}>
                  {currentUser.role === 'admin_TOTAL' ? '👑 Super Admin' : '🔒 Acesso Limitado'}
                </span>
              </div>
            )}
            <NavLink to="/">Sair do Administrador</NavLink>
 
            <NavLink
              to="/admin/category"
              className={!hasAccess('category') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('category') && e.preventDefault()}
            >
              Adicione Categoria
            </NavLink>
 
            <NavLink
              to="/admin/editButton/cat"
              className={!hasAccess('editButtonCat') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('editButtonCat') && e.preventDefault()}
            >
              Edite suas categorias
            </NavLink>
 
            <NavLink
              to="/admin/item"
              className={!hasAccess('item') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('item') && e.preventDefault()}
            >
              Adcione um prato
            </NavLink>
 
            <NavLink
              to="/admin/editButton/dishes"
              className={!hasAccess('editButtonDishes') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('editButtonDishes') && e.preventDefault()}
            >
              Edite seus pratos
            </NavLink>
 
            <NavLink
              to="/admin/sidedishes"
              className={!hasAccess('sidedishes') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('sidedishes') && e.preventDefault()}
            >
              Adicione um novo acompanhamento
            </NavLink>
 
            <NavLink
              to="/admin/editButton/sidedishes"
              className={!hasAccess('editButtonSidedishes') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('editButtonSidedishes') && e.preventDefault()}
            >
              Edite seus acompanhamentos
            </NavLink>
 
            {/* --- GRUPO: CLIENTES --- */}
            <NavLink
              to="/admin/customer"
              className={(!hasClients || !hasAccess('customer')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasClients || !hasAccess('customer')) && e.preventDefault()}
            >
              Lista de Clientes
            </NavLink>
            <NavLink
              to="/admin/promotions"
              className={(!hasClients || !hasAccess('promotions')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasClients || !hasAccess('promotions')) && e.preventDefault()}
            >
              Promoções
            </NavLink>
 
            {/* --- GRUPO: MATÉRIA PRIMA --- */}
            <NavLink
              to="/admin/stock"
              className={(!hasRawMaterial || !hasAccess('stock')) ? admin.disabledLink : ''}
              style={{ color: warningMessage ? 'red' : undefined }}
              onClick={(e) => (!hasRawMaterial || !hasAccess('stock')) && e.preventDefault()}
            >
              Estoque
            </NavLink>
            <NavLink
              to="/admin/supplies"
              className={(!hasRawMaterial || !hasAccess('supplies')) ? admin.disabledLink : ''}
              style={{ color: hasOverdueSupplies ? 'red' : undefined }}
              onClick={(e) => (!hasRawMaterial || !hasAccess('supplies')) && e.preventDefault()}
            >
              Insumos
            </NavLink>
            <NavLink
              to="/admin/managementRecipes"
              className={(!hasRawMaterial || !hasAccess('managementRecipes')) ? admin.disabledLink : ''}
              style={{ color: warningMessage ? 'red' : undefined }}
              onClick={(e) => (!hasRawMaterial || !hasAccess('managementRecipes')) && e.preventDefault()}
            >
              Receitas
            </NavLink>
            <NavLink
              to="/admin/expenses"
              className={(!hasRawMaterial || !hasAccess('expenses')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasRawMaterial || !hasAccess('expenses')) && e.preventDefault()}
            >
              Despesas
            </NavLink>
 
            {/* --- GRUPO: FINANCEIRO --- */}
            <NavLink
              to="/admin/request"
              className={(!hasFinancial || !hasAccess('request')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasFinancial || !hasAccess('request')) && e.preventDefault()}
            >
              Vendas
            </NavLink>
            <NavLink
              to="/admin/sell-flow"
              className={(!hasFinancial || !hasAccess('sell-flow')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasFinancial || !hasAccess('sell-flow')) && e.preventDefault()}
            >
              Fechamento de Caixa
            </NavLink>
            <NavLink
              to="/admin/operationCost"
              className={(!hasFinancial || !hasAccess('operationCost')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasFinancial || !hasAccess('operationCost')) && e.preventDefault()}
            >
              Cadastro de Custo de Operações
            </NavLink>
            <NavLink
              to="/admin/financial-summary"
              className={(!hasFinancial || !hasAccess('financial-summary')) ? admin.disabledLink : ''}
              onClick={(e) => (!hasFinancial || !hasAccess('financial-summary')) && e.preventDefault()}
            >
              Resumo Financeiro
            </NavLink>
 
            {/* --- GRUPO: BÁSICO / SISTEMA --- */}
            <NavLink
              to="/admin/excel-management"
              className={!hasAccess('excel-management') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('excel-management') && e.preventDefault()}
            >
              Carga em Massa (Excel)
            </NavLink>
            <NavLink 
              to="/admin/welcome"
              className={!hasAccess('welcome') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('welcome') && e.preventDefault()}
            >
              Saudação inicial
            </NavLink>
            <NavLink 
              to="/admin/frontimage"
              className={!hasAccess('frontimage') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('frontimage') && e.preventDefault()}
            >
              Configurações do Terminal
            </NavLink>
            <NavLink 
              to="/admin/styles"
              className={!hasAccess('styles') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('styles') && e.preventDefault()}
            >
              Marca e Estilo
            </NavLink>
            
            {/* --- GRUPO: SEGURANÇA E ACESSO (Exclusivo Super Admin) --- */}
            {hasAccess('admin_TOTAL') && (
              <>
                <NavLink 
                  to="/admin/permissions" 
                  style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold' }}
                >
                  🔑 Gerência de Acessos
                </NavLink>
                <NavLink 
                  to="/admin/audit-logs" 
                  style={{ fontWeight: 'bold', marginBottom: '10px' }}
                >
                  📜 Histórico de Logs
                </NavLink>
              </>
            )}

            {hasAccess('admin_TOTAL') && (
              <button 
                onClick={handleInitialSetup} 
                style={{ 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  border: '1px solid #ffeeba',
                  marginTop: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '10px',
                  width: '100%',
                  fontSize: '14px'
                }}
              >
                ⚙️ Setup Inicial (Banco Novo)
              </button>
            )}
 
            <a
              href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.7uh3xmsl0731"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentação
            </a>
 
            <NavLink
              to="/admin/requestlist"
              className={!hasAccess('requestlist') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('requestlist') && e.preventDefault()}
            >
              PDV
            </NavLink>
            <NavLink
              to="/admin/kitchen"
              className={!hasAccess('kitchen') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('kitchen') && e.preventDefault()}
            >
              Cozinha
            </NavLink>
 
            <NavLink
              to="/admin/requestlistcheck"
              className={!hasAccess('requestlistcheck') ? admin.disabledLink : ''}
              onClick={(e) => !hasAccess('requestlistcheck') && e.preventDefault()}
            >
              Lista de Pedidos
            </NavLink>

            <button onClick={logoutAdmin}>Log out</button>
          </div>
        </nav>
        <section>
          <div className={admin.containerIcon}>
            <button
              title="Ajuda Inteligente & Suporte"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit',
                font: 'inherit'
              }}
            >
              <span>?</span>
            </button>
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
