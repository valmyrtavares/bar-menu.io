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
  const global = React.useContext(GlobalContext);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1000);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const [manualTableNumber, setManualTableNumber] = React.useState('');
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startTransition = (targetView) => {
    if (global.pdvMobileView === targetView) return;
    setIsTransitioning(true);
    global.setPdvMobileView(targetView);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Tempo sintonizado com o SCSS
  };

  const toggleView = () => {
    startTransition(global.pdvMobileView === 'menu' ? 'orders' : 'menu');
  };

  return (
    <div className={style.mainWrapper}>
      <div className={style.fixedHeader}>
        <Link to="/admin/admin" className={style.btnBack} title="Sair do Módulo">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <Link to="/admin/admin" style={{ textDecoration: 'none' }}>
          <Title mainTitle="Ponto de Venda" />
        </Link>
        <WarningAmoutMessage />
        
        {isMobile && (
          <p 
            className={style.viewToggle} 
            onClick={toggleView}
          >
           {global.pdvMobileView === 'orders' ? 'CARDAPIO' : 'PEDIDOS'}
          </p>
        )}
      </div>

      <div className={`${style.pdvContainer} ${isMobile ? style.mobileMode : ''} ${isMobile && global.pdvMobileView === 'orders' ? style.showOrders : ''}`}>
        <div className={`${style.viewSection} ${isMobile && global.pdvMobileView === 'orders' && !isTransitioning ? style.hide : ''}`}>
          {(!isMobile || global.pdvMobileView === 'menu' || isTransitioning) && (
            <PdvMainMenu 
              manualTableNumber={manualTableNumber} 
              setManualTableNumber={setManualTableNumber} 
            />
          )}
        </div>
        <div className={`${style.viewSection} ${isMobile && global.pdvMobileView === 'menu' && !isTransitioning ? style.hide : ''}`}>
          {(!isMobile || global.pdvMobileView === 'orders' || isTransitioning) && <SellsPoint />}
        </div>
      </div>
    </div>
  );
};
export default PDV;
