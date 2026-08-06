import React from 'react';
import style from '../assets/styles/Input.module.scss';
import PropTypes from 'prop-types';

const Input = ({ label, fieldFocus, id, unitText, prefix, ...props }) => {
  const inputStyle = {
    fontSize: window.innerWidth > 900 ? 'fontSizeForm' : '16px',
    padding: '10px',
    borderRadius: '4px',
  };
  inputStyle.fontSize = props.fontSizeForm || inputStyle.fontSize;
  return (
    <div className="mb-3" title={props.title} style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label className={style.labelForm} htmlFor={id || label} title={props.title} style={{ display: 'block', whiteSpace: 'nowrap', marginBottom: '4px' }}>
          {label}
        </label>
      )}
      {unitText || prefix ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {prefix && <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#e74c3c' }}>{prefix}</span>}
          <input
            ref={fieldFocus}
            style={inputStyle}
            className="form-control"
            id={id}
            {...props}
          />
          {unitText && (
            <span
              style={{
                fontWeight: 'bold',
                color: '#14213D',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
              title={props.title}
            >
              {unitText}
            </span>
          )}
        </div>
      ) : (
        <input
          ref={fieldFocus}
          style={inputStyle}
          className="form-control"
          id={id}
          {...props}
        />
      )}
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
