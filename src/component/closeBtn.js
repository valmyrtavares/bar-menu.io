import React from 'react';

const CloseBtn = ({ setClose }) => {
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const container = {
    width: '100%',
    display: 'flex',
    justifyContent: 'end',
  };

  return (
    <div style={container}>
      {' '}
      <button
        style={buttonStyle}
        onClick={() => {
          setClose(false);
        }}
      >
        x
      </button>
    </div>
  );
};
export default CloseBtn;
