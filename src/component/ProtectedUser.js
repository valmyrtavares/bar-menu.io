import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedUser = () => {
  const token = localStorage.getItem('userMenu');

  return token ? <Navigate to="/menu" /> : <Navigate to="/create-customer" />;
};

export default ProtectedUser;
