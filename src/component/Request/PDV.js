import React from 'react';
import SellsPoint from '../Request/RequestListToBePrepared';
import PdvMainMenu from '../../Pages/PdvMainMenu.js';
import style from '../../assets/styles/pdv.module.scss';

const PDV = () => {
  return (
    <div className={style.pdvContainer}>
      <div>
        <SellsPoint />
      </div>
      <div>
        <PdvMainMenu />
      </div>
    </div>
  );
};
export default PDV;
