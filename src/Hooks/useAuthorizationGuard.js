import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalContext';
import { CheckUser } from '../Helpers/Helpers';

export function useAuthorizationGuard() {
  const global = useContext(GlobalContext);
  const navigate = useNavigate();

  const checkToten = async () => {
    const totenExist = localStorage.getItem('toten');

    if (!totenExist || global.isToten !== true) {
      global.setIsToten(false);

      if (!global.authorizated) {
        const userId = await CheckUser('userMenu', false);
        navigate(userId);
      }
    } else {
      global.setIsToten(true);
      const userId = await CheckUser('userMenu', true);
      navigate(userId);
    }
  };

  useEffect(() => {
    checkToten();
  }, []);

  useEffect(() => {
    if (global.isToten === null) return;
    if (!global.authorizated) {
      checkToten();
    }
  }, [global.isToten, global.authorizated]);
}
