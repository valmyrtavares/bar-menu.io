import React from 'react';
import style from '../assets/styles/Input.module.scss';
import PropTypes from 'prop-types';

const Input = ({ label, fieldFocus, id, ...props }) => {
  const inputStyle = {
    fontSize: window.innerWidth > 900 ? 'fontSizeForm' : '16px',
    padding: '10px',
    borderRadius: '4px',
  };
  inputStyle.fontSize = props.fontSizeForm || inputStyle.fontSize;
  return (
    <div className="mb-3">
      <label className={style.labelForm} htmlFor={label}>
        {label}
      </label>
      <input
        ref={fieldFocus}
        style={inputStyle}
        className="form-control"
        id={id}
        {...props}
      />
    </div>
  );
};
export default Input;

Input.propTypes = {
  label: PropTypes.string.isRequired,
  fieldFocus: PropTypes.object,
  id: PropTypes.string,
  fontSizeForm: PropTypes.string,
};
