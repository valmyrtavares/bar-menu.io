import React from 'react';
import { getBtnData, deleteData } from '../../api/Api';
import products from '../../assets/styles/TrackStockProduct.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import EditFormStockProduct from './EditFormStockProduct';
import AdjustmentRecords from './AdjustmentRecords';
import { Link } from 'react-router-dom';
import Title from '../title';

const TrackStockProduct = () => {
  const [stock, setStock] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeStockItem, setExcludeStockItem] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [eventLogData, setEventLogData] = React.useState(null);
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
    const sortedData = data.sort((a, b) => a.product.localeCompare(b.product));
    setStock(sortedData);
  };

  const deleteStockItem = (item, permission) => {
    setExcludeStockItem(item);
    setShowWarningDeltePopup(true);
    if (permission && excludeStockItem.product === item.product) {
      setShowWarningDeltePopup(false);
      deleteData('stock', item.id);
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

  return (
    <div className={products.containerTrackStockproduct}>
      {showEditForm && (
        <EditFormStockProduct
          fetchStock={fetchStock}
          obj={obj}
          setShowEditForm={setShowEditForm}
        />
      )}
      <div className={products.containerAdjustmentScreen}>
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
      <table striped bordered hover>
        <tr>
          <th>Produto</th>
          <th>Custo de Estoque</th>
          <th>Estoque em volume</th>
          <th>Quantidade de embalagens</th>
          <th>Editar</th>
        </tr>
        {stock &&
          stock.length > 0 &&
          stock.map((item, index) => (
            <tr key={index}>
              <td onClick={() => usageHistory(item)}>{item.product}</td>
              <td>R$ {Number(item.totalCost).toFixed(2)}</td>
              <td>
                {Number(item.totalVolume).toFixed(2)}
                {item.unitOfMeasurement}
              </td>
              {showWarningDeletePopup && (
                <DefaultComumMessage
                  msg={`Você está prestes a excluir ${excludeStockItem.product}`}
                  item={excludeStockItem}
                  onConfirm={deleteStockItem}
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
            </tr>
          ))}
      </table>
    </div>
  );
};
export default TrackStockProduct;
