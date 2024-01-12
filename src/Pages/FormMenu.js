import React, { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Title from '../component/title.js';

const FormMenu = () => {
  return (
    <div>
      <Title title="Menu de Formulários" />
      <ul>
        <li>
          <Link to="/admin/category">form categoria</Link>
        </li>
        <li>
          <Link to="/admin/item">form pratos</Link>
        </li>
      </ul>
    </div>
  );
};

export default FormMenu;
