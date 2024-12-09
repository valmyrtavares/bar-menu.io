import React from 'react';
import '../assets/styles/recipeDish.css';
import Input from '../component/Input';
import CloseBtn from '../component/closeBtn';
import { getBtnData } from '../api/Api';

const RecipeDish = ({ setRecipeModal, setRecipe, recipe }) => {
  const [ingridients, setIngridients] = React.useState({
    name: '',
    amount: '',
    unitOfMeasurement: '',
  });
  const [IngridientsGroup, setIngridientsGroup] = React.useState([]);
  const [recipeExplanation, setRecipeExplanation] = React.useState('');
  const [productList, setProductList] = React.useState(null);
  const fieldFocus = React.useRef();
  React.useEffect(() => {
    if (recipe) {
      if (!recipe.Explanation && !recipe.FinalingridientsList) {
        recipe.Explanation = '';
        recipe.FinalingridientsList = [];
      }
      setIngridientsGroup(recipe.FinalingridientsList);
      setRecipeExplanation(recipe.Explanation);
    }
  }, [recipe]);

  React.useEffect(() => {
    const fetchProduct = async () => {
      const data = await getBtnData('product');
      console.log('Todos os produtos de estoque   ', data);
      setProductList(data);
    };
    fetchProduct();
    setIngridientsGroup([]);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      const selectedProduct = productList[value];

      setIngridients((prevForm) => ({
        ...prevForm,
        name: selectedProduct ? selectedProduct.name : '', // Define o nome do produto
        unitOfMeasurement: selectedProduct
          ? selectedProduct.unitOfMeasurement
          : '', // Define a unidade de medida
      }));
    } else {
      setIngridients({
        ...ingridients,
        [id]: value,
      });
    }
  };

  const addIngredient = () => {
    console.log('ingredientes    ', ingridients);
    setIngridientsGroup([...IngridientsGroup, ingridients]);
    setIngridients({ name: '', amount: '' });
    // fieldFocus.current.focus();
  };

  const sendRecipe = () => {
    setRecipe({
      FinalingridientsList: IngridientsGroup,
      Explanation: recipeExplanation,
    });
    setRecipeModal(true);
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
        <select
          id="name"
          value={productList?.findIndex(
            (product) => product.name === ingridients.name
          )}
          className="select-input"
          onChange={handleChange}
        >
          <option value="">Selecione um produto</option>
          {productList &&
            productList.length > 0 &&
            productList.map((item, index) => (
              <option key={index} value={index}>
                {item.name}
              </option>
            ))}
        </select>
        <input
          id="amount"
          fieldFocus={fieldFocus}
          placeholder="Quantidade"
          className="number-input"
          value={ingridients.amount}
          type="text"
          onChange={handleChange}
        />

        <button type="button" onClick={addIngredient}>
          Adicione
        </button>
      </div>
      <div className="items-recipe">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {IngridientsGroup &&
              IngridientsGroup.map((item, index) => (
                <tr key={index}>
                  <td className="items">{item.name}</td>
                  <td className="items">
                    {item.amount}
                    {item.unitOfMeasurement}
                  </td>
                  <td
                    className="items"
                    style={{ cursor: 'pointer' }}
                    onClick={() => remveIten(index)}
                  >
                    x
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
      </div>
      <div className="btn-container">
        <button onClick={sendRecipe}>Enviar Receita</button>
      </div>
    </div>
  );
};
export default RecipeDish;
