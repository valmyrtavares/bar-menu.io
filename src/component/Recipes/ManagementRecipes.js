import React from 'react';
import style from '../../assets/styles/ManagementRecipes.module.scss';
import { getBtnData } from '../../api/Api';
import WarningMessage from '../WarningMessages';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../config-firebase/firebase';

const ManagementRecipes = () => {
  const [dishes, setDishes] = React.useState(null);
  const [stock, setStock] = React.useState([]);
  const [productSelected, setProductSelected] = React.useState('');
  const [displayedRecipesToDelete, setDisplayedRecipesToDelete] =
    React.useState([]);
  const [selectedRecipesToDelete, setSelectedRecipesToDelete] = React.useState(
    []
  );
  const [displayedRecipesToEdit, setDisplayedRecipesToEdit] = React.useState(
    []
  );
  const [selectedRecipesToEdit, setSelectedRecipesToEdit] = React.useState([]);
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
    setDisplayedRecipesToDelete([]);
    setDisplayedRecipesToEdit([]);
    const { id, value } = e.target;

    const productSelected = value;
    setProductSelected(value);
    for (const item of dishes) {
      if (item && item.recipe && item.recipe.FinalingridientsList) {
        // Verifica se o item e item.recipe são válidos
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
            if (id === 'productStockToDelete') {
              setDisplayedRecipesToDelete((prevRecipes) => [
                ...prevRecipes,
                recipeFilled,
              ]);
            } else if (id === 'productStockToEdit') {
              setDisplayedRecipesToEdit((prevRecipes) => [
                ...prevRecipes,
                recipeFilled,
              ]);
            }
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
                if (id === 'productStockToDelete') {
                  setDisplayedRecipesToDelete((prevRecipes) => [
                    ...prevRecipes,
                    recipeFilled,
                  ]);
                } else if (id === 'productStockToEdit') {
                  setDisplayedRecipesToEdit((prevRecipes) => [
                    ...prevRecipes,
                    recipeFilled,
                  ]);
                }
                break; //Sai do loop corrente Para evitar múltiplas adições para o mesmo item
              }
            }
          }
        }
      }
    }
  };

  const handleCheckboxChange = (recipeId) => {
    setSelectedRecipesToDelete(
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
      for (const recipeId of selectedRecipesToDelete) {
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
      <h3>Use esse modulo para excluir ingredientes dos pratos selecionados</h3>
      <div className={style.deleteContainer}>
        <div className={style.leftSide}>
          <select
            id="productStockToDelete"
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
          <button
            onClick={() => DeleteIngredient(false)}
            disabled={selectedRecipesToDelete.length === 0}
          >
            Excluir ingredientes
          </button>
        </div>
        <ul>
          {displayedRecipesToDelete &&
            displayedRecipesToDelete.length > 0 &&
            displayedRecipesToDelete.map((item, index) => (
              <li key={index}>
                {' '}
                <input
                  type="checkbox"
                  checked={selectedRecipesToDelete.includes(item.id)} // Verifica se está selecionado
                  onChange={() => handleCheckboxChange(item.id)} // Atualiza seleção
                />
                {item.name}
              </li>
            ))}
        </ul>
      </div>

      {/* EDIT MODULE */}
      <h3>
        Use esse módulo para substituir ingredientes dos pratos selecionados
      </h3>
      <div className={style.replaceModuleContainer}>
        <div className={style.leftSide}>
          <select
            id="productStockToEdit"
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
          <button
            onClick={() => DeleteIngredient(false)}
            disabled={selectedRecipesToDelete.length === 0}
          >
            Substituir ingredientes
          </button>
        </div>
        <ul>
          {displayedRecipesToEdit &&
            displayedRecipesToEdit.length > 0 &&
            displayedRecipesToEdit.map((item, index) => (
              <li key={index}>
                {' '}
                <input
                  type="checkbox"
                  checked={selectedRecipesToDelete.includes(item.id)} // Verifica se está selecionado
                  onChange={() => handleCheckboxChange(item.id)} // Atualiza seleção
                />
                {item.name}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
export default ManagementRecipes;
