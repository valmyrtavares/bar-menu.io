import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getBtnData } from "../api/Api";
import { GlobalContext } from "../GlobalContext";

const ProtectedUser = () => {
  const [isAuthenticated, setIsAuthencicated] = React.useState(null);
  const global = React.useContext(GlobalContext);

  React.useEffect(() => {
    const fetchData = async () => {
      const { id } = JSON.parse(localStorage.getItem("userMenu"));
      const token = await fetchUser(id);
      if (token && token.length > 0) {
        setIsAuthencicated(true);
        global.setAuthorizated(true); //That is a global variable that indicates normal user conditions. It will be use in mainMenu Component
      } else {
        setIsAuthencicated(false);
      }
    };
    fetchData();
  }, []);

  const fetchUser = async (id) => {
    const data = await getBtnData("user");
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
