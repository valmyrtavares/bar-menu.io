import React from "react";

const Input = ({ label, fieldFocus, id, ...props }) => {
  const inputStyle = {
    fontSize: window.innerWidth > 900 ? "25px" : "16px", // Estilo condicional
    padding: "10px",
    borderRadius: "4px",
  };

  return (
    <div className="mb-3">
      <label style={inputStyle} className="form-label" htmlFor={label}>
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
