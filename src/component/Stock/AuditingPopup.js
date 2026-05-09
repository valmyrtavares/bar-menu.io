import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getBtnData } from '../../api/Api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage';

import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';

const AuditingPopup = ({ onClose, fetchStock }) => {
  const [stockItems, setStockItems] = useState([]);
  const [originalItems, setOriginalItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [stockData, dishesData] = await Promise.all([
          getBtnData('stock'),
          getBtnData('item')
        ]);
        
        setDishes(dishesData || []);

        const sorted = (stockData || []).sort((a, b) => a.product.localeCompare(b.product));
        const filtered = sorted.filter(
          (item) => item.activityStatus === undefined || item.activityStatus === false
        );

        const initialOriginals = {};
        const itemsWithEditedVolume = filtered.map(item => {
          initialOriginals[item.id] = { ...item };
          return { ...item, editedVolume: '' }; // empty means no change yet
        });

        setOriginalItems(initialOriginals);
        setStockItems(itemsWithEditedVolume);
        
        exportToExcel(itemsWithEditedVolume);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const exportToExcel = (items) => {
    const dataToExport = items.map(item => ({
      'Produto': item.product,
      'Custo Atual (R$)': Number(item.totalCost).toFixed(2),
      'Volume Atual no Sistema': Number(item.totalVolume).toFixed(2),
      'Unidade de Medida': item.unitOfMeasurement,
      'Estoque Físico/Corrigido': '' // Empty column for print
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoria");
    XLSX.writeFile(workbook, "auditoria_estoque.xlsx");
  };

  const handleVolumeChange = (id, value) => {
    setStockItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, editedVolume: value };
      }
      return item;
    }));
  };

  const hasUnsavedChanges = () => {
    return stockItems.some(item => item.editedVolume !== '');
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const confirmClose = window.confirm('Existem alterações que serão perdidas se não forem salvas, tem certeza que quer fechar a tela?');
      if (!confirmClose) return;
    }
    onClose();
  };

  const updateRecipesinDishesAndSideDishes = (stockProduct, allDishes) => {
    const updatedDishes = [];
    if (allDishes && allDishes.length > 0) {
      try {
        allDishes.forEach((dish) => {
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

              const newCostPerUnit = stockProduct.totalCost / stockProduct.totalVolume;
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
          } else if (
            dish.CustomizedPrice &&
            typeof dish.CustomizedPrice === 'object' &&
            dish.CustomizedPrice.firstLabel &&
            dish.CustomizedPrice.firstLabel.trim() !== ''
          ) {
            const labels = ['firstLabel', 'secondLabel', 'thirdLabel'];
            const costs = ['firstCost', 'secondCost', 'thirdCost'];
            let wasUpdated = false;

            labels.forEach((label, index) => {
              const recipeList = dish.recipe?.FinalingridientsList?.[dish.CustomizedPrice[label]];
              if (Array.isArray(recipeList) && recipeList.length > 0) {
                const currentIngredient = recipeList.find(
                  (item) =>
                    item.name.trim().toLowerCase() ===
                    stockProduct.product.trim().toLowerCase()
                );
                if (!currentIngredient) return;

                const newCostPerUnit = stockProduct.totalCost / stockProduct.totalVolume;
                const newPortionCost = currentIngredient.amount * newCostPerUnit;

                if (
                  currentIngredient.costPerUnit !== newCostPerUnit ||
                  currentIngredient.portionCost !== newPortionCost
                ) {
                  currentIngredient.costPerUnit = newCostPerUnit;
                  currentIngredient.portionCost = newPortionCost;
                  const totalPortionCost = recipeList.reduce((sum, item) => sum + (item.portionCost || 0), 0);
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
        return [];
      }
    }
    return [];
  };

  const updateDishInFirebase = async (dish) => {
    const docRef = doc(db, 'item', dish.id);
    await updateDoc(docRef, {
      recipe: dish.recipe,
      costPriceObj: dish.costPriceObj,
      CustomizedPrice: dish.CustomizedPrice,
    });
  };

  const stockHistoryList = (item, account, paymentDate, pack, cost, unit, volume, previousVolume, previousCost, totalCost, totalVolume) => {
    return {
      date: paymentDate,
      outputProduct: 0,
      category: account || 0,
      unit: unit,
      noteReasonsEditingProduct: 'Auditoria de Estoque',
      package: pack,
      inputProduct: volume,
      cost: cost,
      previousVolume: previousVolume,
      previousCost: previousCost,
      ContentsInStock: totalVolume,
      totalResourceInvested: totalCost,
    };
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const itemsToUpdate = stockItems.filter(item => item.editedVolume !== '' && !isNaN(item.editedVolume));
    if (itemsToUpdate.length === 0) {
      alert("Nenhuma alteração de volume válida foi detectada.");
      return;
    }

    setIsSubmitting(true);

    try {
      let allUpdatedDishes = [];

      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const paymentDate = `${day}/${month}/${year}`;

      for (const item of itemsToUpdate) {
        const original = originalItems[item.id];
        const newVolumeValue = Number(item.editedVolume);

        let newTotalCostValue = Number(original.totalCost);
        // Lógica de proporção: Se mudar o volume, o custo segue a proporção original
        if (original.totalVolume > 0) {
          const unitPriceOriginal = Number(original.totalCost) / Number(original.totalVolume);
          newTotalCostValue = Number((newVolumeValue * unitPriceOriginal).toFixed(2));
        }

        const newUnit = Number(original.volumePerUnit) > 0 ? newVolumeValue / Number(original.volumePerUnit) : 0;
        const newCostPerUnit = newVolumeValue > 0 ? newTotalCostValue / newVolumeValue : 0;

        const updatedProduct = {
          ...original,
          totalVolume: newVolumeValue,
          totalCost: newTotalCostValue,
          amount: Number(newUnit.toFixed(2)),
          CostPerUnit: Number(newCostPerUnit.toFixed(2)),
        };

        const previousCost = original.totalCost;
        const previousVolume = original.totalVolume;
        const cost = 0;
        const pack = Number(updatedProduct.amount);
        const volume = 0;
        const unit = updatedProduct.unitOfMeasurement;

        updatedProduct.UsageHistory = original.UsageHistory || [];
        updatedProduct.UsageHistory.push(
          stockHistoryList(
            original,
            'Auditoria',
            paymentDate,
            pack,
            cost,
            unit,
            volume,
            previousVolume,
            previousCost,
            updatedProduct.totalCost,
            updatedProduct.totalVolume
          )
        );

        // Update Dishes locally
        const dishesToUpdateForThisItem = updateRecipesinDishesAndSideDishes(updatedProduct, dishes);
        allUpdatedDishes = [...allUpdatedDishes, ...dishesToUpdateForThisItem];

        // Update Firestore Stock
        const docRef = doc(db, 'stock', updatedProduct.id);
        await updateDoc(docRef, updatedProduct);

        // Check availability
        await checkUnavaiableRawMaterial(updatedProduct.id);
      }

      // Remove duplicates from allUpdatedDishes if multiple items modified the same dish
      const uniqueUpdatedDishesMap = new Map();
      allUpdatedDishes.forEach(dish => {
        uniqueUpdatedDishesMap.set(dish.id, dish);
      });
      const uniqueUpdatedDishes = Array.from(uniqueUpdatedDishesMap.values());

      // Update Dishes in Firebase
      await Promise.all(uniqueUpdatedDishes.map(updateDishInFirebase));

      fetchStock();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar auditoria:", error);
      alert("Ocorreu um erro ao salvar. Verifique o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styleEdit.popupOverlay}>
      <div className={styleEdit.containerEditStock} style={{ maxWidth: '900px' }}>
        <div className={styleEdit.closeBtnRow}>
          <button className={styleEdit.closeBtn} type="button" onClick={handleClose}>
            X
          </button>
        </div>
        
        {isSubmitting && <UpdateMenuMessage />}

        <div className={styleEdit.titleRow}>
          <h2>Auditoria de Estoque</h2>
          <p style={{ marginTop: '10px' }}>O arquivo Excel foi baixado para facilitar a contagem física.</p>
        </div>

        <div className={styleTrack.tableStockContainer} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <p>Carregando dados...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Custo Atual</th>
                  <th>Volume Atual no Sistema</th>
                  <th>Estoque Corrigido</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.product}</td>
                    <td>R$ {Number(item.totalCost).toFixed(2)}</td>
                    <td>
                      {Number(item.totalVolume).toFixed(2)} {item.unitOfMeasurement}
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '5px' }}
                        value={item.editedVolume}
                        onChange={(e) => handleVolumeChange(item.id, e.target.value)}
                        placeholder="Novo vol."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styleEdit.btnRow}>
          <button 
            className={styleEdit.addBtn} 
            type="button" 
            onClick={handleSave} 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Enviando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditingPopup;
