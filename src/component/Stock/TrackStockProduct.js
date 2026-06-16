import React from 'react';
import { getBtnData, fetchStockUsageLogs } from '../../api/Api';
import style from '../../assets/styles/TrackStockProduct.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import EditFormStockProduct from './EditFormStockProduct';
import ExcludedStockPopup from './ExcludedStockPopup';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase.js';
import AdjustmentRecords from './AdjustmentRecords';
import StockMovementPopup from './StockMovementPopup';
import DishStockMovementPopup from './DishStockMovementPopup';
import AuditingPopup from './AuditingPopup';
import AddStockEntryForm from './AddStockEntryForm';
import InventoryHistoryPopup from './InventoryHistoryPopup';
import { Link } from 'react-router-dom';
import { alertMinimunAmount } from '../../Helpers/Helpers';
//import { useAlertMinimumAmount } from '../../Hooks/useAlertMinimumAmount'
import Title from '../title';
import { tooltips } from '../../constants/tooltips';
import { GlobalContext } from '../../GlobalContext';

const TrackStockProduct = () => {
  const [stock, setStock] = React.useState(null);
  const [migrationLoadingId, setMigrationLoadingId] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeStockItem, setExcludeStockItem] = React.useState('');
  // const [refreshData, setRefreshData] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [eventLogData, setEventLogData] = React.useState(null);
  const [showAdjustmentRecords, setShowAdjustmentRecords] =
    React.useState(false);
  const [showStockMovementPopup, setShowStockMovementPopup] = React.useState(false);
  const [showDishMovementPopup, setShowDishMovementPopup] = React.useState(false);
  const [showAuditingPopup, setShowAuditingPopup] = React.useState(false);
  const [showAddStockEntryForm, setShowAddStockEntryForm] = React.useState(false);
  const [showInventoryHistoryPopup, setShowInventoryHistoryPopup] = React.useState(false);
  const [showExcludedStockPopup, setShowExcludedStockPopup] = React.useState(false);
  const [showBlockDeletionPopup, setShowBlockDeletionPopup] = React.useState(false);
  const [deletionBlockedMessage, setDeletionBlockedMessage] = React.useState('');

  const handleActionSelect = (e) => {
    const value = e.target.value;
    if (value === 'movement') setShowStockMovementPopup(true);
    if (value === 'dishMovement') setShowDishMovementPopup(true);
    if (value === 'audit') setShowAuditingPopup(true);
    if (value === 'addStock') setShowAddStockEntryForm(true);
    if (value === 'inventoryHistory') setShowInventoryHistoryPopup(true);
    if (value === 'excludedStock') setShowExcludedStockPopup(true);
    e.target.value = ''; // reset the select
  };
  const { setWarningLowRawMaterial } = React.useContext(GlobalContext);

  React.useEffect(() => {
    fetchStock();
  }, []);
  // React.useEffect(() => {
  //   fetchStock();
  // }, [refreshData]);

  React.useEffect(() => {
    if (!stock || stock.length === 0) return;
    const messageWaningList = [];

    stock.forEach((item) => {
      const check = alertMinimunAmount(
        item.product,
        item.totalVolume,
        item.minimumAmount,
        item.totalCost
      );
      if (check.status !== '') {
        messageWaningList.push(check.message);
        // adiar para depois do forEach e gravar a lista no localStorage

        setWarningLowRawMaterial((prev) => [...prev, check.message]);
      }
    });
    localStorage.setItem(
      'warningAmountMessage',
      JSON.stringify(messageWaningList)
    );
  }, [stock, setWarningLowRawMaterial]);

  const fetchStock = async () => {
    const data = await getBtnData('stock');
    const sorted = data.sort((a, b) => a.product.localeCompare(b.product));

    // Padrão inicial: mostrar apenas os não deletados (activityStatus false ou undefined)
    const filtered = sorted.filter(
      (item) =>
        item.operationSupplies === false &&
        (item.activityStatus === undefined || item.activityStatus === false)
    );

    setStock(filtered);
  };

  const disableStockItem = async (item, permission) => {
    console.log('item a ser excluido   ', item);

    if (item) {
      setExcludeStockItem(item);
      
      // Checagem se o ingrediente a ser excluído está na receita de algum prato ativo:
      try {
        const dishesList = await getBtnData('item'); // Pega todos os pratos
        const usedInDishes = [];
        
        const normalizedProduct = item.product.trim().toLowerCase();
        
        dishesList.forEach(dish => {
          const checkIngredients = (ingredients) => {
            if (!Array.isArray(ingredients)) return;
            ingredients.forEach(ing => {
              if (ing.name && ing.name.trim().toLowerCase() === normalizedProduct) {
                if (!usedInDishes.includes(dish.title)) {
                  usedInDishes.push(dish.title);
                }
              }
            });
          };

          const list = dish.recipe?.FinalingridientsList;
          if (list) {
            if (Array.isArray(list)) {
              checkIngredients(list);
            } else if (typeof list === 'object') {
              Object.entries(list).forEach(([_, ingList]) => {
                checkIngredients(ingList);
              });
            }
          }
        });

        if (usedInDishes.length > 0) {
          setDeletionBlockedMessage(
            `Não é possível excluir a matéria-prima "${item.product}" pois ela está sendo usada nos seguintes pratos: ${usedInDishes.join(', ')}. Remova-a das receitas antes de prosseguir.`
          );
          setShowBlockDeletionPopup(true);
          return;
        }
      } catch (err) {
        console.error("Erro ao verificar receitas:", err);
      }

      setShowWarningDeltePopup(true);
    }

    if (permission) {
      setShowWarningDeltePopup(false);
      try {
        const deletedItem = { 
          ...excludeStockItem, 
          activityStatus: true,
          deletedAt: new Date().toISOString()
        };
        
        // 1. Gravar na nova coleção deletedStock
        await setDoc(doc(db, 'deletedStock', excludeStockItem.id), deletedItem);
        // 2. Deletar da coleção stock
        await deleteDoc(doc(db, 'stock', excludeStockItem.id));
        
        fetchStock();
      } catch (err) {
        console.error("Erro ao excluir matéria-prima:", err);
      }
    }
  };
  const editStockItem = (item) => {
    setObj(item);
    setShowEditForm(true);
  };

  const usageHistory = async (item) => {
    setTitle(item.product);
    const logs = await fetchStockUsageLogs(item.id);
    
    let mergedLogs = [...(logs || [])];
    if (item.UsageHistory && item.UsageHistory.length > 0) {
      mergedLogs = [...mergedLogs, ...item.UsageHistory];
    }
    
    setEventLogData(mergedLogs);
    setShowAdjustmentRecords(true);
  };

  const handleMigrateSingleItem = async (item) => {
    const confirm = window.confirm(`Deseja migrar o histórico de uso de ${item.product} para a nova estrutura?`);
    if (!confirm) return;

    setMigrationLoadingId(item.id);
    try {
      if (item.UsageHistory && item.UsageHistory.length > 0) {
        console.log(`Migrando ${item.UsageHistory.length} logs de ${item.product}...`);
        
        const { writeBatch, doc, collection, deleteField, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../config-firebase/firebase.js');

        let batch = writeBatch(db);
        let operationCount = 0;

        // PROTEÇÃO: Deleta logs parciais caso uma migração anterior tenha sido interrompida (F5)
        const logsRef = collection(db, 'stockUsageLogs');
        const q = query(logsRef, where('stockId', '==', item.id));
        const snapshot = await getDocs(q);
        
        for (const docSnap of snapshot.docs) {
          batch.delete(docSnap.ref);
          operationCount++;
          if (operationCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }

        for (const log of item.UsageHistory) {
          const newLogRef = doc(collection(db, 'stockUsageLogs'));
          let timestamp = new Date().toISOString();
          if (log.date) {
            // log.date is formatted as "DD/MM/YYYY" or "DD/MM/YYYY HH:MM"
            const parts = log.date.split(' ');
            const dateParts = parts[0].split('/');
            if (dateParts.length === 3) {
              const day = Number(dateParts[0]);
              const month = Number(dateParts[1]) - 1;
              const year = Number(dateParts[2]);
              let hours = 12;
              let minutes = 0;
              if (parts[1]) {
                const timeParts = parts[1].split(':');
                if (timeParts.length >= 2) {
                  hours = Number(timeParts[0]);
                  minutes = Number(timeParts[1]);
                }
              }
              const d = new Date(year, month, day, hours, minutes);
              if (!isNaN(d.getTime())) {
                timestamp = d.toISOString();
              }
            }
          }
          batch.set(newLogRef, {
            stockId: item.id,
            timestamp: timestamp,
            ...log,
            productName: item.product
          });
          
          operationCount++;
          
          // O Firestore permite no máximo 500 operações por batch
          if (operationCount === 450) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }
        
        // Remove a UsageHistory do item no banco
        const docRef = doc(db, 'stock', item.id);
        batch.update(docRef, { UsageHistory: deleteField() });
        
        await batch.commit();
        delete item.UsageHistory;
      }
      alert(`Migração de ${item.product} concluída com sucesso!`);
      fetchStock();
    } catch (error) {
      console.error("Erro na migração", error);
      alert("Erro ao migrar dados.");
    } finally {
      setMigrationLoadingId(null);
    }
  };

  const totalStockValue = React.useMemo(() => {
    if (!stock) return 0;
    return stock.reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);
  }, [stock]);

  return (
    <div className={style.containerTrackStockproduct}>
      <div className={style.containerIcon}>
        <a
          href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.9i08uzpmnp27"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir documentação"
        >
          <span>?</span>
        </a>
      </div>
      <Link to="/admin/admin" className={style.btnBack} title="Sair do Módulo">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      {showEditForm && (
        <EditFormStockProduct
          fetchStock={fetchStock}
          obj={obj}
          setShowEditForm={setShowEditForm}
        />
      )}
      {showStockMovementPopup && (
        <StockMovementPopup onClose={() => setShowStockMovementPopup(false)} />
      )}
      {showDishMovementPopup && (
        <DishStockMovementPopup onClose={() => setShowDishMovementPopup(false)} />
      )}
      {showAuditingPopup && (
        <AuditingPopup 
          onClose={() => setShowAuditingPopup(false)} 
          fetchStock={fetchStock}
        />
      )}
      {showAddStockEntryForm && (
        <div className={style.popupOverlay}>
          <AddStockEntryForm 
            setShowPopup={setShowAddStockEntryForm} 
            setRefreshData={() => fetchStock()} 
          />
        </div>
      )}
      {showInventoryHistoryPopup && (
        <InventoryHistoryPopup onClose={() => setShowInventoryHistoryPopup(false)} />
      )}
      {showExcludedStockPopup && (
        <ExcludedStockPopup onClose={() => setShowExcludedStockPopup(false)} />
      )}
      {showBlockDeletionPopup && (
        <DefaultComumMessage
          msg={deletionBlockedMessage}
          onClose={() => setShowBlockDeletionPopup(false)}
          negativeResponse="OK"
        />
      )}
      <div className={style.containerAdjustmentScreen}>
        {showAdjustmentRecords && (
          <AdjustmentRecords
            eventLogData={eventLogData}
            setShowAdjustmentRecords={setShowAdjustmentRecords}
            title={title}
          />
        )}
      </div>
      <Link to="/admin/admin">
        <Title mainTitle="Estoque" />
      </Link>
      <div className={style.containerBtnView}>
        <div className={style.leftControls}>
          <select onChange={handleActionSelect} defaultValue="">
            <option value="" disabled hidden>Ações de Estoque</option>
            <option value="movement">Movimentação de Estoque</option>
            <option value="dishMovement">Movimentação por pratos</option>
            <option value="addStock">Nova Entrada</option>
            <option value="audit">Auditoria</option>
            <option value="inventoryHistory">Histórico de inventários</option>
            <option value="excludedStock">Matérias Primas Excluídas</option>
          </select>
        </div>
        <h2>Matéria Prima</h2>
        <div className={style.stockValueHighlight}>
          <span>Valor total em estoque:</span>
          <strong>R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <div className={style.tableStockContainer}>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Custo de Estoque</th>
              <th>Estoque em volume</th>
              <th>Editar</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {stock &&
              stock.length > 0 &&
              stock.map((item, index) => (
                <tr
                  key={index}
                  className={
                    alertMinimunAmount(
                      item.product,
                      item.totalVolume,
                      item.minimumAmount,
                      item.totalCost
                    ).status
                      ? ''
                      : style.warning
                  }
                >
                  <td onClick={() => usageHistory(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} title="Ver Histórico de Custos e Ocorrências">
                    <span>{item.product} {item.unitOfMeasurement}</span> <span style={{ fontSize: '1.1rem' }}>🔍</span>
                    {item.UsageHistory && item.UsageHistory.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMigrateSingleItem(item); }}
                        disabled={migrationLoadingId === item.id}
                        style={{ padding: '2px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        {migrationLoadingId === item.id ? 'Migrando...' : 'Migrar Logs'}
                      </button>
                    )}
                  </td>
                  <td>R$ {Number(item.totalCost).toFixed(2)}</td>
                  <td>
                    {Number(item.totalVolume).toFixed(2)}
                    {item.unitOfMeasurement}
                  </td>
                  {showWarningDeletePopup && (
                    <DefaultComumMessage
                      msg={`Você está prestes a Excluir ${excludeStockItem.product}`}
                      item={excludeStockItem}
                      onConfirm={() => disableStockItem(undefined, true)}
                      onClose={() => setShowWarningDeltePopup(false)}
                    />
                  )}
                  <td
                    style={{ cursor: 'pointer' }}
                    onClick={() => editStockItem(item)}
                  >
                    Editar
                  </td>
                  <td
                    title={tooltips.trackStockProduct.toggleBtn}
                    style={{ cursor: 'pointer' }}
                    onClick={() => disableStockItem(item, false)}
                  >
                    Excluir
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TrackStockProduct;
