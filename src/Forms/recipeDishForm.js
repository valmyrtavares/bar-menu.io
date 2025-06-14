import React from 'react';
import style from '../assets/styles/recipeDish.module.scss';
import Input from '../component/Input';
import CloseBtn from '../component/closeBtn';
import { getBtnData } from '../api/Api';
import Title from '../component/title.js';
import { Link } from 'react-router-dom';
import { alertMinimunAmount } from '../Helpers/Helpers.js';

const RecipeDish = ({
  setRecipeModal,
  setRecipe,
  recipe,
  customizedPriceObj,
}) => {
  const [ingridients, setIngridients] = React.useState({
    name: '',
    amount: '',
    unitOfMeasurement: '',
  });
  const [IngridientsGroup, setIngridientsGroup] = React.useState([]);
  const [recipeExplanation, setRecipeExplanation] = React.useState('');
  const [productList, setProductList] = React.useState(null);
  const [ingredientsSimple, setIngredientsSimple] = React.useState([]);
  const [ingredientsBySize, setIngredientsBySize] = React.useState({});
  const fieldFocus = React.useRef();

  React.useEffect(() => {
    //#1
    if (recipe) {
      if (!recipe.Explanation && !recipe.FinalingridientsList) {
        recipe.Explanation = '';
        recipe.FinalingridientsList = [];
        formatterRecipes(recipe);
      } else {
        formatterRecipes(recipe);
      }
      setIngridientsGroup(recipe.FinalingridientsList);
      setRecipeExplanation(recipe.Explanation);
    }
  }, [recipe]);

  React.useEffect(() => {
    //#2
    console.log('Veja como bem o nossa receita    ', recipe);
    const fetchProduct = async () => {
      const data = await getBtnData('stock');
      const sortedData = data.sort((a, b) =>
        a.product.localeCompare(b.product)
      );
      console.log('Produtos   ', sortedData);
      setProductList(sortedData);
    };

    fetchProduct();
    setIngridientsGroup([]);
    console.log('Customized Price   ', customizedPriceObj);
  }, []);

  React.useEffect(() => {
    //#3
    calculateItemCost(ingredientsBySize);
    if (ingredientsBySize)
      console.log('ingredientsBySize    ', ingredientsBySize);
    if (ingredientsSimple)
      console.log('ingredientsSimple    ', ingredientsSimple);
  }, [ingredientsBySize, ingredientsSimple]);

  const isEmptyObject = (obj) => {
    if (obj.firstLabel === '' || obj.firstLabel === undefined) {
      return true;
    } else {
      return false;
    }
  };
  const calculateItemCost = (ingredients, label) => {
    if (label) {
      const items = ingredients[label];

      if (!Array.isArray(items)) return 0;

      const total = items.reduce((sum, item) => {
        const value = parseFloat(item.portionCost) || 0;
        return sum + value;
      }, 0);

      return Number(total.toFixed(2));
    }

    // Fallback caso ingredients seja um array diretamente
    if (!Array.isArray(ingredients)) return 0;

    const total = ingredients.reduce((sum, item) => {
      const value = parseFloat(item.portionCost) || 0;
      return sum + value;
    }, 0);

    return Number(total.toFixed(2));
  };

  const formatterRecipes = (recipe) => {
    if (Array.isArray(recipe.FinalingridientsList)) {
      setIngredientsSimple(recipe.FinalingridientsList);
    } else {
      setIngredientsBySize(recipe.FinalingridientsList);
    }
  };

  const extractLabelSizes = () => {
    return [
      customizedPriceObj.firstLabel,
      customizedPriceObj.secondLabel,
      customizedPriceObj.thirdLabel,
    ];
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      const selectedProduct = productList[value];
      console.log('selectedProduct', selectedProduct);

      const costPerUnit =
        selectedProduct && selectedProduct.totalVolume > 0
          ? selectedProduct.totalCost / selectedProduct.totalVolume
          : 0;

      setIngridients((prevForm) => ({
        ...prevForm,
        name: selectedProduct ? selectedProduct.product : '',
        unitOfMeasurement: selectedProduct
          ? selectedProduct.unitOfMeasurement
          : '',
        costPerUnit: costPerUnit,
        portionCost: prevForm.amount
          ? parseFloat(prevForm.amount) * costPerUnit
          : 0,
      }));
    } else {
      setIngridients({
        ...ingridients,
        [id]: value,
      });
      if (id === 'amount') {
        const costPerUnit = ingridients.costPerUnit || 0;
        const newPortionCost = parseFloat(value) * costPerUnit;
        setIngridients((prevForm) => ({
          ...prevForm,
          portionCost: newPortionCost,
        }));
      }
    }
  };

  const addIngredient = (size) => {
    if (!isEmptyObject(customizedPriceObj)) {
      setIngredientsBySize((prev) => ({
        ...prev,
        [size]: [...(prev[size] || []), ingridients],
      }));
    } else {
      setIngredientsSimple((prev) => [...prev, ingridients]);
    }
    setIngridients({ name: '', amount: '', unitOfMeasurement: '' });
  };

  const sendRecipe = () => {
    if (!isEmptyObject(customizedPriceObj)) {
      setRecipe({
        FinalingridientsList: ingredientsBySize,
        Explanation: recipeExplanation,
      });
    } else {
      setRecipe({
        FinalingridientsList: ingredientsSimple,
        Explanation: recipeExplanation,
      });
    }
    setRecipeModal(false);
  };

  const removeItem = (sizeOrIndex, index) => {
    if (!isEmptyObject(customizedPriceObj) && index !== undefined) {
      // Caso com `customizedPriceObj` e dois parâmetros (size e index)
      setIngredientsBySize((prev) => ({
        ...prev,
        [sizeOrIndex]: prev[sizeOrIndex]?.filter((_, i) => i !== index), // Remove o item específico
      }));
    } else if (!isEmptyObject(customizedPriceObj)) {
      console.error('Index is required for customizedPriceObj scenario.');
    } else {
      // Caso sem `customizedPriceObj`, com apenas o index
      const updatedList = ingredientsSimple.filter((_, i) => i !== sizeOrIndex); // Aqui, sizeOrIndex é tratado como o índice
      setIngredientsSimple(updatedList);
    }
  };

  return (
    <div className={style.recipeDisContainer}>
      <CloseBtn setClose={setRecipeModal} />

      <Link to="/admin/admin">
        <Title mainTitle="Faça sua receita" />
      </Link>
      {isEmptyObject(customizedPriceObj) ? (
        <div>
          <div className={style.ingridients}>
            <select
              id="name"
              value={productList?.findIndex(
                (product) => product.product === ingridients.name
              )}
              className={style.selectInput}
              onChange={handleChange}
            >
              <option value="">Selecione um produto</option>
              {productList &&
                productList.length > 0 &&
                productList.map((item, index) => (
                  <option key={index} value={index}>
                    {`${item.product}-${item.unitOfMeasurement}`}
                  </option>
                ))}
            </select>
            <input
              id="amount"
              fieldFocus={fieldFocus}
              placeholder="Quantidade"
              className={style.numberInput}
              value={ingridients.amount}
              type="text"
              onChange={handleChange}
            />

            <button type="button" onClick={addIngredient}>
              Adicione
            </button>
          </div>
          <div className={style.itemsRecipe}>
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor cheio</th>
                  <th>Valor da porção</th>
                  <th>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {ingredientsSimple &&
                  ingredientsSimple.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        alertMinimunAmount(
                          item.product,
                          item.totalVolume,
                          item.minimumAmount,
                          item.totalCost
                        )
                          ? ''
                          : 'warning'
                      }
                    >
                      <td className="items">{item.name}</td>
                      <td className="items">
                        {item.amount}
                        {item.unitOfMeasurement}
                      </td>
                      <td className="items">
                        R${' '}
                        {item.costPerUnit
                          ? item.costPerUnit.toFixed(2)
                          : '0.00'}
                      </td>
                      <td className="items">
                        R${' '}
                        {item.portionCost
                          ? item.portionCost.toFixed(2)
                          : '0.00'}
                      </td>
                      <td
                        className="items"
                        style={{ cursor: 'pointer' }}
                        onClick={() => removeItem(index)}
                      >
                        x
                      </td>
                    </tr>
                  ))}
              </tbody>
              <h2>Custo do produto {calculateItemCost(ingredientsSimple)}</h2>
            </table>
          </div>
        </div>
      ) : (
        extractLabelSizes() &&
        extractLabelSizes().length > 0 &&
        extractLabelSizes().map((label) => (
          <div className={style.recipeDisContainer}>
            <div className={style.ingridients}>
              {label}
              <select
                id="name"
                value={productList?.findIndex(
                  (product) => product.product === ingridients.name
                )}
                className={style.selectInput}
                onChange={handleChange}
              >
                <option value="">Selecione um produto</option>
                {productList &&
                  productList.length > 0 &&
                  productList.map((item, index) => (
                    <option key={index} value={index}>
                      {`${item.product}-${item.unitOfMeasurement}`}
                    </option>
                  ))}
              </select>
              <input
                id="amount"
                fieldFocus={fieldFocus}
                placeholder="Quantidade"
                className={style.numberInput}
                value={ingridients.amount}
                type="text"
                onChange={handleChange}
              />

              <button type="button" onClick={() => addIngredient(label)}>
                Adicione
              </button>
            </div>
            <div className={style.itemsRecipe}>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Valor cheio</th>
                    <th>Valor da porção</th>
                    <th>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientsBySize &&
                    ingredientsBySize[label]?.map((item, index) => (
                      <tr key={index}>
                        <td className="items">{item.name}</td>
                        <td className="items">
                          {item.amount}
                          {item.unitOfMeasurement}
                        </td>
                        <td className="items">
                          R${' '}
                          {item.costPerUnit
                            ? item.costPerUnit.toFixed(2)
                            : '0.00'}
                        </td>
                        <td className="items">
                          R${' '}
                          {item.portionCost
                            ? item.portionCost.toFixed(2)
                            : '0.00'}
                        </td>
                        <td
                          className="items"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeItem(label, index)}
                        >
                          x
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <h2>
                Custo do produto ({label}): R${' '}
                {calculateItemCost(ingredientsBySize, label)}
              </h2>
            </div>
          </div>
        ))
      )}
      <div className={style.textAreaContainer}>
        <label>Escreva sua receita</label>
        <textarea
          id="gift"
          className={style.textArea}
          value={recipeExplanation}
          onChange={({ target }) => setRecipeExplanation(target.value)}
        >
          Saudação
        </textarea>
      </div>
      <div className={style.formButtonSubmit}>
        <button onClick={sendRecipe}>Enviar Receita</button>
      </div>
    </div>
  );
};
export default RecipeDish;
