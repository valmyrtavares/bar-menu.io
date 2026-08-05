import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getBtnData, logStockUsage, registerDailyStockMovement } from '../../api/Api';
import { doc, updateDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers';

import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';
import styleProgress from '../../assets/styles/AuditingPopupProgress.module.scss';

const AuditingPopup = ({ onClose, fetchStock }) => {
  const [stockItems, setStockItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [justification, setJustification] = useState('');

  // Estados para o Progresso e Resiliência
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

        const itemsWithEditedVolume = filtered.map(item => {
          return { ...item, correctionValue: '' }; // empty means no change yet
        });

        setAllItems(itemsWithEditedVolume);
        setStockItems(itemsWithEditedVolume);
        
        exportToExcel(itemsWithEditedVolume);

        // Verificar se há alguma auditoria não concluída no localStorage
        const saved = localStorage.getItem('active_stock_audit_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.items) {
              setPendingAuditState(parsed);
            }
          } catch (e) {
            console.error("Erro ao ler auditoria ativa do localStorage:", e);
            localStorage.removeItem('active_stock_audit_session');
          }
        } else {
          // Inicializar uma nova sessão caso não exista
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          const hours = String(today.getHours()).padStart(2, '0');
          const minutes = String(today.getMinutes()).padStart(2, '0');
          const seconds = String(today.getSeconds()).padStart(2, '0');
          const paymentDate = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
          const fullDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

          const newSession = {
            id: `session_${Date.now()}`,
            fullDate,
            paymentDate,
            items: {}
          };
          localStorage.setItem('active_stock_audit_session', JSON.stringify(newSession));
        }
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const getFormattedPaymentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const getFormattedFullDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const loadSessionIntoState = (session) => {
    if (!session || !session.items) return;
    
    setAllItems(prev => prev.map(item => {
      const sessionItem = session.items[item.id];
      if (sessionItem) {
        return {
          ...item,
          originalVolume: sessionItem.originalVolume,
          originalCost: sessionItem.originalCost,
          lastSentVolume: sessionItem.lastSentVolume,
          lastSentCost: sessionItem.lastSentCost,
          firstSentAt: sessionItem.firstSentAt,
          hasBeenSent: true,
          correctionValue: sessionItem.correctionValue
        };
      }
      return item;
    }));
    
    setStockItems(prev => prev.map(item => {
      const sessionItem = session.items[item.id];
      if (sessionItem) {
        return {
          ...item,
          originalVolume: sessionItem.originalVolume,
          originalCost: sessionItem.originalCost,
          lastSentVolume: sessionItem.lastSentVolume,
          lastSentCost: sessionItem.lastSentCost,
          firstSentAt: sessionItem.firstSentAt,
          hasBeenSent: true,
          correctionValue: sessionItem.correctionValue
        };
      }
      return item;
    }));
  };

  const handleResumeAudit = () => {
    if (!pendingAuditState) return;
    loadSessionIntoState(pendingAuditState);
    setPendingAuditState(null);
  };

  const handleSaveFromPoint = () => {
    if (!pendingAuditState) return;
    loadSessionIntoState(pendingAuditState);
    setPendingAuditState(null);
    setShowSummaryScreen(true);
  };

  const revertSessionChanges = async (session) => {
    setIsSubmitting(true);
    try {
      const itemsToRevert = Object.values(session.items || {}).filter(item => item.hasBeenSent);
      
      for (const item of itemsToRevert) {
        const netVolumeDelta = Number(item.lastSentVolume) - Number(item.originalVolume);
        if (netVolumeDelta === 0) continue;

        const docRef = doc(db, 'stock', item.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) continue;

        const dbItem = docSnap.data();

        // Revert volume by subtracting the net change
        const revertedVolume = Math.max(0, Number(dbItem.totalVolume) - netVolumeDelta);
        
        let unitPrice = 0;
        if (Number(item.originalCost) > 0 && Number(item.originalVolume) > 0) {
          unitPrice = Number(item.originalCost) / Number(item.originalVolume);
        } else if (Number(dbItem.lastUnitCost) > 0) {
          unitPrice = Number(dbItem.lastUnitCost);
        } else {
          unitPrice = Number(dbItem.CostPerUnit || 0);
        }

        const revertedCost = Math.max(0, Number((revertedVolume * unitPrice).toFixed(2)));
        const newUnit = Number(dbItem.volumePerUnit) > 0 ? revertedVolume / Number(dbItem.volumePerUnit) : 0;
        const newCostPerUnit = revertedVolume > 0 ? revertedCost / revertedVolume : (Number(dbItem.CostPerUnit) || 0);

        const updatedProduct = {
          ...dbItem,
          totalVolume: revertedVolume,
          totalCost: revertedCost,
          amount: Number(newUnit.toFixed(2)),
          CostPerUnit: Number(newCostPerUnit.toFixed(2)),
          lastUnitCost: newCostPerUnit > 0 ? Number(newCostPerUnit.toFixed(2)) : (dbItem.lastUnitCost || 0)
        };

        const cost = 0;
        const pack = Number(updatedProduct.amount);
        const volume = 0;
        const unit = updatedProduct.unitOfMeasurement;
        const previousCost = dbItem.totalCost;
        const previousVolume = dbItem.totalVolume;

        const logEvent = stockHistoryList(
          dbItem,
          'Auditoria',
          getFormattedPaymentDate(),
          pack,
          cost,
          unit,
          volume,
          previousVolume,
          previousCost,
          updatedProduct.totalCost,
          updatedProduct.totalVolume,
          '',
          'Descarte de auditoria (Reversão de calibragem)'
        );

        delete updatedProduct.UsageHistory;

        const dishesToUpdateForThisItem = updateRecipesinDishesAndSideDishes(updatedProduct, dishes);
        if (dishesToUpdateForThisItem && dishesToUpdateForThisItem.length > 0) {
          const uniqueDishesMap = new Map();
          dishesToUpdateForThisItem.forEach(d => uniqueDishesMap.set(d.id, d));
          await Promise.all(Array.from(uniqueDishesMap.values()).map(updateDishInFirebase));
        }

        await updateDoc(docRef, updatedProduct);
        await logStockUsage(updatedProduct.id, logEvent);
        await updateSideDishesInFirebase(updatedProduct);
        await checkUnavaiableRawMaterial(updatedProduct.id);
      }

      localStorage.removeItem('active_stock_audit_session');
      setPendingAuditState(null);
      
      const newSession = {
        id: `session_${Date.now()}`,
        fullDate: getFormattedFullDate(),
        paymentDate: getFormattedPaymentDate(),
        items: {}
      };
      localStorage.setItem('active_stock_audit_session', JSON.stringify(newSession));
      
      alert("Sessão de auditoria descartada e valores revertidos com sucesso no estoque!");
      fetchStock();
    } catch (error) {
      console.error("Erro ao reverter auditoria descartada:", error);
      alert("Ocorreu um erro ao tentar reverter as modificações no estoque.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardAudit = () => {
    if (!pendingAuditState) return;
    
    const sessionItems = Object.values(pendingAuditState.items || {});
    const sentItems = sessionItems.filter(item => item.hasBeenSent);
    
    if (sentItems.length === 0) {
      localStorage.removeItem('active_stock_audit_session');
      setPendingAuditState(null);
      
      const newSession = {
        id: `session_${Date.now()}`,
        fullDate: getFormattedFullDate(),
        paymentDate: getFormattedPaymentDate(),
        items: {}
      };
      localStorage.setItem('active_stock_audit_session', JSON.stringify(newSession));
      alert("Sessão de auditoria vazia limpa com sucesso.");
      return;
    }

    const hasExpiredItem = sentItems.some(item => (Date.now() - item.firstSentAt > 2 * 60 * 60 * 1000));
    if (hasExpiredItem) {
      alert("Não é possível descartar este inventário porque existem itens cujo tempo de edição (2 horas) já expirou. Você deve concluir o salvamento definitivo deste inventário.");
      return;
    }

    if (window.confirm("Atenção! Descartar esta sessão irá reverter todos os valores de estoque das matérias-primas alteradas para os valores originais anteriores à auditoria, preservando as vendas que ocorreram no meio tempo. Deseja continuar?")) {
      revertSessionChanges(pendingAuditState);
    }
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
    let val = value.replace(',', '.');
    if (val !== '' && isNaN(Number(val))) return;

    // Update both lists to keep them in sync
    setAllItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, correctionValue: val };
      return item;
    }));
    setStockItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, correctionValue: val };
      return item;
    }));
  };

  const handleClose = () => {
    const activeSession = localStorage.getItem('active_stock_audit_session');
    if (activeSession) {
      try {
        const parsed = JSON.parse(activeSession);
        const hasSentItems = Object.keys(parsed.items || {}).length > 0;
        if (hasSentItems) {
          const confirmClose = window.confirm('Este inventário possui alterações já enviadas ao estoque que ainda não foram registradas definitivamente no histórico. Tem certeza que deseja fechar a tela? Você poderá retomar o inventário depois.');
          if (!confirmClose) return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleNext = () => {
    const unsentItems = allItems.filter(item => item.correctionValue !== '' && !item.hasBeenSent);
    if (unsentItems.length > 0) {
      const confirmProceed = window.confirm(`Existem ${unsentItems.length} itens modificados que não foram enviados ao estoque. Eles não farão parte deste inventário se não forem enviados. Deseja prosseguir mesmo assim?`);
      if (!confirmProceed) return;
    }

    const sentItems = allItems.filter(item => item.hasBeenSent);
    if (sentItems.length === 0) {
      alert("Nenhum item foi enviado para o estoque ainda nesta auditoria.");
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

  const stockHistoryList = (item, account, paymentDate, pack, cost, unit, volume, previousVolume, previousCost, totalCost, totalVolume, orderNumber = '', justification = '') => {
    const defaultReason = `Antes ${item.product} ${Number(previousVolume).toFixed(2)}${unit} / Agora ${Number(totalVolume).toFixed(2)}${unit}`;
    return {
      date: paymentDate,
      outputProduct: 0,
      category: account || 0,
      unit: unit,
      noteReasonsEditingProduct: justification ? `${defaultReason} | Justificativa: ${justification}` : defaultReason,
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

  const handleSendItem = async (itemId) => {
    if (isSubmitting) return;

    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const enteredValue = Number(item.correctionValue);
    if (item.correctionValue === '' || isNaN(enteredValue) || enteredValue < 0) {
      alert("Por favor, insira um valor de volume válido (número maior ou igual a zero).");
      return;
    }

    const isReedition = item.firstSentAt !== undefined && item.firstSentAt !== null;
    const originalVolume = isReedition ? item.originalVolume : Number(item.totalVolume);
    const originalCost = isReedition ? item.originalCost : Number(item.totalCost);
    const firstSentAt = isReedition ? item.firstSentAt : Date.now();

    const previousSentVolume = isReedition ? item.lastSentVolume : originalVolume;
    const deltaVolume = enteredValue - previousSentVolume;

    let unitPrice = 0;
    if (originalCost > 0 && originalVolume > 0) {
      unitPrice = originalCost / originalVolume;
    } else if (Number(item.lastUnitCost) > 0) {
      unitPrice = Number(item.lastUnitCost);
    } else {
      unitPrice = Number(item.CostPerUnit || 0);
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'stock', item.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("Produto não encontrado no estoque.");
        setIsSubmitting(false);
        return;
      }
      
      const dbItem = docSnap.data();
      const newVolumeDb = Math.max(0, Number(dbItem.totalVolume) + deltaVolume);
      const newCostDb = Math.max(0, Number((newVolumeDb * unitPrice).toFixed(2)));
      
      const newUnit = Number(dbItem.volumePerUnit) > 0 ? newVolumeDb / Number(dbItem.volumePerUnit) : 0;
      const newCostPerUnit = newVolumeDb > 0 ? newCostDb / newVolumeDb : (Number(dbItem.CostPerUnit) || 0);

      const updatedProduct = {
        ...dbItem,
        totalVolume: newVolumeDb,
        totalCost: newCostDb,
        amount: Number(newUnit.toFixed(2)),
        CostPerUnit: Number(newCostPerUnit.toFixed(2)),
        lastUnitCost: newCostPerUnit > 0 ? Number(newCostPerUnit.toFixed(2)) : (dbItem.lastUnitCost || 0)
      };

      const cost = 0;
      const pack = Number(updatedProduct.amount);
      const volume = 0;
      const unit = updatedProduct.unitOfMeasurement;
      const previousCost = dbItem.totalCost;
      const previousVolume = dbItem.totalVolume;

      const logEvent = stockHistoryList(
        dbItem,
        'Auditoria',
        getFormattedPaymentDate(),
        pack,
        cost,
        unit,
        volume,
        previousVolume,
        previousCost,
        updatedProduct.totalCost,
        updatedProduct.totalVolume,
        '',
        `Ajuste calibrado ${isReedition ? '(Reedição)' : ''}`
      );

      delete updatedProduct.UsageHistory;

      // Atualizar pratos localmente para este item
      const dishesToUpdateForThisItem = updateRecipesinDishesAndSideDishes(updatedProduct, dishes);
      if (dishesToUpdateForThisItem && dishesToUpdateForThisItem.length > 0) {
        const uniqueDishesMap = new Map();
        dishesToUpdateForThisItem.forEach(d => uniqueDishesMap.set(d.id, d));
        await Promise.all(Array.from(uniqueDishesMap.values()).map(updateDishInFirebase));
      }

      // Gravar no Firestore
      await updateDoc(docRef, updatedProduct);
      await logStockUsage(updatedProduct.id, logEvent);

      // Atualizar Side Dishes
      await updateSideDishesInFirebase(updatedProduct);

      // Verificar disponibilidade
      await checkUnavaiableRawMaterial(updatedProduct.id);

      // Atualizar estado local
      const updatedItemState = {
        ...item,
        totalVolume: newVolumeDb,
        totalCost: newCostDb,
        amount: updatedProduct.amount,
        CostPerUnit: updatedProduct.CostPerUnit,
        lastUnitCost: updatedProduct.lastUnitCost,
        originalVolume,
        originalCost,
        lastSentVolume: enteredValue,
        lastSentCost: enteredValue * unitPrice,
        firstSentAt,
        hasBeenSent: true,
        correctionValue: String(enteredValue)
      };

      setAllItems(prev => prev.map(i => i.id === item.id ? updatedItemState : i));
      setStockItems(prev => prev.map(i => i.id === item.id ? updatedItemState : i));

      // Persistir no localStorage
      const activeSession = JSON.parse(localStorage.getItem('active_stock_audit_session')) || {};
      if (!activeSession.items) activeSession.items = {};
      activeSession.items[item.id] = {
        id: item.id,
        product: item.product,
        unitOfMeasurement: item.unitOfMeasurement,
        originalVolume,
        originalCost,
        lastSentVolume: enteredValue,
        lastSentCost: enteredValue * unitPrice,
        firstSentAt,
        hasBeenSent: true,
        correctionValue: String(enteredValue)
      };
      localStorage.setItem('active_stock_audit_session', JSON.stringify(activeSession));

      alert(`${item.product} enviado e atualizado no estoque com sucesso!`);
    } catch (error) {
      console.error("Erro ao enviar item de auditoria:", error);
      alert("Ocorreu um erro ao atualizar o estoque deste item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (itemId) => {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    // Verificar limite de 2 horas
    if (item.firstSentAt && Date.now() - item.firstSentAt > 2 * 60 * 60 * 1000) {
      alert("Este item foi enviado há mais de 2 horas e não pode mais ser editado nesta sessão.");
      return;
    }

    // Colocar o item de volta em modo de edição local (hasBeenSent = false)
    const updated = { ...item, hasBeenSent: false };
    setAllItems(prev => prev.map(i => i.id === itemId ? updated : i));
    setStockItems(prev => prev.map(i => i.id === itemId ? updated : i));
  };

  const handleConfirmAndSave = async (summaryItems, totalLossValue, fullDate, paymentDate) => {
    if (isSubmitting) return;

    if (!justification || justification.trim() === '') {
      alert('Por favor, preencha a justificativa para esta auditoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inventoryRecord = {
        date: fullDate,
        timestamp: Date.now(),
        totalLossValue: totalLossValue,
        justification: justification.trim(),
        items: summaryItems.map(item => ({
          product: item.product,
          unit: item.unitOfMeasurement || item.unit,
          previousVolume: item.originalVolume,
          previousCost: item.originalCost,
          currentVolume: item.newVolume,
          currentCost: item.newCost,
          lossVolume: item.lossVolume,
          lossValue: item.lossValue,
          correction: item.correction,
          sentAt: item.firstSentAt
        }))
      };

      // Gravar histórico de inventários no Firebase
      await addDoc(collection(db, 'inventoryHistory'), inventoryRecord);
      
      // Registrar movimentação consolidada final
      await registerDailyStockMovement('Inventário/Auditoria');
      
      // Limpar do localStorage
      localStorage.removeItem('active_stock_audit_session');
      
      alert("Inventário definitivo salvo com sucesso!");
      fetchStock();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar inventário definitivo:", error);
      alert("Ocorreu um erro ao salvar o inventário definitivamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressScreen = () => {
    return (
      <div className={styleProgress.progressOverlay}>
        <div className={styleProgress.progressCard}>
          <div className={styleProgress.spinner}></div>
          <h3>Atualizando Estoque...</h3>
          <p className={styleProgress.progressText}>
            Por favor, aguarde enquanto o sistema grava as informações de auditoria no Firestore.
          </p>
        </div>
      </div>
    );
  };

  const renderRecoveryScreen = () => {
    const sessionItems = Object.values(pendingAuditState?.items || {});
    const sentItems = sessionItems.filter(item => item.hasBeenSent);
    const hasExpiredItem = sentItems.some(item => (Date.now() - item.firstSentAt > 2 * 60 * 60 * 1000));
    const showDiscard = !hasExpiredItem;

    return (
      <div className={styleProgress.recoveryOverlay}>
        <div className={styleProgress.recoveryCard} style={{ maxWidth: '480px' }}>
          <h3>Inventário Não Finalizado</h3>
          <p>
            Foi detectado um inventário em andamento iniciado em <strong>{pendingAuditState.fullDate}</strong>.
          </p>
          <p>
            Matérias-primas já atualizadas no estoque: <strong>{sentItems.length}</strong>
          </p>
          <div className={styleProgress.recoveryButtons} style={{ flexDirection: 'column', gap: '10px' }}>
            <button 
              className={styleProgress.confirmBtn} 
              onClick={handleResumeAudit}
            >
              Terminar o Inventário (Continuar)
            </button>
            <button 
              className={styleProgress.confirmBtn} 
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              onClick={handleSaveFromPoint}
            >
              Salvar a partir daquele ponto (Resumo)
            </button>
            {showDiscard ? (
              <button 
                className={styleProgress.cancelBtn} 
                onClick={handleDiscardAudit}
              >
                Descartar (Reverter Estoque)
              </button>
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#ff6b6b', marginTop: '10px', lineHeight: '1.4' }}>
                ⚠️ A opção de descarte está indisponível porque existem itens cuja alteração de estoque foi feita há mais de 2 horas. Você deve terminar o inventário ou salvá-lo a partir deste ponto.
              </p>
            )}
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
                  <th>Estoque Físico</th>
                  <th>Novo Volume</th>
                  <th>Custo Atual</th>
                  <th>Novo Custo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(item => {
                  const enteredValue = Number(item.correctionValue);
                  const hasCorrection = item.correctionValue !== '' && !isNaN(enteredValue);
                  
                  let unitPriceOriginal = 0;
                  if (Number(item.totalCost) > 0 && Number(item.totalVolume) > 0) {
                    unitPriceOriginal = Number(item.totalCost) / Number(item.totalVolume);
                  } else if (Number(item.lastUnitCost) > 0) {
                    unitPriceOriginal = Number(item.lastUnitCost);
                  } else {
                    unitPriceOriginal = Number(item.CostPerUnit || 0);
                  }

                  const newVolume = item.hasBeenSent ? Number(item.lastSentVolume) : (hasCorrection ? enteredValue : Number(item.totalVolume));
                  const newCost = item.hasBeenSent ? Number(item.lastSentCost) : (hasCorrection ? newVolume * unitPriceOriginal : Number(item.totalCost));

                  return (
                    <tr key={item.id} style={{ opacity: item.hasBeenSent ? 0.75 : 1 }}>
                      <td data-label="Produto">{item.product}</td>
                      <td data-label="Volume Atual">{Number(item.totalVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                      <td data-label="Estoque Físico">
                        <input
                          type="text"
                          value={item.correctionValue}
                          onChange={(e) => handleVolumeChange(item.id, e.target.value)}
                          placeholder="Ex: 5"
                          style={{ width: '80px', padding: '5px' }}
                          disabled={item.hasBeenSent}
                        />
                      </td>
                      <td data-label="Novo Volume" style={{ fontWeight: (hasCorrection || item.hasBeenSent) ? 'bold' : 'normal', color: (hasCorrection || item.hasBeenSent) ? '#007bff' : 'inherit' }}>
                        {newVolume.toFixed(2)} {item.unitOfMeasurement}
                      </td>
                      <td data-label="Custo Atual">R$ {Number(item.totalCost).toFixed(2)}</td>
                      <td data-label="Novo Custo" style={{ fontWeight: (hasCorrection || item.hasBeenSent) ? 'bold' : 'normal', color: (hasCorrection || item.hasBeenSent) ? '#007bff' : 'inherit' }}>
                        R$ {newCost.toFixed(2)}
                      </td>
                      <td data-label="Ação">
                        {item.hasBeenSent ? (
                          <button
                            type="button"
                            onClick={() => handleEditItem(item.id)}
                            className={styleEdit.addBtn}
                            style={{ 
                              padding: '5px 10px', 
                              fontSize: '12px', 
                              backgroundColor: '#6c757d', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#fff'
                            }}
                            disabled={isSubmitting}
                          >
                            Editar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendItem(item.id)}
                            className={styleEdit.addBtn}
                            style={{ 
                              padding: '5px 10px', 
                              fontSize: '12px', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#fff'
                            }}
                            disabled={isSubmitting || item.correctionValue === '' || isNaN(Number(item.correctionValue))}
                          >
                            Enviar
                          </button>
                        )}
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
            Avançar / Resumo do Inventário
          </button>
        </div>
      </div>
    );
  };

  const renderSummaryScreen = () => {
    const itemsToUpdate = allItems.filter(item => item.hasBeenSent);
    let totalLossValue = 0;

    const activeSession = JSON.parse(localStorage.getItem('active_stock_audit_session')) || {};
    const fullDate = activeSession.fullDate || getFormattedFullDate();
    const paymentDate = activeSession.paymentDate || getFormattedPaymentDate();

    const summaryItems = itemsToUpdate.map(item => {
      const correction = Number(item.lastSentVolume) - Number(item.originalVolume);
      const lossVolume = correction < 0 ? Math.abs(correction) : 0;
      const lossValue = Number(item.lastSentCost) < Number(item.originalCost) ? Number(item.originalCost) - Number(item.lastSentCost) : 0;

      totalLossValue += lossValue;

      return {
        ...item,
        newVolume: Number(item.lastSentVolume),
        newCost: Number(item.lastSentCost),
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
                  <td data-label="Nome do item">{item.product}</td>
                  <td data-label="Valor anterior">R$ {Number(item.originalCost).toFixed(2)}</td>
                  <td data-label="Volume anterior">{Number(item.originalVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                  <td data-label="Valor atual">R$ {Number(item.newCost).toFixed(2)}</td>
                  <td data-label="Volume atual">{Number(item.newVolume).toFixed(2)} {item.unitOfMeasurement}</td>
                  <td data-label="Perda de MP" style={{ color: item.lossVolume > 0 ? 'red' : 'inherit' }}>
                    {item.lossVolume > 0 ? `${item.lossVolume.toFixed(2)} ${item.unitOfMeasurement}` : '-'}
                  </td>
                  <td data-label="Perda de MT (R$)" style={{ color: item.lossValue > 0 ? 'red' : 'inherit' }}>
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

        <div className={styleEdit.textareaField} style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', padding: '0 20px' }}>
          <label htmlFor="auditJustification" style={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}>
            Justificativa da Auditoria (Obrigatório)
          </label>
          <textarea
            id="auditJustification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Descreva o motivo desta auditoria / ajuste de inventário..."
            style={{
              width: '100%',
              height: '80px',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            disabled={isSubmitting}
          />
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
