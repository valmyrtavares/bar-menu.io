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
  recipe, //object wiht contains raw material each size product and explanation
  customizedPriceObj,
  costByRecipe, //object which contains the cost and label for single size
  costProfitMarginCustomized, //object which contains the cost and label for each size
  onSingleCostUpdate,
  onCustomCostUpdate
}) => {
  const [ingridients, setIngridients] = React.useState({
    name: '',
    amount: '',
    unitOfMeasurement: '',
  });
  const [IngridientsGroup, setIngridientsGroup] = React.useState([]);
  const [recipeExplanation, setRecipeExplanation] = React.useState(null);
  const [productList, setProductList] = React.useState(null);
  const [ingredientsSimple, setIngredientsSimple] = React.useState([]);
  const [ingredientsBySize, setIngredientsBySize] = React.useState({});
  const fieldFocus = React.useRef();

  React.useEffect(() => {
    //#1
    if (recipe) {
      if (!recipe.Explanation && !recipe.FinalingridientsList) {
        recipe.Explanation = 'Receita Vazia';
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
    reloadCurrentRecipesValue();
  }, [productList]);

  React.useEffect(() => {
    //#2

    const fetchProduct = async () => {
      const data = await getBtnData('stock');
      const sortedData = data
        .sort((a, b) => a.product.localeCompare(b.product))
        .filter(
          (item) =>
            item.operationSupplies === false &&
            (item.activityStatus === undefined || item.activityStatus === false)
        );
      setProductList(sortedData);
    };
    fetchProduct();
    reloadCurrentRecipesValue();
    setIngridientsGroup([]);
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

  const grabSpecificItemInStock = (name) => {
    if (productList && productList.length > 0 && name) {
      const item = productList.find((item) => item.product === name);
      if (item) {
        const { product, totalVolume, minimumAmount, totalCost } = item;
        const warningAmountRawMaterial =
          totalVolume > minimumAmount ? true : false;
        const unavailableRawMaterial = totalVolume === 0 ? true : false;
        return {
          product,
          totalVolume,
          minimumAmount,
          totalCost,
          warningAmountRawMaterial,
          unavailableRawMaterial,
        };
      }
    }
    return null;
  };
  const calculateItemCost = (ingredients, label) => {
    if (label) {
      const items = ingredients[label];

      if (!Array.isArray(items)) return 0;

      const total = items.reduce((sum, item) => {
        const value = parseFloat(item.portionCost) || 0;
        return sum + value;
      }, 0);

      const LabelSize = ['firstPrice', 'secondPrice', 'thirdPrice'];
      LabelSize.forEach((item) => {
        if (costProfitMarginCustomized[item].label === label) {
          costProfitMarginCustomized[item].cost = Number(total.toFixed(2));
        }
      });
      costByRecipe.cost = costProfitMarginCustomized['firstPrice'].cost;
      return Number(total.toFixed(2));
    }

    // Fallback caso ingredients seja um array diretamente
    if (!Array.isArray(ingredients)) return 0;

    const total = ingredients.reduce((sum, item) => {
      const value = parseFloat(item.portionCost) || 0;
      return sum + value;
    }, 0);
    costByRecipe.cost = Number(total.toFixed(2));

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
      const disabledDish = Number(selectedProduct.disabledDish);
      const idProduct = selectedProduct.idProduct;
      const costPerUnit =
        selectedProduct && selectedProduct.totalVolume > 0
          ? selectedProduct.totalCost / selectedProduct.totalVolume
          : 0;

      const warningAmountRawMaterial =
        selectedProduct.totalVolume > selectedProduct.minimumAmount
          ? true
          : false;
      const unavailableRawMaterial =
        selectedProduct.totalVolume <= disabledDish ? true : false;

      setIngridients((prevForm) => ({
        ...prevForm,
        name: selectedProduct ? selectedProduct.product : '',
        idProduct: idProduct,
        unitOfMeasurement: selectedProduct
          ? selectedProduct.unitOfMeasurement
          : '',
        costPerUnit: costPerUnit,
        warningAmountRawMaterial: warningAmountRawMaterial,
        unavailableRawMaterial: unavailableRawMaterial,
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

  const reloadCurrentRecipesValue = () => {
    if (!productList || productList.length === 0) return;

    const getUpdatedCostData = (ingredient) => {
      const matchedProduct = productList.find(
        (product) => product.product.trim() === ingredient.name.trim()
      );

      if (!matchedProduct || matchedProduct.totalVolume === 0)
        return {
          costPerUnit: 0,
          portionCost: 0,
        };

      const costPerUnit = matchedProduct.totalCost / matchedProduct.totalVolume;
      const portionCost = parseFloat(ingredient.amount) * costPerUnit;
      //QUERO VOLTAR AQUIasdfasdfasdf
      const warningAmountRawMaterial =
        matchedProduct.totalVolume > matchedProduct.minimumAmount
          ? true
          : false;
      const unavailableRawMaterial =
        matchedProduct.totalVolume === 0 ? true : false;

      return {
        costPerUnit,
        portionCost,
        warningAmountRawMaterial,
        unavailableRawMaterial,
      };
    };

    // CASO 1: Receita simples (sem variação de tamanho)
    if (isEmptyObject(customizedPriceObj)) {
      const updatedIngredients = ingredientsSimple.map((ingredient) => {
        const {
          costPerUnit,
          portionCost,
          warningAmountRawMaterial,
          unavailableRawMaterial,
        } = getUpdatedCostData(ingredient);

        return {
          ...ingredient,
          costPerUnit,
          portionCost,
          warningAmountRawMaterial,
          unavailableRawMaterial,
        };
      });

      setIngredientsSimple(updatedIngredients);
      console.log('Receita simples atualizada:', updatedIngredients);
    }

    // CASO 2: Receita com variação de tamanho (customizedPriceObj presente)
    else {
      const updatedBySize = {};

      Object.entries(ingredientsBySize).forEach(
        ([sizeLabel, ingredientList]) => {
          updatedBySize[sizeLabel] = ingredientList.map((ingredient) => {
            const {
              costPerUnit,
              portionCost,
              warningAmountRawMaterial,
              unavailableRawMaterial,
            } = getUpdatedCostData(ingredient);

            return {
              ...ingredient,
              costPerUnit,
              portionCost,
              warningAmountRawMaterial,
              unavailableRawMaterial,
            };
          });
        }
      );

      setIngredientsBySize(updatedBySize);
      console.log('Receitas por tamanho atualizadas:', updatedBySize);
    }
  };

  const sendRecipe = () => {
    // Lógica original de setRecipe
    if (!isEmptyObject(customizedPriceObj)) {
      setRecipe({
        FinalingridientsList: ingredientsBySize,
        Explanation: recipeExplanation,
      });
      // NOVO: Calcular e enviar custos customizados
      const costsUpdate = {};
      const LabelSize = ['firstPrice', 'secondPrice', 'thirdPrice'];

      LabelSize.forEach((priceKey) => {
        // Encontra o label correspondente a essa chave (ex: firstPrice -> "Pequeno")
        // Como o costProfitMarginCustomized pode vir null na primeira vez, usamos o customizedPriceObj
        // Mas a lógica confiável está no ingredientsBySize que usa os LABELS como chave.

        // Vamos pegar o label correto do objeto original de preço
        let label = '';
        if (priceKey === 'firstPrice') label = customizedPriceObj.firstLabel;
        if (priceKey === 'secondPrice') label = customizedPriceObj.secondLabel;
        if (priceKey === 'thirdPrice') label = customizedPriceObj.thirdLabel;
        if (label) {
          const cost = calculateItemCost(ingredientsBySize, label);
          costsUpdate[priceKey] = { cost };
        }
      });

      if (onCustomCostUpdate) onCustomCostUpdate(costsUpdate);
    } else {
      setRecipe({
        FinalingridientsList: ingredientsSimple,
        Explanation: recipeExplanation,
      });
      // NOVO: Calcular e enviar custo único
      const totalCost = calculateItemCost(ingredientsSimple);
      if (onSingleCostUpdate) onSingleCostUpdate(totalCost);
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
    <div className={style.recipeDishContainer}>
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
                  ingredientsSimple.map((item, index) => {
                    const itemData = grabSpecificItemInStock(item.name);

                    return (
                      <tr
                        key={index}
                        className={
                          itemData
                            ? alertMinimunAmount(
                              itemData.product,
                              itemData.totalVolume,
                              itemData.minimumAmount,
                              itemData.totalCost
                            ).message
                              ? 'warning'
                              : ''
                            : ''
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
                    );
                  })}
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
                    ingredientsBySize[label]?.map((item, index) => {
                      const itemData = grabSpecificItemInStock(item.name);

                      return (
                        <tr
                          key={index}
                          className={
                            itemData
                              ? alertMinimunAmount(
                                itemData.product,
                                itemData.totalVolume,
                                itemData.minimumAmount,
                                itemData.totalCost
                              ).message
                                ? 'warning'
                                : ''
                              : ''
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
                            onClick={() => removeItem(label, index)}
                          >
                            x
                          </td>
                        </tr>
                      );
                    })}
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
          required
          className={style.textArea}
          value={recipeExplanation}
          onChange={(e) => setRecipeExplanation(e.target.value)}
        />
      </div>
      <div className={style.formButtonSubmit}>
        <button onClick={sendRecipe}>Enviar Receita</button>
      </div>
    </div>
  );
};
export default RecipeDish;
