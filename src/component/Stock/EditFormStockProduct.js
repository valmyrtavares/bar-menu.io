import React from 'react';
import edit from '../../assets/styles/EditFormStockProduct.module.scss';
import CloseBtn from '../closeBtn';
import Input from '../Input';
import { getBtnData } from '../../api/Api';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../config-firebase/firebase';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers';

const EditFormStockProduct = ({ obj, setShowEditForm, fetchStock }) => {
  const [Dishes, setDishes] = React.useState([]);
  const [stockProductObj, setStockProductObj] = React.useState({
    CostPerUnit: Number(obj.CostPerUnit),
    amount: Number(obj.amount),
    product: obj.product,
    totalCost: Number(obj.totalCost),
    totalVolume: Number(obj.totalVolume),
    unitOfMeasurement: obj.unitOfMeasurement,
    volumePerUnit: Number(obj.volumePerUnit),
    minimumAmount: Number(obj.minimumAmount),
    noteReasonsEditingProduct: '',
    disabledDish: obj.disabledDish || null,
    id: obj.id,
  });
  const [noteReasonsEditingProduct, setNoteReasonsEditingProduct] =
    React.useState('');
  const [loadingAvailableMenuDishes, setLoadingAvailableMenuDishes] =
    React.useState(false);

  const db = getFirestore(app);

  React.useEffect(() => {
    getBtnData('item')
      .then((data) => {
        setDishes(data);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
      });
  });

  const updateNoteEdit = () => {
    setStockProductObj((prevForm) => ({
      ...prevForm,
      noteReasonsEditingProduct: noteReasonsEditingProduct,
    }));
  };

  const handleStock = async (
    itemsStock,
    account = 'Editado',
    paymentDate = null
  ) => {
    if (!Array.isArray(itemsStock)) {
      itemsStock = [itemsStock]; // Coloca o objeto recebido em um array
    }

    if (!paymentDate) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é zero-based
      const year = today.getFullYear();
      paymentDate = `${day}/${month}/${year}`; //Cria a data no formato DD/MM/YYYY atual
    }

    const data = await getBtnData('stock'); // Obtém todos os registros existentes no estoque

    for (let i = 0; i < itemsStock.length; i++) {
      const currentItem = itemsStock[i];

      // Verifica se o item já existe no banco de dados
      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );
      if (itemFinded) {
        // Atualiza os valores de custo e volume totais
        const previousCost = itemFinded.totalCost;
        const previousVolume = itemFinded.totalVolume;
        const cost = account === 'Editado' ? 0 : currentItem.totalCost;
        const noteReasonsEditingProduct =
          account === 'Editado' ? currentItem.noteReasonsEditingProduct : '';
        const pack =
          account === 'Editado'
            ? Number(currentItem.amount)
            : Number(itemFinded.amount) + Number(currentItem.amount);
        const volume = account === 'Editado' ? 0 : currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;
        if (account !== 'Editado') {
          currentItem.totalCost =
            (currentItem.totalCost || 0) + (itemFinded.totalCost || 0);
          currentItem.totalVolume =
            (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
        }

        // Inicializa ou adiciona ao UsageHistory
        currentItem.UsageHistory = itemFinded.UsageHistory || [];

        currentItem.UsageHistory.push(
          stockHistoryList(
            itemFinded,
            account,
            paymentDate,
            noteReasonsEditingProduct,
            pack,
            cost,
            unit,
            volume,
            previousVolume,
            previousCost,
            currentItem.totalCost,
            currentItem.totalVolume
          )
        );
        console.log('Item atual  ', currentItem);

        // Atualiza o registro no banco de dados
        // const docRef = doc(db, 'stock', itemFinded.id);
        // await updateDoc(docRef, currentItem);
      } else {
        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
            0,
            currentItem.totalCost,
            currentItem.totalVolume
          ),
        ];
        // await addDoc(collection(db, 'stock'), currentItem);
      }
    }
  };

  const stockHistoryList = (
    item,
    account,
    paymentDate,
    noteReasonsEditingProduct,
    pack,
    cost,
    unit,
    volume,
    previousVolume,
    previousCost,
    totalCost,
    totalVolume
  ) => {
    const stockEventRegistration = {
      date: paymentDate,
      outputProduct: 0,
      category: account || 0,
      unit: unit,
      noteReasonsEditingProduct: noteReasonsEditingProduct,
      package: pack,
      inputProduct: volume,
      cost: cost,
      previousVolume: previousVolume,
      previousCost: previousCost,
      ContentsInStock: totalVolume,
      totalResourceInvested: totalCost,
    };
    return stockEventRegistration;
  };

  const updateCost = (e) => {
    const { id, value } = e.target;

    if (id === 'totalVolume' || id === 'totalCost') {
      let totalCost = obj.totalCost;
      let totalVolume = obj.totalVolume;
      let newCostPerUnit = 0;
      if (id === 'totalCost') {
        totalCost = Number(value);
        setStockProductObj({
          ...stockProductObj,
          totalCost: totalCost,
        });
      }
      if (id === 'totalVolume') {
        totalVolume = Number(value);
        setStockProductObj({
          ...stockProductObj,
          totalVolume: totalVolume,
        });
      }

      let newUnit = 0;
      //  const newVolume = Number(value);
      // const newCost = totalCost * (newVolume / obj.totalVolume);

      if (stockProductObj.totalCost > 0 && stockProductObj.totalVolume > 0) {
        newUnit =
          Number(stockProductObj.totalVolume) / Number(obj.volumePerUnit);
        newCostPerUnit =
          Number(stockProductObj.totalCost) /
          Number(stockProductObj.totalVolume);
        setStockProductObj({
          ...stockProductObj,
          amount: Number(newUnit).toFixed(2),
          CostPerUnit: Number(newCostPerUnit.toFixed(2)),
        });
      }
    }
    //  else {
    //   const newCost = Number(value);
    //   const currentVolume = Number(stockProductObj.totalVolume);
    //   const newCostPerUnit = currentVolume !== 0 ? newCost / currentVolume : 0;

    //   setStockProductObj({
    //     ...stockProductObj,
    //     totalCost: newCost,
    //     costPerUnit: Number(newCostPerUnit.toFixed(4)),
    //   });
    // }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    // const parsedValue = Number(value);
    setStockProductObj((prevForm) => ({
      ...prevForm,
      [id]: isNaN(value) ? 0 : value, // Fallback para valores inválidos
    }));
  };

  const addItem = async () => {
    if (
      noteReasonsEditingProduct === '' ||
      stockProductObj.totalVolume <= 0 ||
      stockProductObj.totalCost <= 0 ||
      stockProductObj.minimumAmount <= 0 ||
      stockProductObj.disabledDish <= 0
    ) {
      alert('Todos os campos de edição são obrigatórios.');
      return;
    }

    const updatedDishes = updateRecipesinDishesAndSideDishes(stockProductObj);
    console.log('Pratos que foram alterados:', updatedDishes);

    try {
      // Atualiza cada prato no Firebase em paralelo
      await Promise.all(updatedDishes.map(updateDishInFirebase));

      console.log('Receitas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar receitas:', error);
    }

    try {
      await handleStock(stockProductObj);
      const docRef = doc(db, 'stock', stockProductObj.id);
      await updateDoc(docRef, stockProductObj); // Atualiza com os dados do estado "form"
      // const disabledDish = Number(stockProductObj.disabledDish);
      // const totalVolume = Number(stockProductObj.totalVolume);

      setLoadingAvailableMenuDishes(true);
      const res = await checkUnavaiableRawMaterial(stockProductObj.id);
      setLoadingAvailableMenuDishes(res);

      updateRecipesinDishesAndSideDishes(stockProductObj);
      fetchStock();
      setShowEditForm(false);
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
    }
  };

  const updateRecipesinDishesAndSideDishes = (stockProduct) => {
    const updatedDishes = [];
    if (Dishes && Dishes.length > 0) {
      console.log('DISHES   ', Dishes);
      try {
        Dishes.forEach((dish) => {
          // CENÁRIO 1 - Produto com apenas 1 preço

          if (
            !dish.CustomizedPrice || // não existe
            (typeof dish.CustomizedPrice === 'object' &&
              (!dish.CustomizedPrice.firstLabel || // não tem firstLabel
                dish.CustomizedPrice.firstLabel.trim() === ''))
          ) {
            if (
              Array.isArray(dish.recipe?.FinalingridientsList) &&
              dish.recipe.FinalingridientsList.length > 0
            ) {
              const recipeCurrent = dish.recipe.FinalingridientsList;
              const currentIngredient = recipeCurrent.find(
                (item) =>
                  item.name.trim().toLowerCase() ===
                  stockProduct.product.trim().toLowerCase()
              );
              if (!currentIngredient) return;

              // Atualiza ingrediente
              const newCostPerUnit =
                stockProduct.totalCost / stockProduct.totalVolume;
              const newPortionCost = currentIngredient.amount * newCostPerUnit;
              //update costs if changed
              if (
                currentIngredient.costPerUnit !== newCostPerUnit ||
                currentIngredient.portionCost !== newPortionCost
              ) {
                currentIngredient.costPerUnit = newCostPerUnit;
                currentIngredient.portionCost = newPortionCost;

                const totalPortionCost = recipeCurrent.reduce(
                  (sum, item) => sum + (item.portionCost || 0),
                  0
                );
                dish.costPriceObj.cost = totalPortionCost;

                updatedDishes.push(dish); //
              }
            }
          }

          // CENÁRIO 2 - Produto com 3 preços (primeiro label não é vazio)\
          else if (
            dish.CustomizedPrice && // existe
            typeof dish.CustomizedPrice === 'object' &&
            dish.CustomizedPrice.firstLabel && // não é vazio
            dish.CustomizedPrice.firstLabel.trim() !== ''
          ) {
            const labels = ['firstLabel', 'secondLabel', 'thirdLabel'];
            const costs = ['firstCost', 'secondCost', 'thirdCost'];

            let wasUpdated = false; // 👈 flag

            labels.forEach((label, index) => {
              const recipeList =
                dish.recipe?.FinalingridientsList?.[
                  dish.CustomizedPrice[label]
                ];

              if (Array.isArray(recipeList) && recipeList.length > 0) {
                const currentIngredient = recipeList.find(
                  (item) =>
                    item.name.trim().toLowerCase() ===
                    stockProduct.product.trim().toLowerCase()
                );
                if (!currentIngredient) return;

                const newCostPerUnit =
                  stockProduct.totalCost / stockProduct.totalVolume;
                const newPortionCost =
                  currentIngredient.amount * newCostPerUnit;

                // Atualiza ingrediente
                // currentIngredient.costPerUnit =
                //   stockProduct.totalCost / stockProduct.totalVolume;
                // currentIngredient.portionCost =
                //   currentIngredient.amount * currentIngredient.costPerUnit;
                if (
                  currentIngredient.costPerUnit !== newCostPerUnit ||
                  currentIngredient.portionCost !== newPortionCost
                ) {
                  currentIngredient.costPerUnit = newCostPerUnit;
                  currentIngredient.portionCost = newPortionCost;
                  // Recalcula custo total da receita
                  const totalPortionCost = recipeList.reduce((sum, item) => {
                    return sum + (item.portionCost || 0);
                  }, 0);
                  // Atualiza custos no CustomizedPrice
                  dish.CustomizedPrice[costs[index]] = totalPortionCost;

                  // Garante que dish.costPriceObj.cost recebe o mesmo do firstCost
                  if (index === 0) {
                    dish.costPriceObj.cost = totalPortionCost;
                  }
                  wasUpdated = true;
                }
              }
            });
            if (wasUpdated) {
              updatedDishes.push(dish);
            }
          }
        });
        return updatedDishes;
      } catch (error) {
        console.error('Erro dentro do forEach:', error);
      }
    }
  };

  //Update costs which were changed in the stock edit form
  const updateDishInFirebase = async (dish) => {
    const docRef = doc(db, 'item', dish.id); // 👈 coleção dos pratos
    await updateDoc(docRef, {
      recipe: dish.recipe,
      costPriceObj: dish.costPriceObj,
      CustomizedPrice: dish.CustomizedPrice,
    });
  };

  return (
    <div className={edit.popupOverlay}>
      <div className={edit.containerEditStock}>
        <div className={edit.closeBtnRow}>
          <button
            className={edit.closeBtn}
            type="button"
            onClick={() => setShowEditForm(false)}
          >
            X
          </button>
        </div>
        {loadingAvailableMenuDishes && <UpdateMenuMessage />}

        <div className={edit.titleRow}>
          <h2>{`${stockProductObj.product} - ${stockProductObj.unitOfMeasurement}`}</h2>
        </div>

        <div className={edit.inputGrid}>
          <div className={edit.fieldWrapper}>
            <Input
              id="totalVolume"
              autoComplete="off"
              className="num"
              label="Volume Total"
              value={stockProductObj.totalVolume}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>

          <div className={edit.fieldWrapper}>
            <Input
              id="totalCost"
              autoComplete="off"
              className="num"
              label="Custo Total"
              value={stockProductObj.totalCost}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>

          <div className={edit.fieldWrapper}>
            <Input
              id="minimumAmount"
              autoComplete="off"
              className="num"
              label="Volume Mínimo"
              value={stockProductObj.minimumAmount}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>
          <div className={edit.fieldWrapper}>
            <Input
              id="disabledDish"
              autoComplete="off"
              className="num"
              label="Indisponível a partir"
              value={stockProductObj.disabledDish}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>
        </div>
        <div className={edit.textareaField}>
          <label htmlFor="minimumAmountNote">Nota sobre a edição</label>
          <textarea
            id="editAdminNote"
            className="num"
            value={noteReasonsEditingProduct || ''}
            onChange={(e) => setNoteReasonsEditingProduct(e.target.value)}
            autoComplete="off"
            rows={3}
            placeholder="Adicione uma observação sobre os motivos da sua edição"
            onBlur={updateNoteEdit}
          />
        </div>

        <div className={edit.volumeRow}>
          <h3>Volume Total do Produto</h3>
          <p>
            {stockProductObj.totalVolume}
            {stockProductObj.unitOfMeasurement}
          </p>
        </div>

        <div className={edit.btnRow}>
          <button className={edit.addBtn} type="button" onClick={addItem}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditFormStockProduct;
