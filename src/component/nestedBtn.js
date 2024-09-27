import React, { useState } from "react";
import "../assets/styles/nestedBtn.css";
import Dishes from "./Dishes/Dishes";

const NestedBtn = ({ item, parent, menuButton, dishes, containerRef }) => {
  const [display, setDisplay] = useState(false);
  const [childCategory, setChildCategory] = React.useState([]);
  const [childItem, setChildItem] = React.useState([]);
  const buttonRef = React.useRef(null);

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
        behavior: "smooth",
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
        behavior: "smooth",
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

  return (
    <div className="nested-btn">
      {parent === item.category && (
        <button
          ref={buttonRef}
          onClick={hasChildItems}
          className={item.category}
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
