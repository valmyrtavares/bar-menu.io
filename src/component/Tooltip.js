import React, { useState } from 'react';
import style from '../assets/styles/Tooltip.module.scss';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div 
      className={style.tooltipWrapper}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={showTooltip}
    >
      {children}
      {text && (
        <div className={`${style.tooltipBox} ${isVisible ? style.visible : ''}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
