//import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import Title from '../component/title.js';
import '../assets/styles/FormMenu.css';

const FormMenu = () => {
  return (
    <div className="container">
      <Title title="Menu de Formulários" />
      <div className="row">
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/category">Adicione Categoria </Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/editButton/cat">Lista de Categorias</Link>
        </button>
      </div>
      <div className="row">
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/item">Adicione um prato</Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/editButton/dishes">Lista de pratos</Link>
        </button>
      </div>
    </div>
  );
};

export default FormMenu;
