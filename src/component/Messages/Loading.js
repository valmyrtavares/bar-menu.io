import React from 'react';
import '../../assets/styles/loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p>Processando seu pedido...</p>
      </div>
    </div>
  );
};

export default Loading;
