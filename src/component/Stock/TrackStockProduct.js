import React from 'react';
import { getBtnData, updateOrCreateKeyInDocument } from '../../api/Api';
import style from '../../assets/styles/TrackStockProduct.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import EditFormStockProduct from './EditFormStockProduct';
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
  const [allStockItems, setAllStockItems] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeStockItem, setExcludeStockItem] = React.useState('');
  // const [refreshData, setRefreshData] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [eventLogData, setEventLogData] = React.useState(null);
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [showAdjustmentRecords, setShowAdjustmentRecords] =
    React.useState(false);
  const [subTitle, setSubTitle] = React.useState('Matéria Prima');
  const [checkResults, setCheckResults] = React.useState({}); // ← guarda o status e mensagens de cada item
  const [showStockMovementPopup, setShowStockMovementPopup] = React.useState(false);
  const [showDishMovementPopup, setShowDishMovementPopup] = React.useState(false);
  const [showAuditingPopup, setShowAuditingPopup] = React.useState(false);
  const [showAddStockEntryForm, setShowAddStockEntryForm] = React.useState(false);
  const [showInventoryHistoryPopup, setShowInventoryHistoryPopup] = React.useState(false);

  const handleActionSelect = (e) => {
    const value = e.target.value;
    if (value === 'movement') setShowStockMovementPopup(true);
    if (value === 'dishMovement') setShowDishMovementPopup(true);
    if (value === 'audit') setShowAuditingPopup(true);
    if (value === 'addStock') setShowAddStockEntryForm(true);
    if (value === 'inventoryHistory') setShowInventoryHistoryPopup(true);
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

    setAllStockItems(sorted);

    // Padrão inicial: mostrar apenas os não deletados (activityStatus false ou undefined)
    const filtered = sorted.filter(
      (item) =>
        item.operationSupplies === false &&
        (item.activityStatus === undefined || item.activityStatus === false)
    );

    setStock(filtered);
  };

  const disableStockItem = (item, permission) => {
    console.log('item a ser excluido   ', item);

    if (item) {
      setExcludeStockItem(item);
    }
    setShowWarningDeltePopup(true);
    if (permission) {
      setShowWarningDeltePopup(false);
      updateOrCreateKeyInDocument(
        'stock',
        excludeStockItem.id,
        'activityStatus',
        showDeleted ? false : true
      );
      // deleteData('stock', item.id);
      // setRefreshData((prev) => !prev);
      fetchStock();
    }
  };
  const editStockItem = (item) => {
    setObj(item);
    setShowEditForm(true);
  };

  const usageHistory = (item) => {
    setTitle(item.product);
    setEventLogData(item.UsageHistory);
    setShowAdjustmentRecords(true);
  };

  const toggleDeletedProducts = () => {
    const nextShowDeleted = !showDeleted;
    nextShowDeleted
      ? setSubTitle('Matéria Prima (Excluídas)')
      : setSubTitle('Matéria Prima');
    const filtered = allStockItems.filter(
      (item) =>
        item.operationSupplies === false && //true = insumo false = matéria prima
        (nextShowDeleted
          ? item.activityStatus === true //if it is or not avaiable
          : item.activityStatus === false || item.activityStatus === undefined)
    );

    setStock(filtered);
    setShowDeleted(nextShowDeleted);
  };

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
        <select onChange={handleActionSelect} defaultValue="">
          <option value="" disabled hidden>Ações de Estoque</option>
          <option value="movement">Movimentação de Estoque</option>
          <option value="dishMovement">Movimentação por pratos</option>
          <option value="addStock">Nova Entrada</option>
          <option value="audit">Auditoria</option>
          <option value="inventoryHistory">Histórico de inventários</option>
        </select>
        <h2>{subTitle}</h2>
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
                  <td onClick={() => usageHistory(item)} style={{ cursor: 'pointer' }} title="Ver Histórico de Custos e Ocorrências">
                    {item.product} {item.unitOfMeasurement} <span style={{ marginLeft: '8px', fontSize: '1.1rem' }}>🔍</span>
                  </td>
                  <td>R$ {Number(item.totalCost).toFixed(2)}</td>
                  <td>
                    {Number(item.totalVolume).toFixed(2)}
                    {item.unitOfMeasurement}
                  </td>
                  {showWarningDeletePopup && (
                    <DefaultComumMessage
                      msg={`Você está prestes a ${
                        showDeleted ? 'Restaurar' : 'Excluir'
                      } ${excludeStockItem.product}`}
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
                    {showDeleted ? 'Restaurar' : 'Excluir'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div
        className={style.containerBtnStockList}
        title={tooltips.trackStockProduct.toggleBtnAbleAndDisable}
      >
        <button
          className={style.btnChangeStockList}
          onClick={toggleDeletedProducts}
        >
          {showDeleted ? 'Itens Habilitados' : 'Itens Excluidos'}
        </button>
      </div>
    </div>
  );
};
export default TrackStockProduct;
