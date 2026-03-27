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
  
  // Usando refs para evitar re-renderizações excessivas durante o movimento do dedo
  const touchStartX = React.useRef(null);
  const touchEndX = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; 
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const startTransition = (targetView) => {
    if (global.pdvMobileView === targetView) return;
    setIsTransitioning(true);
    global.setPdvMobileView(targetView);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Tempo sintonizado com o SCSS
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDist = 70; 

    if (distance > minSwipeDist) {
      startTransition('orders');
    } else if (distance < -minSwipeDist) {
      startTransition('menu');
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const toggleView = () => {
    startTransition(global.pdvMobileView === 'menu' ? 'orders' : 'menu');
  };

  return (
    <div 
      className={style.mainWrapper}
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      <div className={style.fixedHeader}>
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
          {(!isMobile || global.pdvMobileView === 'menu' || isTransitioning) && <PdvMainMenu />}
        </div>
        <div className={`${style.viewSection} ${isMobile && global.pdvMobileView === 'menu' && !isTransitioning ? style.hide : ''}`}>
          {(!isMobile || global.pdvMobileView === 'orders' || isTransitioning) && <SellsPoint />}
        </div>
      </div>
    </div>
  );
};
export default PDV;
