import React from "react";
import "../../assets/styles/RecipeModal.css";
import CloseBtn from "../closeBtn";
import { getOneItemColleciton } from "../../api/Api";

const RecipeModal = ({ recipeModal, setRecipeModal }) => {
  const [recipeDishDisplayed, setRecipeDishDisplayed] = React.useState({});
  const [imageDish, setImageDish] = React.useState("");
  const [TitleDish, setTitleDish] = React.useState("");

  React.useEffect(() => {
    const fetchOneDish = async () => {
      const data = await getOneItemColleciton("item", recipeModal.id);
      const { recipe, image, title } = data;
      if (recipe) {
        setRecipeDishDisplayed(recipe);
      }
      if (image && title) {
        setImageDish(image);
        setTitleDish(title);
      }
    };
    fetchOneDish();
  }, []);

  return (
    <div className="recipe-global-container">
      <div className="btn-container">
        <button
          onClick={() =>
            setRecipeModal((prev) => ({ ...prev, openModal: false }))
          }
        >
          x
        </button>
      </div>
      {recipeDishDisplayed.FinalingridientsList &&
      recipeDishDisplayed.FinalingridientsList.length > 0 ? (
        <div className="current-recipe">
          <div className="image-recipe-container">
            {imageDish && <img src={imageDish} alt="image" />}
          </div>
          <h3>ingredientes</h3>
          <ul>
            {recipeDishDisplayed.FinalingridientsList &&
              recipeDishDisplayed.FinalingridientsList.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
          </ul>
          <h3>Preparo do {TitleDish}</h3>
          <p>{recipeDishDisplayed.Explanation}</p>
        </div>
      ) : (
        <div className="no-recipe">
          <p>Não temos uma receita</p>
        </div>
      )}
    </div>
  );
};

export default RecipeModal;
