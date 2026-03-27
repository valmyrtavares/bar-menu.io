import React, { useState } from 'react';
import '../assets/styles/nestedBtn.css';
import Dishes from './Dishes/Dishes';

const NestedBtn = ({
  item,
  parent,
  menuButton,
  dishes,
  containerRef,
  depth = 0,
}) => {
  const [display, setDisplay] = useState(false);
  const [childCategory, setChildCategory] = React.useState([]);
  const [childItem, setChildItem] = React.useState([]);
  const buttonRef = React.useRef(null);
 
  // Hierarchical styling calculations
  const btnWidth = 80 * Math.pow(0.9, depth);
  const btnMarginHorizontal = (100 - btnWidth) / 2;
  const btnOpacity = Math.max(0.6, 1 - depth * 0.1);
 
  const buttonStyle = {
    width: `${btnWidth}%`,
    marginLeft: `${btnMarginHorizontal}%`,
    marginRight: `${btnMarginHorizontal}%`,
    opacity: btnOpacity,
  };
 
  const hasChildItems = (event) => {
    setDisplay(!display);
 
    if (buttonRef.current && containerRef.current) {
      const button = buttonRef.current;
      const container = containerRef.current;
 
      // Obtém a posição atual do botão em relação ao topo do contêiner
      const buttonOffsetTop = button.offsetTop;
 
      // Define um deslocamento menor manualmente para suavizar a rolagem
      const offset = 200; // Ajuste esse valor para controlar o quanto você quer rolar
 
      // Rola o contêiner para uma posição personalizada, movendo menos que o total
      container.scrollTo({
        top: container.scrollTop + offset, // Subtraia o offset para limitar o quanto ele rola
        behavior: 'smooth',
      });
    }
  };
 
  //Rolagem automática para o final do contêiner quando o display muda (itens são exibidos)
  React.useEffect(() => {
    if (display && containerRef.current) {
      const container = containerRef.current;
      const offset = 200;
      container.scrollTo({
        top: container.scrollTop + offset, // Rola até o fim do contêiner
        behavior: 'smooth',
      });
    }
  }, [display, childCategory, childItem]);
 
  React.useEffect(() => {
    if (menuButton) {
      setChildCategory(menuButton.filter((btn) => item.parent == btn.category));
    }
  }, []);
 
  React.useEffect(() => {
    if (dishes) {
      const filterItem = dishes.filter(
        (dishe) => item.parent == dishe.category
      );
      setChildItem(filterItem);
    }
  }, []);
  React.useEffect(() => {
    if (dishes) {
      const filterItem = dishes.filter(
        (dishe) => item.parent == dishe.category
      );
      setChildItem(filterItem);
    }
  }, [dishes]);
 
  return (
    <div className="nested-btn">
      {parent === item.category && (
        <button
          ref={buttonRef}
          onClick={hasChildItems}
          className={item.category}
          style={buttonStyle}
        >
          {item.title}
        </button>
      )}
      {display &&
        childCategory.length > 0 &&
        childCategory.map((childItem, index) => (
          <React.Fragment key={index}>
            <div>
              <NestedBtn
                parent={item.parent}
                item={childItem}
                menuButton={menuButton}
                dishes={dishes}
                containerRef={containerRef}
                depth={depth + 1}
              />
            </div>
          </React.Fragment>
        ))}
      {display &&
        childItem.length > 0 &&
        childItem.map((item, index) => (
          <React.Fragment key={index}>
            <Dishes newItem={item} />
          </React.Fragment>
        ))}
    </div>
  );
};

export default NestedBtn;
