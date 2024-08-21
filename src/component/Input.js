import React from "react";

const Input = ({ label, fieldFocus, id, ...props }) => {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={label}>
        {label}
      </label>
      <input ref={fieldFocus} className="form-control" id={id} {...props} />
    </div>
  );
};
export default Input;
