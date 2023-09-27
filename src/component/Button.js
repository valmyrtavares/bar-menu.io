import React from 'react';

  const Button = (props) => {

    const handleClick = () =>{
        props.click();
    }

    return (
      <>
        <button onClick={handleClick}>{props.label}</button>        
      </>
    )
  };

  export default Button;