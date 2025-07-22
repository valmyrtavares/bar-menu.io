import React from 'react';
import { getBtnData, updateOrCreateKeyInDocument } from '../../api/Api';
import style from '../../assets/styles/TrackStockProduct.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import EditFormStockProduct from './EditFormStockProduct';
import AdjustmentRecords from './AdjustmentRecords';
import { Link } from 'react-router-dom';
import { alertMinimunAmount } from '../../Helpers/Helpers';
import Title from '../title';

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
  const [tootleTooggleOfProducts, setToogleTypeOfProducts] =
    React.useState(true);
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [showAdjustmentRecords, setShowAdjustmentRecords] =
    React.useState(false);

  React.useEffect(() => {
    fetchStock();
  }, []);
  // React.useEffect(() => {
  //   fetchStock();
  // }, [refreshData]);

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

  const changeProductView = () => {
    setToogleTypeOfProducts((prev) => !prev);
    const filtered = allStockItems.filter(
      (item) => item.operationSupplies === tootleTooggleOfProducts
    );

    setStock(filtered);
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
      <div className={style.containerBtnView}>
        <button
          onClick={changeProductView}
          title="Esse botão serve para que o administrador possa ver
           todos os insumos ( produtos que não participam dos produtos vendidos) 
           ou todas as matérias primas (produtos que participam dos produtos vendidos) incluindo
        os disponívies e indisponíveis, por isso nessa categoria temos linhas vermelhas,
         mostrando os itens e insumos, indisponíveis (pintado de vermelho) e disponíveis (sem coloração)
         Observe que o titulo do botão muda conforme o uso"
        >
          {tootleTooggleOfProducts ? 'Insumos' : 'Matéria Prima'}
        </button>
      </div>
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
                    title="Aqui você pode editar os valores de um produto que não estejam corretos
                  deixando uma justificativa sobre as mudanças"
                    style={{ cursor: 'pointer' }}
                    onClick={() => editStockItem(item)}
                  >
                    Editar
                  </td>
                  <td
                    title="Esse botão alterna entre Excluir e Restaurar, dependendo da tela.
                  Se está na tela de itens que podem ser excluídos porque estão disponíveis o 
                  titulo do botão é Exluir e se estiver na tela de itens que já foram excluídos 
                  tem o titulo de Reaturar, para que voltem a ficar disponíveis"
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
        title="Esse botão alterna entre o itens que pertencem ao estoque mais não estão
      disponíveis no momento e os que estão disponíveis. Enfatizando que também nesse caso
      o título do botão alterna entre itens excluídos e itens habilitados"
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
