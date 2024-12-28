import React from 'react';
import '../assets/styles/Title.scss';

const Title = ({ mainTitle }) => {
  return (
    <div className="containerTitle">
      <h3>{mainTitle}</h3>
    </div>
  );
};
export default Title;
