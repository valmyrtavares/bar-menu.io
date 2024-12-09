import React from 'react';
import { getBtnData, deleteData } from '../../api/Api';
import DefaultComumMessage from '../Messages/DefaultComumMessage';

const TrackStockProduct = () => {
  const [stock, setStock] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeStockItem, setExcludeStockItem] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);

  React.useEffect(() => {
    fetchStock();
  }, []);
  React.useEffect(() => {
    fetchStock();
  }, [refreshData]);

  const fetchStock = async () => {
    const data = await getBtnData('stock');
    setStock(data);
  };

  const deleteStockItem = (item, permission) => {
    debugger;
    setExcludeStockItem(item);
    setShowWarningDeltePopup(true);
    if (permission && excludeStockItem.product === item.product) {
      setShowWarningDeltePopup(false);
      deleteData('stock', item.id);
      setRefreshData((prev) => !prev);
    }
  };

  return (
    <div>
      <h1> Tela de estoque</h1>;
      <table striped bordered hover>
        <tr>
          <th>Produto</th>
          <th>Custo de Estoque</th>
          <th>Estoque em volume</th>
          <th>Excluir</th>
        </tr>
        {stock &&
          stock.length > 0 &&
          stock.map((item, index) => (
            <tr>
              <td>{item.product}</td>
              <td>R$ {item.totalCost},00</td>
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
              <td onClick={() => deleteStockItem(item, false)}>X</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default TrackStockProduct;
