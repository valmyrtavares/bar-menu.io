import React, { useState } from 'react';
import MockData from './MockData';
import './btn.css';

const Btn = ({ itemBtn }) => {
  const [display, setDisplay] = useState(false);

  const hasChildItems = () => {
    setDisplay(!display);
  };

  return (
    <div>
      <button onClick={hasChildItems} className="colorful">
        {itemBtn.title} times
      </button>
      {display && <p>{JSON.stringify(itemBtn, null, 2)}</p>}
      {MockData.map((item, index) => (
        <div key={index}>
          {item.ChildCategory === itemBtn.category ? <Btn item={item} /> : null}
        </div>
      ))}
    </div>
  );
};
export default Btn;

// {item.ChildCategory === item.category ? <Btn item={item} /> : null}
