import React from 'react';
import PropTypes from 'prop-types';
import style from '../../assets/styles/MessagePromotions.module.scss';

const MessagePromotions = ({
  message,
  setClose,
  onContinue,
  AddPromotion,

  item,
}) => {
  const handleCancel = () => {
    setClose(false);
  };

  const handleContinue = () => {
    onContinue();
    setClose(false);
  };

  return (
    <div className={style.popup}>
      <div className={style.popupContent}>
        <p>{message}</p>
        <div className={style.buttons}>
          <button onClick={handleCancel}>Cancelar</button>
          {AddPromotion && <button onClick={handleContinue}>Continuar</button>}
        </div>
      </div>
    </div>
  );
};

MessagePromotions.propTypes = {
  message: PropTypes.string.isRequired,
  setClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
};

export default MessagePromotions;
