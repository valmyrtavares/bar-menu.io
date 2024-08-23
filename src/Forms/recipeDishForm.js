import React from "react";
import "../assets/styles/recipeDish.css";
import Input from "../component/Input";
import CloseBtn from "../component/closeBtn";

const RecipeDish = ({ setRecipeModal, setRecipe }) => {
  const [ingridients, setIngridients] = React.useState("");
  const [IngridientsGroup, setIngridientsGroup] = React.useState([]);
  const [recipeExplanation, setRecipeExplanation] = React.useState("");
  const fieldFocus = React.useRef();

  const addIngredient = () => {
    setIngridientsGroup([...IngridientsGroup, ingridients]);
    setIngridients("");
    fieldFocus.current.focus();
  };

  const sendRecipe = () => {
    setRecipe({
      FinalingridientsList: IngridientsGroup,
      Explanation: recipeExplanation,
    });
    setRecipeModal(false);
  };

  const remveIten = (index) => {
    let updatedList = [...IngridientsGroup];
    updatedList.splice(index, 1);
    setIngridientsGroup(updatedList);
  };
  return (
    <div className="recipeDish-container">
      <CloseBtn setClose={setRecipeModal} />
      <h1>Faça sua receita</h1>
      <div className="ingridients">
        <Input
          id="recipe"
          fieldFocus={fieldFocus}
          label="Liste seus ingredientes"
          value={ingridients}
          type="text"
          onChange={({ target }) => setIngridients(target.value)}
        />
        <button type="button" onClick={addIngredient}>
          Adicione
        </button>
      </div>
      <div className="items-recipe">
        {IngridientsGroup &&
          IngridientsGroup.map((item, index) => (
            <p className="items" key={index} onClick={() => remveIten(index)}>
              {item} X
            </p>
          ))}
      </div>
      <div>
        <label>Escreva sua receita</label>
        <textarea
          id="gift"
          className="text-area"
          value={recipeExplanation}
          onChange={({ target }) => setRecipeExplanation(target.value)}
        >
          Saudação
        </textarea>
        <p>{recipeExplanation} </p>
      </div>
      <button onClick={sendRecipe}>Enviar Receita</button>
    </div>
  );
};
export default RecipeDish;
