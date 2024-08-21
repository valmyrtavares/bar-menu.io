import React from "react";
import "../../assets/styles/recipeDish.css";
import Input from "../Input";
import CloseBtn from "../closeBtn";

const RecipeDish = ({ setRecipeModal }) => {
  const [ingridients, setIngridients] = React.useState("");
  const [IngridientsGroup, setIngridientsGroup] = React.useState([]);
  const [form, setForm] = React.useState({
    gift: "",
    salute: "",
  });
  const fieldFocus = React.useRef();

  const addIngredient = () => {
    setIngridientsGroup([...IngridientsGroup, ingridients]);
    setIngridients("");
    fieldFocus.current.focus();
  };
  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value });
  }

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
          value={form.gift}
          onChange={handleChange}
        >
          Saudação
        </textarea>
      </div>
    </div>
  );
};
export default RecipeDish;
