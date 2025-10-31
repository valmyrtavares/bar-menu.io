import React from 'react';
import SellsPoint from '../Request/RequestListToBePrepared';
import PdvMainMenu from '../../Pages/PdvMainMenu.js';
import style from '../../assets/styles/pdv.module.scss';
import Title from '../title.js';
import { Link } from 'react-router-dom';
import RequestModal from './requestModal.js';
import { GlobalContext } from '../../GlobalContext.js';
//import WarningAmoutMessage from '../Messages/WarningAmoutMessage.js';
import WarningAmoutMessage from '../Messages/WarningAmoutMessage';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers.js';

const PDV = () => {
  const funcaoDeDisparo = async () => {
    await checkUnavaiableRawMaterial('arroz', false);
  };
  return (
    <div>
      <Link to="/admin/admin">
        <Title mainTitle="Ponto de Venda" />
      </Link>
      <button onClick={funcaoDeDisparo}>Teste de produto</button>
      <WarningAmoutMessage />
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
