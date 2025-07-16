import React from 'react';
import edit from '../../assets/styles/EditFormStockProduct.module.scss';
import CloseBtn from '../closeBtn';
import Input from '../Input';
import { getBtnData } from '../../api/Api';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../config-firebase/firebase';

const EditFormStockProduct = ({ obj, setShowEditForm, fetchStock }) => {
  const [stockProductObj, setStockProductObj] = React.useState({
    CostPerUnit: Number(obj.CostPerUnit),
    amount: Number(obj.amount),
    product: obj.product,
    totalCost: Number(obj.totalCost),
    totalVolume: Number(obj.totalVolume),
    unitOfMeasurement: obj.unitOfMeasurement,
    volumePerUnit: Number(obj.volumePerUnit),
    minimumAmount: Number(obj.minimumAmount),
    noteReasonsEditingProduct: '',
    id: obj.id,
  });
  const [noteReasonsEditingProduct, setNoteReasonsEditingProduct] =
    React.useState('');

  const db = getFirestore(app);

  const updateNoteEdit = () => {
    setStockProductObj((prevForm) => ({
      ...prevForm,
      noteReasonsEditingProduct: noteReasonsEditingProduct,
    }));
  };

  const handleStock = async (
    itemsStock,
    account = 'Editado',
    paymentDate = null
  ) => {
    if (!Array.isArray(itemsStock)) {
      itemsStock = [itemsStock]; // Coloca o objeto recebido em um array
    }

    if (!paymentDate) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é zero-based
      const year = today.getFullYear();
      paymentDate = `${day}/${month}/${year}`; //Cria a data no formato DD/MM/YYYY atual
    }

    const data = await getBtnData('stock'); // Obtém todos os registros existentes no estoque

    for (let i = 0; i < itemsStock.length; i++) {
      const currentItem = itemsStock[i];

      // Verifica se o item já existe no banco de dados
      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );
      if (itemFinded) {
        // Atualiza os valores de custo e volume totais
        const previousCost = itemFinded.totalCost;
        const previousVolume = itemFinded.totalVolume;
        const cost = account === 'Editado' ? 0 : currentItem.totalCost;
        const noteReasonsEditingProduct =
          account === 'Editado' ? currentItem.noteReasonsEditingProduct : '';
        const pack =
          account === 'Editado'
            ? Number(currentItem.amount)
            : Number(itemFinded.amount) + Number(currentItem.amount);
        const volume = account === 'Editado' ? 0 : currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;
        if (account !== 'Editado') {
          currentItem.totalCost =
            (currentItem.totalCost || 0) + (itemFinded.totalCost || 0);
          currentItem.totalVolume =
            (currentItem.totalVolume || 0) + (itemFinded.totalVolume || 0);
        }

        // Inicializa ou adiciona ao UsageHistory
        currentItem.UsageHistory = itemFinded.UsageHistory || [];

        currentItem.UsageHistory.push(
          stockHistoryList(
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
          )
        );
        console.log('Item atual  ', currentItem);

        // Atualiza o registro no banco de dados
        // const docRef = doc(db, 'stock', itemFinded.id);
        // await updateDoc(docRef, currentItem);
      } else {
        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
            0,
            currentItem.totalCost,
            currentItem.totalVolume
          ),
        ];
        // await addDoc(collection(db, 'stock'), currentItem);
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
    totalVolume
  ) => {
    const stockEventRegistration = {
      date: paymentDate,
      outputProduct: 0,
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
    };
    return stockEventRegistration;
  };

  const updateCost = (e) => {
    const { id, value } = e.target;
    if (id === 'totalVolume') {
      const newCost =
        obj.totalCost * (stockProductObj.totalVolume / obj.totalVolume);

      const newUnit =
        Number(stockProductObj.totalVolume) / Number(obj.volumePerUnit);

      setStockProductObj({
        ...stockProductObj,
        totalCost: newCost,
        amount: newUnit,
      });
    } else {
      setStockProductObj({
        ...stockProductObj,
        totalCost: value,
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    // const parsedValue = Number(value);
    setStockProductObj((prevForm) => ({
      ...prevForm,
      [id]: isNaN(value) ? 0 : value, // Fallback para valores inválidos
    }));
  };

  const addItem = async () => {
    try {
      await handleStock(stockProductObj);
      const docRef = doc(db, 'stock', stockProductObj.id);
      await updateDoc(docRef, stockProductObj); // Atualiza com os dados do estado "form"

      console.log('Documento atualizado com sucesso!');
      fetchStock();
      setShowEditForm(false);
    } catch (error) {
      console.error('Erro ao atualizar o documento:', error);
    }
  };
  return (
    <div className={edit.popupOverlay}>
      <div className={edit.containerEditStock}>
        <div className={edit.closeBtnRow}>
          <button
            className={edit.closeBtn}
            type="button"
            onClick={() => setShowEditForm(false)}
          >
            X
          </button>
        </div>

        <div className={edit.titleRow}>
          <h2>{`${stockProductObj.product} - ${stockProductObj.unitOfMeasurement}`}</h2>
        </div>

        <div className={edit.inputGrid}>
          <div className={edit.field}>
            <Input
              id="totalVolume"
              autoComplete="off"
              className="num"
              label="Volume Total"
              value={stockProductObj.totalVolume}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>

          <div className={edit.field}>
            <Input
              id="totalCost"
              autoComplete="off"
              className="num"
              label="Custo Total"
              value={stockProductObj.totalCost}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>

          <div className={edit.field}>
            <Input
              id="minimumAmount"
              autoComplete="off"
              className="num"
              label="Volume Mínimo"
              value={stockProductObj.minimumAmount}
              type="text"
              onChange={handleChange}
              onBlur={updateCost}
            />
          </div>

          <div className={edit.field}>
            <label htmlFor="minimumAmountNote">Nota sobre a edição</label>
            <textarea
              id="editAdminNote"
              className="num"
              value={noteReasonsEditingProduct || ''}
              onChange={(e) => setNoteReasonsEditingProduct(e.target.value)}
              autoComplete="off"
              rows={3}
              placeholder="Adicione uma observação sobre os motivos da sua edição"
              onBlur={updateNoteEdit}
            />
          </div>
        </div>

        <div className={edit.volumeRow}>
          <h3>Volume Total do Produto</h3>
          <p>
            {stockProductObj.totalVolume}
            {stockProductObj.unitOfMeasurement}
          </p>
        </div>

        <div className={edit.btnRow}>
          <button className={edit.addBtn} type="button" onClick={addItem}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
export default EditFormStockProduct;
