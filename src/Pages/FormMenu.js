//import React, { useLayoutEffect } from 'react';
import { Link } from "react-router-dom";
import Title from "../component/title.js";

import "../assets/styles/FormMenu.css";

const FormMenu = () => {
  return (
    <div className="container">
      <Title title="Menu de Formulários" />
      <div className="row">
        <Link
          to="/admin/category"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Adicione Botão{" "}
        </Link>

        <Link
          to="/admin/editButton/cat"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Lista de Botões
        </Link>
      </div>
      <div className="row">
        <Link to="/admin/item" className="col-sm-4 btn btn-success nostyle m-2">
          Adicione um prato
        </Link>

        <Link
          to="/admin/editButton/dishes"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Lista de pratos
        </Link>

        <Link
          to="/admin/frontimage"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Adicione sua marca
        </Link>

        <Link
          to="/admin/sidedishes"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Adicione Acompanhamentos opcionais
        </Link>

        <Link
          to="/admin/editButton/sidedishes"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Lista de acompanhamentos
        </Link>
        <Link
          to="/admin/styles"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Gerenciando Style
        </Link>
        <Link
          to="/admin/welcome"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Crie sua Saudação inicial
        </Link>
        <Link
          to="/requestlist"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Pedidos da Cozinha
        </Link>
      </div>
    </div>
  );
};

export default FormMenu;
