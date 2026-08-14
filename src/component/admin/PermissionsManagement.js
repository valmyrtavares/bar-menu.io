import React from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { GlobalContext } from '../../GlobalContext';
import { logAction } from '../../api/AuditLogger';
import styles from './PermissionsManagement.module.scss';

const MODULES = [
  { id: 'category', name: 'Adicionar Categoria' },
  { id: 'editButtonCat', name: 'Editar Categorias' },
  { id: 'item', name: 'Adicionar Prato' },
  { id: 'editButtonDishes', name: 'Editar Pratos' },
  { id: 'sidedishes', name: 'Adicionar Acompanhamento' },
  { id: 'editButtonSidedishes', name: 'Editar Acompanhamentos' },
  { id: 'customer', name: 'Lista de Clientes' },
  { id: 'promotions', name: 'Promoções' },
  { id: 'stock', name: 'Estoque' },
  { id: 'supplies', name: 'Insumos' },
  { id: 'managementRecipes', name: 'Receitas' },
  { id: 'expenses', name: 'Despesas' },
  { id: 'request', name: 'Vendas' },
  { id: 'sell-flow', name: 'Fechamento de Caixa' },
  { id: 'operationCost', name: 'Custo de Operações' },
  { id: 'financial-summary', name: 'Resumo Financeiro' },
  { id: 'excel-management', name: 'Carga em Massa (Excel)' },
  { id: 'welcome', name: 'Saudação Inicial' },
  { id: 'frontimage', name: 'Configurações do Terminal' },
  { id: 'styles', name: 'Marca e Estilo' },
  { id: 'requestlist', name: 'PDV' },
  { id: 'kitchen', name: 'Cozinha' },
  { id: 'requestlistcheck', name: 'Lista de Pedidos' }
];

export default function PermissionsManagement() {
  const { currentUser } = React.useContext(GlobalContext);
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'admins'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsers(list);
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Encontra qual e-mail possui Controle Total na tabela
  const currentTotalAdmin = users.find(u => u.role === 'admin_TOTAL');

  const handleAddPermission = (userId, value) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;

      if (value === 'admin_TOTAL') {
        // Remove Controle Total de qualquer outro usuário
        return {
          ...user,
          role: 'admin_TOTAL',
          permissions: [] // Limpa as permissões customizadas
        };
      }

      // Adiciona permissão normal
      if (!user.permissions?.includes(value)) {
        return {
          ...user,
          role: 'custom',
          permissions: [...(user.permissions || []), value]
        };
      }
      return user;
    }));

    // Se o super admin selecionar Controle Total para o usuário, removemos dos outros no state local
    if (value === 'admin_TOTAL') {
      setUsers(prev => prev.map(user => {
        if (user.id === userId) return user;
        if (user.role === 'admin_TOTAL') {
          return {
            ...user,
            role: 'custom',
            permissions: ['requestlist'] // Retorna a uma permissão básica
          };
        }
        return user;
      }));
    }
  };

  const handleRemovePermission = (userId, permId) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;
      return {
        ...user,
        permissions: (user.permissions || []).filter(p => p !== permId)
      };
    }));
  };

  const handleRemoveTotalAccess = (userId) => {
    const totalAdminsCount = users.filter(u => u.role === 'admin_TOTAL').length;
    if (totalAdminsCount <= 1) {
      alert('Aviso de Segurança: O sistema precisa de pelo menos 1 usuário com Controle Total.');
      return;
    }

    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;
      return {
        ...user,
        role: 'custom',
        permissions: ['requestlist']
      };
    }));
  };

  const handleSave = async (user) => {
    setSavingId(user.id);
    setMessage(null);
    try {
      const userRef = doc(db, 'admins', user.id);
      await updateDoc(userRef, {
        role: user.role,
        permissions: user.permissions || []
      });

      // Se esse usuário foi promovido a admin_TOTAL, precisamos atualizar os outros no banco de dados também!
      if (user.role === 'admin_TOTAL') {
        for (const u of users) {
          if (u.id !== user.id && u.role === 'admin_TOTAL') {
            const otherUserRef = doc(db, 'admins', u.id);
            await updateDoc(otherUserRef, {
              role: 'custom',
              permissions: ['requestlist']
            });
          }
        }
      }

      const permNames = user.role === 'admin_TOTAL'
        ? 'Controle Total'
        : (user.permissions || []).map(p => MODULES.find(m => m.id === p)?.name || p).join(', ') || 'Nenhum';

      await logAction('Alterar Permissões', {
        alvo_email: user.email,
        alvo_nome: user.name,
        novas_permissoes: permNames,
        nova_role: user.role
      });

      setMessage({ type: 'success', text: `Permissões de ${user.name} salvas com sucesso!` });
      fetchUsers(); // Recarrega para alinhar o estado atualizado do banco
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar as alterações.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (userEmail, userName) => {
    if (userEmail === currentUser.email) {
      window.alert('Você não pode excluir a si mesmo!');
      return;
    }
    const confirm = window.confirm(`Tem certeza que deseja remover o acesso administrativo de ${userName}? O usuário perderá todos os poderes no sistema.`);
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'admins', userEmail));
      await logAction('Excluir Administrador', {
        alvo_email: userEmail,
        alvo_nome: userName,
        acao: 'Usuário removido da coleção admins'
      });
      setMessage({ type: 'success', text: `Acesso de ${userName} removido com sucesso.` });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao excluir o usuário.' });
    }
  };

  if (loading) {
    return <div className={styles.centered}>Carregando administradores...</div>;
  }

  return (
    <div className={styles.container}>
      <Link to="/admin/admin" className={styles.btnBack} title="Sair do Módulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <h2 className={styles.title}>Gerência de Acessos</h2>
      <p className={styles.subtitle}>Gerencie os poderes e privilégios de acesso de cada administrador do sistema.</p>

      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Poderes/Permissões</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isTotalAdmin = user.role === 'admin_TOTAL';
            const hasAnyTotalAdmin = !!currentTotalAdmin;
            
            // Controle Total só pode ser concedido se não houver outro, ou se for ele mesmo
            const canGiveTotalAdmin = !hasAnyTotalAdmin || (hasAnyTotalAdmin && currentTotalAdmin.id === user.id);

            return (
              <tr key={user.id}>
                <td className={styles.userName}>{user.name}</td>
                <td className={styles.userEmail}>{user.email}</td>
                <td>
                  <div className={styles.permissionsContainer}>
                    {/* Tags Atuais */}
                    <div className={styles.tagsContainer}>
                      {isTotalAdmin ? (
                        <span className={styles.tagTotal}>
                          👑 Controle Total
                          <button
                            type="button"
                            className={styles.removeTagBtn}
                            onClick={() => handleRemoveTotalAccess(user.id)}
                            title="Remover Controle Total"
                          >
                            ×
                          </button>
                        </span>
                      ) : (
                        (user.permissions || []).map((permId) => {
                          const mod = MODULES.find(m => m.id === permId);
                          return (
                            <span key={permId} className={styles.tagCustom}>
                              {mod ? mod.name : permId}
                              <button
                                type="button"
                                className={styles.removeTagBtn}
                                onClick={() => handleRemovePermission(user.id, permId)}
                                title="Remover Permissão"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>

                    {/* Dropdown de Seleção de Permissões */}
                    {!isTotalAdmin && (
                      <select
                        className={styles.selectPermissions}
                        value=""
                        onChange={(e) => handleAddPermission(user.id, e.target.value)}
                      >
                        <option value="" disabled>+ Adicionar poder...</option>
                        {canGiveTotalAdmin && (
                          <option value="admin_TOTAL" className={styles.optionTotal}>
                            👑 Controle Total
                          </option>
                        )}
                        {MODULES
                          .filter(mod => !(user.permissions || []).includes(mod.id))
                          .map(mod => (
                            <option key={mod.id} value={mod.id}>
                              {mod.name}
                            </option>
                          ))
                        }
                      </select>
                    )}
                  </div>
                </td>
                <td className={styles.actionCell}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => handleSave(user)}
                    disabled={savingId === user.id}
                  >
                    {savingId === user.id ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteUser(user.email, user.name)}
                    disabled={savingId === user.id || user.email === currentUser.email}
                    title={user.email === currentUser.email ? 'Você não pode excluir seu próprio acesso' : 'Excluir Administrador'}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
