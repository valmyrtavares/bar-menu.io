import React from 'react';
import edit from '../../assets/styles/EditFormStockProduct.module.scss';
import CloseBtn from '../closeBtn';
import Input from '../Input';
import { getBtnData, logStockUsage, registerDailyStockMovement, updateItemsSideDishes } from '../../api/Api';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers';

const EditFormStockProduct = ({ obj, setShowEditForm, fetchStock }) => {
  const [Dishes, setDishes] = React.useState([]);
  const [stockProductObj, setStockProductObj] = React.useState({
    CostPerUnit: Number(Number(obj.CostPerUnit).toFixed(2)),
    amount: Number(Number(obj.amount).toFixed(2)),
    product: obj.product,
    totalCost: Number(Number(obj.totalCost).toFixed(2)),
    totalVolume: Number(Number(obj.totalVolume).toFixed(2)),
    unitOfMeasurement: obj.unitOfMeasurement,
    volumePerUnit: Number(Number(obj.volumePerUnit).toFixed(2)),
    minimumAmount: Number(Number(obj.minimumAmount).toFixed(2)),
    noteReasonsEditingProduct: '',
    disabledDish: obj.disabledDish || null,
    id: obj.id,
  });
  
  const [discardAmount, setDiscardAmount] = React.useState('');
  const [noteReasonsEditingProduct, setNoteReasonsEditingProduct] = React.useState('');
  const [loadingAvailableMenuDishes, setLoadingAvailableMenuDishes] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
    account = 'Descarte',
    paymentDate = null
  ) => {
    if (!Array.isArray(itemsStock)) {
      itemsStock = [itemsStock];
    }

    if (!paymentDate) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      const seconds = String(today.getSeconds()).padStart(2, '0');
      paymentDate = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
    } else {
      if (!paymentDate.includes('-') && !paymentDate.includes(':')) {
        const today = new Date();
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
        paymentDate = `${paymentDate} - ${hours}:${minutes}:${seconds}`;
      }
    }

    const data = await getBtnData('stock');

    for (let i = 0; i < itemsStock.length; i++) {
      const currentItem = itemsStock[i];

      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );
      if (itemFinded) {
        const previousCost = itemFinded.totalCost;
        const previousVolume = itemFinded.totalVolume;
        const cost = account === 'Descarte' || account === 'Editado' ? 0 : currentItem.totalCost;
        const noteReasonsEditingProduct =
          account === 'Descarte' || account === 'Editado' ? currentItem.noteReasonsEditingProduct : '';
        const pack =
          account === 'Descarte' || account === 'Editado'
            ? Number(currentItem.amount)
            : Number(itemFinded.amount) + Number(currentItem.amount);
        const volume = account === 'Descarte' || account === 'Editado' ? 0 : currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;
        
        if (account !== 'Descarte' && account !== 'Editado') {
          currentItem.totalCost =
            (currentItem.totalCost || 0) + (itemFinded.totalCost || 0);
          currentItem.totalVolume =
            (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
        }

        const logEvent = stockHistoryList(
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
        );
        delete currentItem.UsageHistory;
        
        await logStockUsage(itemFinded.id, logEvent);
      } else {
        const logEvent = stockHistoryList(
          currentItem,
          account,
          paymentDate,
          0,
          currentItem.totalCost,
          currentItem.totalVolume
        );
        delete currentItem.UsageHistory;
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
    totalVolume,
    orderNumber = ''
  ) => {
    const stockEventRegistration = {
      date: paymentDate,
      outputProduct: account === 'Descarte' ? Number(Math.max(0, previousVolume - totalVolume).toFixed(2)) : 0,
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
      orderNumber: orderNumber,
    };
    return stockEventRegistration;
  };

  const handleDiscardChange = (e) => {
    const val = e.target.value;
    
    // Permite digitar vírgula ou ponto (apenas UI control)
    if (val !== '' && isNaN(Number(val.replace(',', '.')))) return;
    
    let numVal = Number(val.replace(',', '.'));
    if (numVal < 0) {
      numVal = 0;
    }

    if (numVal > Number(obj.totalVolume)) {
      alert(`Você não pode descartar mais do que o volume total disponível (${Number(obj.totalVolume).toFixed(2)} ${obj.unitOfMeasurement}).`);
      numVal = Number(obj.totalVolume);
    }

    setDiscardAmount(val);

    const originalVol = Number(obj.totalVolume);
    const newVolume = Math.max(0, originalVol - numVal);
    let newCost = 0;

    if (originalVol > 0 && newVolume > 0) {
      let unitPriceOriginal = 0;
      if (Number(obj.totalCost) > 0) {
        unitPriceOriginal = Number(obj.totalCost) / originalVol;
      } else if (Number(obj.lastUnitCost) > 0) {
        unitPriceOriginal = Number(obj.lastUnitCost);
      } else {
        unitPriceOriginal = Number(obj.CostPerUnit || 0);
      }
      newCost = newVolume * unitPriceOriginal;
    }

    if (newVolume <= 0) {
      newCost = 0;
    }

    const newUnit = Number(obj.volumePerUnit) > 0 ? newVolume / Number(obj.volumePerUnit) : 0;
    const newCostPerUnit = newVolume > 0 ? newCost / newVolume : (Number(obj.CostPerUnit) || 0);

    setStockProductObj((prev) => ({
      ...prev,
      totalVolume: Number(newVolume.toFixed(2)),
      totalCost: Number(newCost.toFixed(2)),
      amount: Number(newUnit.toFixed(2)),
      CostPerUnit: Number(newCostPerUnit.toFixed(2)),
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setStockProductObj((prevForm) => ({
      ...prevForm,
      [id]: isNaN(value) ? 0 : value,
    }));
  };

  const addItem = async () => {
    if (
      !noteReasonsEditingProduct || noteReasonsEditingProduct.trim() === '' ||
      stockProductObj.minimumAmount === '' ||
      stockProductObj.disabledDish === '' ||
      Number(stockProductObj.minimumAmount) < 0 ||
      Number(stockProductObj.disabledDish) < 0
    ) {
      alert('Por favor, preencha a justificativa do descarte e certifique-se de que nenhum campo está vazio ou negativo.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const updatedDishes = updateRecipesinDishesAndSideDishes(stockProductObj);

    try {
      await Promise.all(updatedDishes.map(updateDishInFirebase));
      await updateSideDishesInFirebase(stockProductObj);
      await updateItemsSideDishes(); // Sincroniza a disponibilidade com os pratos
    } catch (error) {
      console.error('Erro ao atualizar receitas/acompanhamentos:', error);
    }

    try {
      // 1. Atualizar histórico (Descarte) e salvar o documento principal do estoque
      await handleStock(stockProductObj, 'Descarte');
      const docRef = doc(db, 'stock', stockProductObj.id);
      await updateDoc(docRef, stockProductObj);

      // 2. Registrar despesa na coleção outgoing se houve perda real
      const discardedVolume = Number(discardAmount.replace(',', '.') || 0);
      if (discardedVolume > 0) {
        const discardedCost = Number(obj.totalCost) - Number(stockProductObj.totalCost);
        if (discardedCost > 0) {
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          const currentDate = `${day}/${month}/${year}`;

          await addDoc(collection(db, 'outgoing'), {
            name: `Descarte - ${obj.product}`,
            value: Number(discardedCost.toFixed(2)),
            confirmation: Number(discardedCost.toFixed(2)),
            category: 'Descarte', // Nova categoria para fácil rastreamento
            entryType: 'descarte',
            paymentDate: currentDate,
            dueDate: currentDate,
            formOfPayment: 'N/A',
            obs: noteReasonsEditingProduct,
            stockId: stockProductObj.id
          });
        }
      }

      setLoadingAvailableMenuDishes(true);
      const res = await checkUnavaiableRawMaterial(stockProductObj.id);
      setLoadingAvailableMenuDishes(res);

      updateRecipesinDishesAndSideDishes(stockProductObj);
      await registerDailyStockMovement('Edição de Estoque (Descarte)');
      fetchStock();
      setShowEditForm(false);
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRecipesinDishesAndSideDishes = (stockProduct) => {
    const updatedDishes = [];
    if (Dishes && Dishes.length > 0) {
      try {
        Dishes.forEach((dish) => {
          if (
            !dish.CustomizedPrice ||
            (typeof dish.CustomizedPrice === 'object' &&
              (!dish.CustomizedPrice.firstLabel ||
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

              const newCostPerUnit = stockProduct.totalVolume > 0
                ? stockProduct.totalCost / stockProduct.totalVolume
                : (Number(stockProduct.CostPerUnit) || 0);
              const newPortionCost = currentIngredient.amount * newCostPerUnit;
              
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

                updatedDishes.push(dish);
              }
            }
          }
          else if (
            dish.CustomizedPrice &&
            typeof dish.CustomizedPrice === 'object' &&
            dish.CustomizedPrice.firstLabel &&
            dish.CustomizedPrice.firstLabel.trim() !== ''
          ) {
            const labels = ['firstLabel', 'secondLabel', 'thirdLabel'];
            const costs = ['firstCost', 'secondCost', 'thirdCost'];

            let wasUpdated = false;

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

                const newCostPerUnit = stockProduct.totalVolume > 0
                  ? stockProduct.totalCost / stockProduct.totalVolume
                  : (Number(stockProduct.CostPerUnit) || 0);
                const newPortionCost =
                  currentIngredient.amount * newCostPerUnit;

                if (
                  currentIngredient.costPerUnit !== newCostPerUnit ||
                  currentIngredient.portionCost !== newPortionCost
                ) {
                  currentIngredient.costPerUnit = newCostPerUnit;
                  currentIngredient.portionCost = newPortionCost;
                  const totalPortionCost = recipeList.reduce((sum, item) => {
                    return sum + (item.portionCost || 0);
                  }, 0);
                  dish.CustomizedPrice[costs[index]] = totalPortionCost;

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

  const updateDishInFirebase = async (dish) => {
    const docRef = doc(db, 'item', dish.id);
    await updateDoc(docRef, {
      recipe: dish.recipe,
      costPriceObj: dish.costPriceObj,
      CustomizedPrice: dish.CustomizedPrice,
    });
  };

  const updateSideDishesInFirebase = async (stockProduct) => {
    try {
      const sideDishesRef = collection(db, 'sideDishes');
      const q = query(sideDishesRef, where('sideDishes', '==', stockProduct.product));
      const querySnapshot = await getDocs(q);
      
      const newCostPerUnit = stockProduct.totalVolume > 0 
        ? stockProduct.totalCost / stockProduct.totalVolume 
        : (Number(stockProduct.CostPerUnit) || 0);

      const updates = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const portionUsed = Number(data.portionUsed) || 0;
        const newPortionCost = Number((portionUsed * newCostPerUnit).toFixed(2));
        
        const isUnavailable = Number(stockProduct.totalVolume) <= Number(stockProduct.disabledDish);
        
        const docRef = doc(db, 'sideDishes', docSnap.id);
        const updatedFields = {
          costPerUnit: Number(newCostPerUnit.toFixed(4)),
          portionCost: newPortionCost,
          unavailableRawMaterial: isUnavailable,
        };
        
        if (data.costPriceObj) {
          updatedFields.costPriceObj = {
            ...data.costPriceObj,
            cost: newPortionCost,
            profit: Number(((Number(data.costPriceObj.price) || 0) - newPortionCost).toFixed(2)),
            percentage: data.costPriceObj.price > 0 
              ? ((newPortionCost / Number(data.costPriceObj.price)) * 100).toFixed(2) 
              : '0.00'
          };
        }
        
        updates.push(updateDoc(docRef, updatedFields));
      });

      await Promise.all(updates);
      console.log(`[STOCK-UPDATE-EDIT] Updated ${updates.length} sideDishes matching "${stockProduct.product}"`);
    } catch (err) {
      console.error('Erro ao atualizar acompanhamentos:', err);
    }
  };

  return (
    <div className={edit.popupOverlay}>
      <div className={edit.containerEditStock}>
        <div className={edit.containerIcon}>
          <a
            href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.ya28pgiijere"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir documentação"
          >
            <span>?</span>
          </a>
        </div>
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
          <p style={{
            fontSize: '15px',
            color: '#000',
            marginTop: '8px',
            lineHeight: '1.4',
            maxWidth: '90%',
            textAlign: 'center'
          }}>
            Esta tela deve ser usada para registrar <strong>descartes</strong> quando uma matéria-prima estragou, 
            saiu da validade ou foi perdida. O volume descartado reduzirá proporcionalmente o custo do seu estoque 
            e lançará uma despesa no Resumo Financeiro.
          </p>
        </div>

        <div className={edit.inputGrid}>
          <div className={edit.fieldWrapper}>
            <Input
              id="discardAmount"
              autoComplete="off"
              className="num"
              label="Volume Descartado"
              value={discardAmount}
              type="text"
              prefix="-"
              onChange={handleDiscardChange}
              title="Digite a quantidade exata de produto que será subtraída e removida do seu estoque. O sistema considerará este valor para reduzir o volume final."
              unitText={stockProductObj.unitOfMeasurement}
              placeholder="Ex: 2.5"
            />
          </div>

          <div className={edit.fieldWrapper}>
            <Input
              id="totalVolume"
              autoComplete="off"
              className="num"
              label="Novo Volume Total"
              value={stockProductObj.totalVolume}
              type="text"
              readOnly={true}
              title="O volume resultante após o descarte."
              unitText={stockProductObj.unitOfMeasurement}
            />
          </div>

          <div className={edit.fieldWrapper}>
            <Input
              id="totalCost"
              autoComplete="off"
              className="num"
              label="Novo Custo Total"
              value={stockProductObj.totalCost}
              type="text"
              readOnly={true}
              title="O custo total remanescente após o descarte (calculado proporcionalmente)."
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
              title="Limite mínimo de estoque. Abaixo disso, o sistema emitirá um alerta de reposição."
              unitText={stockProductObj.unitOfMeasurement}
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
              title="Volume crítico. Quando o estoque atingir este nível, os pratos que usam esta matéria-prima serão desativados no menu."
              unitText={stockProductObj.unitOfMeasurement}
            />
          </div>
        </div>
        <div className={edit.textareaField}>
          <label htmlFor="editAdminNote">Justificativa de Descarte (Obrigatório)</label>
          <textarea
            id="editAdminNote"
            className="num"
            value={noteReasonsEditingProduct || ''}
            onChange={(e) => setNoteReasonsEditingProduct(e.target.value)}
            autoComplete="off"
            rows={3}
            placeholder="Qual foi o motivo da perda ou descarte deste produto?"
            onBlur={updateNoteEdit}
            title="Espaço para registrar o motivo deste ajuste manual (ex: validade, quebra, contaminação, etc.)."
            required
          />
        </div>

        <div className={edit.volumeRow}>
          <h3>Volume Original do Produto</h3>
          <p>
            {Number(obj.totalVolume).toFixed(2)}
            {obj.unitOfMeasurement}
          </p>
        </div>

        <div className={edit.btnRow}>
          <button className={edit.addBtn} type="button" onClick={addItem} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Registrar Descarte'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditFormStockProduct;
