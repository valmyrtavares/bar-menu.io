import React from 'react';
import admin from '../assets/styles/AdminMainMenu.module.css';
import { Link, Outlet } from 'react-router-dom';

const AdminMainMenu = ({ children }) => {
  return (
    <div className={admin.containerAdminMainMenu}>
      <nav>
        <div className={admin.sideMenu}>
          <button>
            <Link to="/admin/stock" className=" btn btn-success sidedishe">
              Estoque
            </Link>
          </button>
        </div>
      </nav>
      <section>
        <h1>Grande Menu do administrador</h1>;
        <div className={admin.mainContent}>
          {' '}
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminMainMenu;
