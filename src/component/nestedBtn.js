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

      // Rola o contêiner para o botão clicado
      button.scrollIntoView({
        behavior: "smooth",
        block: "start", // Ajusta para que o botão fique visível e também permita ver os itens abaixo
        inline: "nearest",
      });
    }
  };

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
