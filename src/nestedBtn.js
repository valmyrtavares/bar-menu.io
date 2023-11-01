import React, { useState } from 'react';
import './assets/styles/nestedBtn.css';
import Item from './item';

const NestedBtn = ({ item, parent, menuButton, dishes }) => {
  const [display, setDisplay] = useState(false);
  const [childCategory, setChildCategory] = React.useState([]);
  const [childItem, setChildItem] = React.useState([]);

  const hasChildItems = () => {
    setDisplay(!display);
  };

  React.useEffect(() => {
    if (menuButton) {
      setChildCategory(menuButton.filter((btn) => item.parent == btn.category));
    }
    console.log(childItem);
  }, []);

  React.useEffect(() => {
    if (dishes) {
      const filterItem = dishes.filter(
        (dishe) => item.parent == dishe.category
      );
      console.log(filterItem);
      setChildItem(filterItem);
    }
  }, []);

  return (
    <div className="nested-btn">
      {parent === item.category && (
        <button onClick={hasChildItems} className={item.category}>
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
              />
            </div>
          </React.Fragment>
        ))}

      {display &&
        childItem.length > 0 &&
        childItem.map((item, index) => (
          <React.Fragment key={index}>
            <Item newItem={item} />
          </React.Fragment>
        ))}
    </div>
  );
};

export default NestedBtn;
