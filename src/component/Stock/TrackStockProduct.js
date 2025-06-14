import React from 'react';
import { getBtnData, updateOrCreateKeyInDocument } from '../../api/Api';
import style from '../../assets/styles/TrackStockProduct.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import EditFormStockProduct from './EditFormStockProduct';
import AdjustmentRecords from './AdjustmentRecords';
import { Link } from 'react-router-dom';
import Title from '../title';

const TrackStockProduct = () => {
  const [stock, setStock] = React.useState(null);
  const [allStockItems, setAllStockItems] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeStockItem, setExcludeStockItem] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [eventLogData, setEventLogData] = React.useState(null);
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [showAdjustmentRecords, setShowAdjustmentRecords] =
    React.useState(false);

  React.useEffect(() => {
    fetchStock();
  }, []);
  React.useEffect(() => {
    fetchStock();
  }, [refreshData]);

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

  const toggleDeletedProducts = () => {
    const nextShowDeleted = !showDeleted;

    const filtered = allStockItems.filter(
      (item) =>
        item.operationSupplies === false &&
        (nextShowDeleted
          ? item.activityStatus === true
          : item.activityStatus === false || item.activityStatus === undefined)
    );

    setStock(filtered);
    setShowDeleted(nextShowDeleted);
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
      setRefreshData((prev) => !prev);
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

  const alertMinimunAmount = (product, volume, minimum, cost) => {
    if (volume < minimum) {
      console.log(
        `O produto ${product} foi recusado porque o volume (${volume}) está menor que o mínimo (${minimum})`
      );
      return false;
    }
    if (volume === 0) {
      console.log(
        `O produto ${product} foi recusado porque o volume está igual a 0`
      );
      return false;
    }
    if (minimum === undefined) {
      console.log(
        `O produto ${product} foi recusado porque o mínimo está indefinido`
      );
      return false;
    }
    if (isNaN(cost)) {
      console.log(
        `O produto ${product} foi recusado porque o custo não é um número`
      );
      return false;
    }
    if (cost === undefined) {
      console.log(
        `O produto ${product} foi recusado porque o custo está indefinido`
      );
      return false;
    }
    if (cost <= 0) {
      console.log(
        `O produto ${product} foi recusado porque o custo (${cost}) é menor ou igual a 0`
      );
      return false;
    }
    return true;
  };

  return (
    <div className={style.containerTrackStockproduct}>
      {showEditForm && (
        <EditFormStockProduct
          fetchStock={fetchStock}
          obj={obj}
          setShowEditForm={setShowEditForm}
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
      <div className={style.tableStockContainer}>
        <table striped bordered hover>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Custo de Estoque</th>
              <th>Estoque em volume</th>
              <th>Quantidade de embalagens</th>
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
                    )
                      ? ''
                      : style.warning
                  }
                >
                  <td onClick={() => usageHistory(item)}>{item.product}</td>
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
                  <td>{Number(item.amount).toFixed(2)}</td>
                  <td
                    style={{ cursor: 'pointer' }}
                    onClick={() => editStockItem(item)}
                  >
                    Editar
                  </td>
                  <td
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
      <div className={style.containerBtnStockList}>
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
