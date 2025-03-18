import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getBtnData } from '../api/Api';
import { GlobalContext } from '../GlobalContext';

const ProtectedUser = () => {
  const [isAuthenticated, setIsAuthencicated] = React.useState(null);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      const USER = JSON.parse(localStorage.getItem('userMenu'));
      if (USER) {
        const id = USER.id;
        const token = await fetchUser(id);
        console.log('TOKEN   ', token);
        if (token && token.length > 0) {
          console.log('Autenticação É true');
          setIsAuthencicated(true);
          global.setAuthorizated(true); //That is a global variable that indicates normal user conditions. It will be use in mainMenu Component
        } else {
          console.log('Autenticação É false');
          setIsAuthencicated(false);
          global.setAuthorizated(false);
        }
      } else {
        navigate('/create-customer');
      }
    };
    fetchData();
  }, []);

  const fetchUser = async (id) => {
    const data = await getBtnData('user');
    const token = data.filter((item) => item.id === id);
    return token;
  };

  if (isAuthenticated === null) {
    // Você pode renderizar um spinner ou algo enquanto espera o resultado da autenticação
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <Navigate to="/menu" />
  ) : (
    <Navigate to="/create-customer" />
  );
};

export default ProtectedUser;
