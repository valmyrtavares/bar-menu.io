import React, { useState } from 'react';
import './assets/styles/nestedBtn.css';

const NestedBtn = ({ item, parent, menuButton }) => {
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
    </div>
  );
};

export default NestedBtn;
