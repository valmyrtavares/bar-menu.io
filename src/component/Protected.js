import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const Protected = () => {
  const token = localStorage.getItem('token');

  return token ? (
    <Navigate to="/admin/admin" />
  ) : (
    <Navigate to="/admin/login" />
  );
};

export default Protected;
