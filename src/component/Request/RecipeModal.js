import React from "react";
import CloseBtn from "../closeBtn";

const RecipeModal = ({ setRecipeModal, item }) => {
  React.useEffect(() => {
    console.log("Entrei", item);
    if (item) {
      console.log("Dentro do item   ", item);
    }
  }, [item]);
  return (
    <div>
      <CloseBtn setClose={setRecipeModal} />
      <h1>Aqui estárá a nossa receita</h1>
      {Object.keys(item.recipe).length === 0 ? (
        <p>Não existe nenhuma receita</p>
      ) : (
        <p>Essa é a nossa receita </p>
      )}
    </div>
  );
};
export default RecipeModal;
