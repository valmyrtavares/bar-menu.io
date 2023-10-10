import React from 'react';

  const Button = (props) => {

    const handleClick = () =>{
        props.onClick();
    }

    return (
      <>
        <button className="btn btn-success" onClick={handleClick}>{props.label}</button>        
      </>
    )
  };

  export default Button;