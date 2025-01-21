import React from 'react';
import style from '../../assets/styles/ManagementReacipes.module.scss';
import { getBtnData } from '../../api/Api';

const ManagementRecipes = () => {
  const [dishes, setDishes] = React.useState(null);
  const [stock, setStock] = React.useState([]);
  const [productSelected, setProductSelected] = React.useState('');

  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [stock, dishes] = await Promise.all([
          getBtnData('stock'),
          getBtnData('item'),
        ]);

        const sortedProductStock = stock.sort((a, b) =>
          a.product.localeCompare(b.product)
        );
        setStock(sortedProductStock);
        setDishes(dishes);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchCollections();
  }, []);

  const handleChange = (e) => {
    const productSelected = e.target.value;
    let RecipeList = [];

    for (const item of dishes) {
      // Verifica se o item e item.recipe são válidos
      if (item && item.recipe && item.recipe.FinalingridientsList) {
        if (Array.isArray(item.recipe.FinalingridientsList)) {
          // Caso FinalingridientsList seja um array
          const recipe = item.recipe.FinalingridientsList.find(
            (ingredient) => ingredient.name === productSelected
          );
          if (recipe !== undefined) {
            const recipeFilled = {
              name: item.title,
              id: item.id,
            };
            RecipeList.push(recipeFilled);
          }
        } else if (typeof item.recipe.FinalingridientsList === 'object') {
          // Caso FinalingridientsList seja um objeto contendo múltiplos arrays
          for (const ingredientArray of Object.values(
            item.recipe.FinalingridientsList
          )) {
            if (Array.isArray(ingredientArray)) {
              const recipe = ingredientArray.find(
                (ingredient) => ingredient.name === productSelected
              );
              if (recipe !== undefined) {
                const recipeFilled = {
                  name: item.title,
                  id: item.id,
                };
                RecipeList.push(recipeFilled);
                break; // Para evitar múltiplas adições para o mesmo item
              }
            }
          }
        }
      }
    }

    console.log('Lista de receitas:', RecipeList);
  };

  return (
    <div className={style.containerManagementRecipes}>
      <h1>Gerenciamento de Receitas</h1>
      <select
        id="productStock"
        value={productSelected}
        className="select-input"
        onChange={handleChange}
      >
        <option value="">Selecione um produto</option>
        {stock?.length > 0 &&
          stock.map((item, index) => (
            <option key={index} value={item.product}>
              {item.product}
            </option>
          ))}
      </select>
      <p>{productSelected}</p>
    </div>
  );
};
export default ManagementRecipes;
