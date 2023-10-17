import React from 'react';

const Input = ({ label, id, ...props }) => {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={label}>
        {label}
      </label>
      <input className="form-control" id={id} {...props} />
    </div>
  );
};
export default Input;
