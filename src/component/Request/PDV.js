import React from 'react';
import SellsPoint from '../Request/RequestListToBePrepared';
import PdvMainMenu from '../../Pages/PdvMainMenu.js';
import style from '../../assets/styles/pdv.module.scss';
import Title from '../title.js';
import { Link } from 'react-router-dom';
import RequestModal from './requestModal.js';

const PDV = () => {
  return (
    <div>
      <Link to="/admin/admin">
        <Title mainTitle="Ponto de Venda" />
      </Link>

      <div className={style.pdvContainer}>
        <div>
          <PdvMainMenu />
        </div>
        <div>
          <SellsPoint />
        </div>
      </div>
    </div>
  );
};
export default PDV;
