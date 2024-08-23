import React from "react";

const RecipeModal = ({ closeModal }) => {
  return (
    <div>
      <button onClick={closeModal}>x</button>
      <h1>Aqui estará a nossa receita</h1>
    </div>
  );
};

export default RecipeModal;
