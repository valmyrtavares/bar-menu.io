import React from 'react';
import '../../assets/styles/RecipeModal.css';
import CloseBtn from '../closeBtn';
import { getOneItemColleciton } from '../../api/Api';

const RecipeModal = ({ recipeModal, setRecipeModal }) => {
  const [recipeDishDisplayed, setRecipeDishDisplayed] = React.useState({});
  const [imageDish, setImageDish] = React.useState('');
  const [TitleDish, setTitleDish] = React.useState('');

  React.useEffect(() => {
    const fetchOneDish = async () => {
      const data = await getOneItemColleciton('item', recipeModal.id);
      const { recipe, image, title } = data;
      console.log('Receita   ', recipe);
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
      {recipeDishDisplayed.FinalingridientsList ? (
        <div>
          <div className="image-recipe-container">
            {imageDish && <img src={imageDish} alt="image" />}
          </div>

          {Array.isArray(recipeDishDisplayed.FinalingridientsList) ? (
            <>
              <h3>Ingredientes</h3>
              <ul>
                {recipeDishDisplayed.FinalingridientsList.map((item, index) => (
                  <li key={index}>
                    {typeof item === 'string'
                      ? item
                      : `${item.amount}${item.unitOfMeasurement} ${item.name}`}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {/* Espaço reservado para tratar recipeDishDisplayed.FinalingridientsList como um objeto com 3 arrays */}
              <h3>Ingredientes organizados</h3>
              <div>
                {Object.entries(recipeDishDisplayed.FinalingridientsList).map(
                  ([key, items]) => (
                    <div key={key}>
                      <h4>{key.toUpperCase()}</h4>
                      <ul>
                        {items.map((item, index) => (
                          <li key={index}>
                            {item.name} {item.amount}
                            {item.unitOfMeasurement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          <h3 className="title-recipe">Preparo do {TitleDish}</h3>
          <p>{recipeDishDisplayed.Explanation}</p>
        </div>
      ) : (
        <div className="no-recipe">
          <p className="recipe-text">Não temos uma receita</p>
        </div>
      )}
    </div>
  );
};

export default RecipeModal;
