//import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import Title from '../component/title.js';
import MenuButton from '../component/menuHamburguerButton.js';
import '../assets/styles/FormMenu.css';

const FormMenu = () => {
  return (
    <div className="container">
      <MenuButton />
      <Title title="Menu de Formulários" />
      <div className="row">
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/category">Adicione Botão </Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/editButton/cat">Lista de Botões</Link>
        </button>
      </div>
      <div className="row">
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/item">Adicione um prato</Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/editButton/dishes">Lista de pratos</Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/frontimage">Adicione sua marca</Link>
        </button>
        <button className="col-sm-4 btn btn-success nostyle m-2">
          <Link to="/admin/sidedishes">Adicione Acompanhamentos opcionais</Link>
        </button>
      </div>
    </div>
  );
};

export default FormMenu;
