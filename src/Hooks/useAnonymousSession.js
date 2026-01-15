import { useEffect, useState, useContext } from 'react';
import { GlobalContext } from '../GlobalContext';
import { getOneItemColleciton, deleteData } from '../api/Api';
import { useNavigate } from 'react-router-dom';

export function useAnonymousSession() {
  const [nameClient, setNameClient] = useState('');
  const global = useContext(GlobalContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.hasOwnProperty('userMenu')) return;

    const user = JSON.parse(localStorage.getItem('userMenu'));

    if (user.name === 'anonimo') {
      scheduleAnonymousCleanup(user.id);
    }

    const firstName =
      user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase();

    setNameClient(firstName);
  }, []);

  function scheduleAnonymousCleanup(id) {
    setTimeout(async () => {
      try {
        const data = await getOneItemColleciton('user', id);

        if (!data?.request || data?.request.length === 0) {
          await deleteData('user', id);
          localStorage.removeItem('userMenu');
          global.setAuthorizated(false);
          navigate('create-customer');
        }
      } catch (err) {
        console.error('Erro ao limpar usuário anônimo', err);
      }
    }, 1200000);
  }

  function logout() {
    localStorage.removeItem('userMenu');
    global.setAuthorizated(false);
    navigate('create-customer');
  }

  return {
    nameClient,
    logout,
  };
}
