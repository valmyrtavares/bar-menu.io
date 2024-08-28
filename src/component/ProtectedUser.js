import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getBtnData } from "../api/Api";

const ProtectedUser = () => {
  const [isAuthenticated, setIsAuthencicated] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const { id } = JSON.parse(localStorage.getItem("userMenu"));
      const token = await fetchUser(id);
      if (token && token.length > 0) {
        setIsAuthencicated(true);
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
