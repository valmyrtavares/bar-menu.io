import React from 'react';
import '../style.css';

const Title = ({ title }) => {
  return (
    <div className="m-5">
      <h3 className="main_title">{title}</h3>
    </div>
  );
};
export default Title;
