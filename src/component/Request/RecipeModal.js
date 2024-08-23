import React from "react";

const RecipeModal = ({ closeModal, item }) => {
  React.useEffect(() => {
    if (item) {
      console.log(item);
    }
  }, [item]);

  const hasRecipe = item && item.recipe && Object.keys(item.recipe).length > 0;
  return (
    <div>
      <button onClick={closeModal}>x</button>
      {!hasRecipe ? (
        <p>Não existe nenhuma receita</p>
      ) : (
        <p>Essa é a nossa receita </p>
      )}
    </div>
  );
};

export default RecipeModal;
