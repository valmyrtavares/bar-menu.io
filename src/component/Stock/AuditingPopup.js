import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getBtnData, logStockUsage, registerDailyStockMovement } from '../../api/Api';
import { doc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage';

import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';
import styleProgress from '../../assets/styles/AuditingPopupProgress.module.scss';

const AuditingPopup = ({ onClose, fetchStock }) => {
  const [stockItems, setStockItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [originalItems, setOriginalItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);

  // Estados para o Progresso e Resiliência
  const [progressIndex, setProgressIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [currentUpdatingItemName, setCurrentUpdatingItemName] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pendingAuditState, setPendingAuditState] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [stockData, dishesData] = await Promise.all([
          getBtnData('stock'),
          getBtnData('item')
        ]);
        
        setDishes(dishesData || []);

        const sorted = (stockData || []).sort((a, b) => a.product.localeCompare(b.product));
        // Filter out operationSupplies === true (Insumos) and deleted items
        const filtered = sorted.filter(
          (item) => item.operationSupplies === false && (item.activityStatus === undefined || item.activityStatus === false)
        );

        const initialOriginals = {};
        const itemsWithEditedVolume = filtered.map(item => {
          initialOriginals[item.id] = { ...item };
          return { ...item, correctionValue: '' }; // empty means no change yet
        });

        setOriginalItems(initialOriginals);
        setAllItems(itemsWithEditedVolume);
        setStockItems(itemsWithEditedVolume);
        
        exportToExcel(itemsWithEditedVolume);

        // Verificar se há alguma auditoria não concluída no localStorage
        const saved = localStorage.getItem('pending_stock_audit');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.summaryItems && parsed.summaryItems.length > 0) {
              setPendingAuditState(parsed);
            }
          } catch (e) {
            console.error("Erro ao ler auditoria pendente do localStorage:", e);
            localStorage.removeItem('pending_stock_audit');
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Efeito do Cronômetro Ativo durante a submissão
  useEffect(() => {
    let interval = null;
    if (isSubmitting) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
    // Update both lists to keep them in sync
    setAllItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, correctionValue: value };
      return item;
    }));
    setStockItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, correctionValue: value };
      return item;
    }));
  };

  const hasUnsavedChanges = () => {
    return allItems.some(item => item.correctionValue !== '');
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const confirmClose = window.confirm('Existem alterações que serão perdidas se não forem salvas, tem certeza que quer fechar a tela?');
      if (!confirmClose) return;
    }
    onClose();
  };

  const handleNext = () => {
    const itemsToUpdate = allItems.filter(item => item.correctionValue !== '' && !isNaN(item.correctionValue));
    if (itemsToUpdate.length === 0) {
      alert("Nenhuma alteração de volume válida foi detectada.");
      return;
    }
    setShowSummaryScreen(true);
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
        
        const docRef = doc(db, 'sideDishes', docSnap.id);
        const updatedFields = {
          costPerUnit: Number(newCostPerUnit.toFixed(4)),
          portionCost: newPortionCost,
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
      console.log(`[STOCK-UPDATE-AUDIT] Updated ${updates.length} sideDishes matching "${stockProduct.product}"`);
    } catch (err) {
      console.error('Erro ao atualizar acompanhamentos:', err);
    }
  };

  const stockHistoryList = (item, account, paymentDate, pack, cost, unit, volume, previousVolume, previousCost, totalCost, totalVolume, orderNumber = '') => {
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
      orderNumber: orderNumber,
    };
  };

  const runAuditProcess = async (auditData) => {
    setIsSubmitting(true);
    let currentAudit = { ...auditData };
    setTotalItems(currentAudit.summaryItems.length);
    setProgressIndex(currentAudit.currentIndex);

    try {
      // 1. Criar o registro no histórico de inventário caso ainda não exista no Firestore
      if (!currentAudit.inventoryHistoryDocId) {
        const inventoryRecord = {
          date: currentAudit.fullDate,
          timestamp: Date.now(),
          totalLossValue: currentAudit.totalLossValue,
          items: currentAudit.summaryItems.map(item => ({
            product: item.product,
            unit: item.unitOfMeasurement,
            previousVolume: item.originalVolume,
            previousCost: item.originalCost,
            currentVolume: item.newVolume,
            currentCost: item.newCost,
            lossVolume: item.lossVolume,
            lossValue: item.lossValue,
            correction: item.correction
          }))
        };

        const docRef = await addDoc(collection(db, 'inventoryHistory'), inventoryRecord);
        currentAudit.inventoryHistoryDocId = docRef.id;
        localStorage.setItem('pending_stock_audit', JSON.stringify(currentAudit));
      }

      // 2. Loop de atualização atômica item por item
      for (let i = currentAudit.currentIndex; i < currentAudit.summaryItems.length; i++) {
        const item = currentAudit.summaryItems[i];
        setCurrentUpdatingItemName(item.product);
        setProgressIndex(i);

        const original = originalItems[item.id] || item;
        const newVolumeValue = item.newVolume;
        const newTotalCostValue = item.newCost;

        const newUnit = Number(original.volumePerUnit) > 0 ? newVolumeValue / Number(original.volumePerUnit) : 0;
        const newCostPerUnit = newVolumeValue > 0 ? newTotalCostValue / newVolumeValue : (Number(original.CostPerUnit) || 0);

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

        const logEvent = stockHistoryList(
          original,
          'Auditoria',
          currentAudit.paymentDate,
          pack,
          cost,
          unit,
          volume,
          previousVolume,
          previousCost,
          updatedProduct.totalCost,
          updatedProduct.totalVolume
        );

        delete updatedProduct.UsageHistory;

        // Atualizar pratos localmente para este item
        const dishesToUpdateForThisItem = updateRecipesinDishesAndSideDishes(updatedProduct, dishes);
        // Gravar no Firestore imediatamente (se existirem pratos afetados)
        if (dishesToUpdateForThisItem && dishesToUpdateForThisItem.length > 0) {
          const uniqueDishesMap = new Map();
          dishesToUpdateForThisItem.forEach(d => uniqueDishesMap.set(d.id, d));
          await Promise.all(Array.from(uniqueDishesMap.values()).map(updateDishInFirebase));
        }

        // Atualizar Firestore Stock
        const docRef = doc(db, 'stock', updatedProduct.id);
        await updateDoc(docRef, updatedProduct);
        await logStockUsage(updatedProduct.id, logEvent);

        // Atualizar Side Dishes
        await updateSideDishesInFirebase(updatedProduct);

        // Verificar disponibilidade (otimizada)
        await checkUnavaiableRawMaterial(updatedProduct.id);

        // Atualizar progresso no localStorage
        currentAudit.currentIndex = i + 1;
        currentAudit.completedIds = [...(currentAudit.completedIds || []), item.id];
        localStorage.setItem('pending_stock_audit', JSON.stringify(currentAudit));
      }

      // 3. Registrar movimentação consolidada final
      setProgressIndex(currentAudit.summaryItems.length);
      await registerDailyStockMovement('Inventário/Auditoria');
      
      // Limpar do localStorage
      localStorage.removeItem('pending_stock_audit');
      
      fetchStock();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar auditoria:", error);
      alert("Ocorreu um erro ao salvar a auditoria. O progresso foi mantido e você poderá retomar de onde parou ao reabrir a tela.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAndSave = async (summaryItems, totalLossValue, fullDate, paymentDate) => {
    if (isSubmitting) return;

    const auditData = {
      summaryItems,
      totalLossValue,
      fullDate,
      paymentDate,
      currentIndex: 0,
      completedIds: [],
      inventoryHistoryDocId: null
    };

    localStorage.setItem('pending_stock_audit', JSON.stringify(auditData));
    await runAuditProcess(auditData);
  };

  const handleResumeAudit = async () => {
    if (!pendingAuditState) return;
    const auditToRun = { ...pendingAuditState };
    setPendingAuditState(null); // Fecha a tela de prompt
    await runAuditProcess(auditToRun);
  };

  const handleDiscardAudit = () => {
    if (window.confirm("Tem certeza de que deseja descartar o progresso salvo? Alguns itens que já foram atualizados no banco de dados não serão desfeitos.")) {
      localStorage.removeItem('pending_stock_audit');
      setPendingAuditState(null);
    }
  };

  const renderProgressScreen = () => {
    const percent = totalItems > 0 ? Math.round((progressIndex / totalItems) * 100) : 0;
    return (
      <div className={styleProgress.progressOverlay}>
        <div className={styleProgress.progressCard}>
          <div className={styleProgress.spinner}></div>
          <h3>Salvando Auditoria de Estoque</h3>
          
          <div className={styleProgress.progressBarContainer}>
            <div 
              className={styleProgress.progressBar} 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          
          <p className={styleProgress.progressText}>
            Atualizando item <strong>{progressIndex + 1}</strong> de <strong>{totalItems}</strong> ({percent}%)
          </p>
          
          <p className={styleProgress.currentItemName}>
            {currentUpdatingItemName}
          </p>
          
          <div className={styleProgress.timerContainer}>
            Tempo decorrido: <strong>{formatTime(elapsedTime)}</strong>
          </div>
          
          <p className={styleProgress.warningText}>
            ⚠️ Por favor, não feche esta página ou recarregue o navegador.
            O sistema está realizando gravações otimizadas e seguras.
          </p>
        </div>
      </div>
    );
  };

  const renderRecoveryScreen = () => {
    return (
      <div className={styleProgress.recoveryOverlay}>
        <div className={styleProgress.recoveryCard}>
          <h3>Auditoria Incompleta Detectada</h3>
          <p>
            Uma auditoria de estoque iniciada em <strong>{pendingAuditState.fullDate}</strong> não foi concluída com sucesso.
          </p>
          <p>
            Total de itens a atualizar: <strong>{pendingAuditState.summaryItems.length}</strong>
          </p>
          <p>
            Progresso salvo: <strong>{pendingAuditState.currentIndex}</strong> de <strong>{pendingAuditState.summaryItems.length}</strong> itens concluídos.
          </p>
          <div className={styleProgress.recoveryButtons}>
            <button 
              className={styleProgress.confirmBtn} 
              onClick={handleResumeAudit}
            >
              Retomar Auditoria
            </button>
            <button 
              className={styleProgress.cancelBtn} 
              onClick={handleDiscardAudit}
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMainScreen = () => {
    return (
      <div className={styleEdit.containerEditStock} style={{ maxWidth: '1000px' }}>
        <div className={styleEdit.closeBtnRow}>
          <button className={styleEdit.closeBtn} type="button" onClick={handleClose}>
            X
          </button>
        </div>

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
                  <th>Volume Atual</th>
                  <th>Correção</th>
                  <th>Novo Volume</th>
                  <th>Custo Atual</th>
                  <th>Novo Custo</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(item => {
                  const correction = Number(item.correctionValue);
                  const hasCorrection = item.correctionValue !== '' && !isNaN(correction);
                  const newVolume = hasCorrection ? Number(item.totalVolume) + correction : Number(item.totalVolume);
                  
                  let newCost = Number(item.totalCost);
                  if (hasCorrection) {
                    let unitPriceOriginal = 0;
                    if (Number(item.totalVolume) > 0) {
                      unitPriceOriginal = Number(item.totalCost) / Number(item.totalVolume);
                    } else {
                      unitPriceOriginal = Number(item.CostPerUnit || 0);
                    }
                    newCost = newVolume * unitPriceOriginal;
                  }

                  return (
                    <tr key={item.id}>
                      <td>{item.product}</td>
                      <td>{Number(item.totalVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                      <td>
                        <input
                          type="number"
                          value={item.correctionValue}
                          onChange={(e) => handleVolumeChange(item.id, e.target.value)}
                          placeholder="Ex: -5"
                          style={{ width: '80px', padding: '5px' }}
                        />
                      </td>
                      <td style={{ fontWeight: hasCorrection ? 'bold' : 'normal', color: hasCorrection ? '#007bff' : 'inherit' }}>
                        {newVolume.toFixed(2)} {item.unitOfMeasurement}
                      </td>
                      <td>R$ {Number(item.totalCost).toFixed(2)}</td>
                      <td style={{ fontWeight: hasCorrection ? 'bold' : 'normal', color: hasCorrection ? '#007bff' : 'inherit' }}>
                        R$ {newCost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styleEdit.btnRow}>
          <button 
            className={styleEdit.addBtn} 
            type="button" 
            onClick={handleNext} 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Enviando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryScreen = () => {
    const itemsToUpdate = allItems.filter(item => item.correctionValue !== '' && !isNaN(item.correctionValue));
    let totalLossValue = 0;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const paymentDate = `${day}/${month}/${year}`;
    const fullDate = `${paymentDate} ${hours}:${minutes}`;

    const summaryItems = itemsToUpdate.map(item => {
      const original = originalItems[item.id];
      const correction = Number(item.correctionValue);
      const newVolume = Number(original.totalVolume) + correction;
      let newCost = Number(original.totalCost);
      if (original.totalVolume > 0) {
         const unitPriceOriginal = Number(original.totalCost) / Number(original.totalVolume);
         newCost = newVolume * unitPriceOriginal;
      } else {
         const unitPriceOriginal = Number(original.CostPerUnit || 0);
         newCost = newVolume * unitPriceOriginal;
      }

      const lossVolume = correction < 0 ? Math.abs(correction) : 0;
      const lossValue = newCost < original.totalCost ? original.totalCost - newCost : 0;

      totalLossValue += lossValue;

      return {
         ...original,
         originalVolume: original.totalVolume,
         originalCost: original.totalCost,
         newVolume,
         newCost,
         lossVolume,
         lossValue,
         correction
      };
    });

    return (
      <div className={styleEdit.containerEditStock} style={{ maxWidth: '1000px' }}>
        <div className={styleEdit.titleRow}>
          <h2>Inventário feito no dia {fullDate}</h2>
        </div>
        <div className={styleTrack.tableStockContainer} style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Nome do item</th>
                <th>Valor anterior</th>
                <th>Volume anterior</th>
                <th>Valor atual</th>
                <th>Volume atual</th>
                <th>Perda de MP</th>
                <th>Perda de MT (R$)</th>
              </tr>
            </thead>
            <tbody>
              {summaryItems.map(item => (
                <tr key={item.id}>
                  <td>{item.product}</td>
                  <td>R$ {Number(item.originalCost).toFixed(2)}</td>
                  <td>{Number(item.originalVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                  <td>R$ {Number(item.newCost).toFixed(2)}</td>
                  <td>{Number(item.newVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                  <td style={{ color: item.lossVolume > 0 ? 'red' : 'inherit' }}>
                    {item.lossVolume > 0 ? `${item.lossVolume.toFixed(2)} ${item.unitOfMeasurement}` : '-'}
                  </td>
                  <td style={{ color: item.lossValue > 0 ? 'red' : 'inherit' }}>
                    {item.lossValue > 0 ? `R$ ${item.lossValue.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '18px', textAlign: 'right', paddingRight: '20px' }}>
          Perda total em dinheiro: R$ {totalLossValue.toFixed(2)}
        </div>
        <div className={styleEdit.btnRow} style={{ justifyContent: 'space-between', marginTop: '20px' }}>
           <button 
             className={styleEdit.closeBtn} 
             style={{ position: 'relative', top: 0, right: 0 }} 
             type="button" 
             onClick={() => setShowSummaryScreen(false)}
             disabled={isSubmitting}
           >
             Voltar para edição
           </button>
           <button 
             className={styleEdit.addBtn} 
             type="button" 
             onClick={() => handleConfirmAndSave(summaryItems, totalLossValue, fullDate, paymentDate)} 
             disabled={isSubmitting}
           >
             Confirmar e Salvar
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styleEdit.popupOverlay}>
      {pendingAuditState && renderRecoveryScreen()}
      {isSubmitting && renderProgressScreen()}
      {showSummaryScreen ? renderSummaryScreen() : renderMainScreen()}
    </div>
  );
};

export default AuditingPopup;
