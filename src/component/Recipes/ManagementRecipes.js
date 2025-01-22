import React from 'react';
import style from '../../assets/styles/ManagementReacipes.module.scss';
import { getBtnData } from '../../api/Api';
import WarningMessage from '../WarningMessages';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../config-firebase/firebase';

const ManagementRecipes = () => {
  const [dishes, setDishes] = React.useState(null);
  const [stock, setStock] = React.useState([]);
  const [productSelected, setProductSelected] = React.useState('');
  const [displayedRecipes, setDisplayedRecipes] = React.useState([]);
  const [selectedRecipes, setSelectedRecipes] = React.useState([]);
  const [showWarningMessage, setShowWarningMessage] = React.useState(false);

  const db = getFirestore(app);

  React.useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [stock, dishes] = await Promise.all([
          getBtnData('stock'),
          getBtnData('item'),
        ]);
        console.log('prato  ', dishes);
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
    setDisplayedRecipes([]);
    const productSelected = e.target.value;
    setProductSelected(e.target.value);
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
            setDisplayedRecipes((prevRecipes) => [
              ...prevRecipes,
              recipeFilled,
            ]);
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
                setDisplayedRecipes((prevRecipes) => [
                  ...prevRecipes,
                  recipeFilled,
                ]);
                break; //Sai do loop corrente Para evitar múltiplas adições para o mesmo item
              }
            }
          }
        }
      }
    }
  };

  const handleCheckboxChange = (recipeId) => {
    setSelectedRecipes(
      (prevSelected) =>
        prevSelected.includes(recipeId)
          ? prevSelected.filter((id) => id !== recipeId) // Remove se já estiver selecionado
          : [...prevSelected, recipeId] // Adiciona se não estiver
    );
  };
  const DeleteIngredient = (permition) => {
    setShowWarningMessage(true);
    if (permition) {
      setShowWarningMessage(false);
      console.log('Vai excluir');
      console.log('Receitas selecionadas:', selectedRecipes);
      debugger;
      for (const recipeId of selectedRecipes) {
        const selectedDish = dishes.filter((item) => item.id === recipeId);
        if (selectedDish && selectedDish.length > 0) {
          let { FinalingridientsList } = selectedDish[0].recipe || {};
          if (Array.isArray(FinalingridientsList)) {
            FinalingridientsList = FinalingridientsList.filter(
              (ingredient) => ingredient.name !== productSelected
            );
          } else if (typeof FinalingridientsList === 'object') {
            // Caso seja um objeto com múltiplos arrays
            Object.keys(FinalingridientsList).forEach((key) => {
              FinalingridientsList[key] = FinalingridientsList[key].filter(
                (ingredient) => ingredient.name !== productSelected
              );
            });
          }
          console.log('Prato selecionado   ', FinalingridientsList);
          const dishDocRef = doc(db, 'item', recipeId); // Referência ao documento no Firestore
          updateDoc(dishDocRef, {
            'recipe.FinalingridientsList': FinalingridientsList,
          }).then(() => {
            console.log(`Ingrediente removido com sucesso de ${recipeId}`);
          });
        }
      }
    } else {
      console.log('Não vai excluir');
    }
    // Aqui você pode fazer algo com as receitas selecionadas
  };

  return (
    <div className={style.containerManagementRecipes}>
      <div className={style.containerWarningMessage}>
        {showWarningMessage && (
          <WarningMessage
            message={`Você está prestes a excluir o ingrediente ${productSelected} das receitas selecionadas `}
            setWarningMsg={setShowWarningMessage}
            sendRequestToKitchen={() => DeleteIngredient(true)}
          />
        )}
      </div>
      <h1>Gerenciamento de Receitas</h1>
      <div className={style.mainContainer}>
        <select
          id="productStock"
          value={productSelected}
          className="select-input"
          onChange={handleChange}
        >
          <option value="">Selecione um ingrediente</option>
          {stock?.length > 0 &&
            stock.map((item, index) => (
              <option key={index} value={item.product}>
                {item.product}
              </option>
            ))}
        </select>
        <ul>
          {displayedRecipes &&
            displayedRecipes.length > 0 &&
            displayedRecipes.map((item, index) => (
              <li key={index}>
                {' '}
                <input
                  type="checkbox"
                  checked={selectedRecipes.includes(item.id)} // Verifica se está selecionado
                  onChange={() => handleCheckboxChange(item.id)} // Atualiza seleção
                />
                {item.name}
              </li>
            ))}
        </ul>
        <button
          onClick={() => DeleteIngredient(false)}
          disabled={selectedRecipes.length === 0}
        >
          Excluir ingredientes selecionados das receitas
        </button>
      </div>
    </div>
  );
};
export default ManagementRecipes;
