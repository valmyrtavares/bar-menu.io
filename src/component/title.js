import React from 'react';
import '../style.css';

const Title = ({ mainTitle }) => {
  return (
    <div className="m-1">
      <h3 className="main_title">{mainTitle}</h3>
    </div>
  );
};
export default Title;
