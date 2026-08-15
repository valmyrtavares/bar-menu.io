import React, { useEffect, useState, useContext } from 'react';
import Input from '../Input';
import style from '../../assets/styles/AddStockEntryForm.module.scss';
import CloseBtn from '../closeBtn';
import { db } from '../../config-firebase/firebase.js';
import { collection, doc } from 'firebase/firestore';
import { addDoc, updateDoc } from '../../api/FirestoreInterceptor';
import { getBtnData, logStockUsage, registerDailyStockMovement, updateStockLogEntry, deleteStockLogEntry } from '../../api/Api';
import { GlobalContext } from '../../GlobalContext';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers.js';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage.js';
import { tooltips } from '../../constants/tooltips.js';

const AddStockEntryForm = ({ setShowPopup, setRefreshData, obj, editingLog = null, onLogDeleted = null, onLogUpdated = null }) => {
  const global = useContext(GlobalContext);
  const [loadingAvailableMenuDishes, setLoadingAvailableMenuDishes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    name: 'Entrada de Estoque',
    value: 0,
    dueDate: '',
    paymentDate: '',
    category: 'variable',
    account: '',
    provider: '',
    items: [],
    confirmation: 0,
    paymentProof: '',
    entryType: 'stock',
  });

  const [item, setItem] = useState({
    product: '',
    amount: 0,
    CostPerUnit: 0,
    totalCost: 0,
    volumePerUnit: 0,
    currentAmountProduct: 0,
    idProduct: '',
    totalVolume: 0,
    operationSupplies: false,
    unitOfMeasurement: '',
  });

  const [itemArrayList, setItemArrayList] = useState([]);
  const [productList, setProductList] = useState(null);
  const [providerList, setProviderList] = useState(null);

  const fetchLists = React.useCallback(async () => {
    const [dataProduct, dataProvider] = await Promise.all([
      getBtnData('product'),
      getBtnData('provider'),
    ]);
    if (dataProduct) {
      // Only Raw Materials
      const filtered = dataProduct.filter(p => p.operationSupplies === false || p.operationSupplies === undefined || p.operationSupplies === null);
      setProductList(filtered.sort((a, b) => a.name.localeCompare(b.name)));
    }
    if (dataProvider) {
      setProviderList(dataProvider.sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, []);

  useEffect(() => {
    fetchLists();

    const handleFocusOrStorage = (e) => {
      if (!e || e.type === 'focus' || e.key === 'product_registered_event') {
        fetchLists();
      }
    };

    window.addEventListener('focus', handleFocusOrStorage);
    window.addEventListener('storage', handleFocusOrStorage);

    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('product_updates_channel');
      channel.onmessage = (msg) => {
        if (msg.data === 'product_updated') {
          fetchLists();
        }
      };
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrStorage);
      window.removeEventListener('storage', handleFocusOrStorage);
      if (channel) channel.close();
    };
  }, [fetchLists]);

  const handleOpenRegisterProduct = () => {
    window.open('/admin/expenses?openPopup=registerProduct', '_blank');
  };

  useEffect(() => {
    if (editingLog) {
      const loadStockItemAndInit = async () => {
        const rawDate = editingLog.date ? editingLog.date.split(' - ')[0] : '';
        let formattedDate = rawDate;
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }

        const totalCost = Number(editingLog.cost || editingLog.totalResourceInvested || 0);
        const inputVol = Number(editingLog.inputProduct || editingLog.entrada || 0);

        let packAmount = editingLog.entryAmount !== undefined ? Number(editingLog.entryAmount) : 0;
        let volPerUnit = editingLog.entryVolumePerUnit !== undefined ? Number(editingLog.entryVolumePerUnit) : 0;

        if (packAmount === 0 || volPerUnit === 0) {
          // Buscar volumePerUnit do estoque para converter o volume em pacotes corretos (fallback)
          let dbVolPerUnit = 1;
          if (editingLog.stockId) {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../../config-firebase/firebase.js');
            const stockRef = doc(db, 'stock', editingLog.stockId);
            const stockSnap = await getDoc(stockRef);
            if (stockSnap.exists()) {
              const sData = stockSnap.data();
              dbVolPerUnit = Number(sData.volumePerUnit) > 0 ? Number(sData.volumePerUnit) : 1;
            }
          }
          volPerUnit = dbVolPerUnit;
          packAmount = volPerUnit > 0 ? Math.round(inputVol / volPerUnit) : 1;
          if (packAmount <= 0) packAmount = 1;
        }

        const costPerUnit = packAmount > 0 ? Number((totalCost / packAmount).toFixed(2)) : totalCost;

        setForm(prev => ({
          ...prev,
          category: 'variable',
          paymentDate: formattedDate,
          account: editingLog.category || '',
          provider: editingLog.provider || '',
          value: 0,
          confirmation: 0,
          paymentProof: editingLog.paymentProof || '',
        }));

        const prodName = editingLog.productName || editingLog.product || obj?.product || '';

        const initialItem = {
          product: prodName,
          amount: packAmount,
          CostPerUnit: costPerUnit,
          totalCost: totalCost,
          volumePerUnit: volPerUnit,
          totalVolume: inputVol,
          operationSupplies: false,
          unitOfMeasurement: editingLog.unit || 'Kg',
        };

        setItem(initialItem);
        setItemArrayList([]);
      };

      loadStockItemAndInit();
    }
  }, [editingLog, obj]);

  useEffect(() => {
    let totalItemsCost = itemArrayList.reduce((acc, i) => acc + i.totalCost, 0);
    setForm(prev => ({ 
      ...prev, 
      items: itemArrayList, 
      value: totalItemsCost,
      confirmation: totalItemsCost 
    }));
  }, [itemArrayList]);

  useEffect(() => {
    if (item.CostPerUnit !== 0 && item.amount !== 0) {
      setItem(prev => ({ ...prev, totalCost: prev.CostPerUnit * prev.amount }));
    }
  }, [item.CostPerUnit, item.amount]);

  useEffect(() => {
    if (item.volumePerUnit !== 0 && item.amount !== 0) {
      setItem(prev => ({ ...prev, totalVolume: prev.volumePerUnit * prev.amount }));
    }
  }, [item.volumePerUnit, item.amount]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleItemChange = (e) => {
    const { id, value } = e.target;
    if (id === 'product') {
      const selected = productList[value];
      if (selected) {
        setItem(prev => ({
          ...prev,
          idProduct: selected.idProduct || '',
          product: selected.name,
          unitOfMeasurement: selected.unitOfMeasurement || '',
          minimumAmount: selected.minimumAmount || 0,
        }));
      } else {
        setItem(prev => ({
          ...prev,
          idProduct: '',
          product: '',
          unitOfMeasurement: '',
        }));
      }
    } else {
      setItem(prev => ({ ...prev, [id]: value }));
    }
  };

  const addItem = () => {
    const targetProduct = item.product || (editingLog ? (editingLog.productName || editingLog.product || obj?.product || '') : '');
    if (!targetProduct) return alert('Selecione um produto.');
    if (Number(item.amount) <= 0 || Number(item.CostPerUnit) <= 0) return alert('Quantidade e custo devem ser maiores que zero.');
    if (Number(item.volumePerUnit) <= 0) return alert('Volume deve ser maior que zero.');

    const newItemObj = {
      ...item,
      product: targetProduct,
      amount: Number(item.amount),
      CostPerUnit: Number(item.CostPerUnit),
      totalCost: Number(item.totalCost || (item.amount * item.CostPerUnit)),
      volumePerUnit: Number(item.volumePerUnit),
      totalVolume: Number(item.volumePerUnit * item.amount),
    };

    if (editingLog) {
      setItemArrayList([newItemObj]);
    } else {
      setItemArrayList(prev => [...prev, newItemObj]);
      setItem({
        product: '', amount: 0, CostPerUnit: 0, totalCost: 0, volumePerUnit: 0,
        currentAmountProduct: 0, idProduct: '', totalVolume: 0, operationSupplies: false, unitOfMeasurement: '',
      });
    }
  };

  const formatPaymentDateWithCurrentTime = (dateStr) => {
    if (!dateStr) return '';
    let day, month, year;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      day = parts[0];
      month = parts[1];
      year = parts[2];
    } else {
      return dateStr;
    }
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const deleteItem = (idx) => setItemArrayList(prev => prev.filter((_, i) => i !== idx));

  const handleDeleteEntry = async () => {
    if (!editingLog) return;
    setIsDeleting(true);
    try {
      const success = await deleteStockLogEntry(editingLog.id || editingLog.logId, editingLog.stockId);
      if (success) {
        await registerDailyStockMovement('Exclusão de Entrada de Estoque');
        if (onLogDeleted) onLogDeleted();
        setShowPopup(false);
      } else {
        alert('Erro ao excluir a entrada de estoque.');
      }
    } catch (err) {
      console.error('Erro ao excluir entrada:', err);
      alert('Ocorreu um erro ao excluir a entrada.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (editingLog) {
      setIsSubmitting(true);
      try {
        const currentItem = itemArrayList[0] || item;
        const newVolume = Number(currentItem.amount) * Number(currentItem.volumePerUnit);
        const newCost = Number(currentItem.amount) * Number(currentItem.CostPerUnit);
        const newPackage = Number(currentItem.amount);

        const success = await updateStockLogEntry(
          editingLog.id || editingLog.logId,
          editingLog.stockId,
          newVolume,
          newCost,
          newPackage
        );

        if (success) {
          await registerDailyStockMovement('Edição de Entrada de Estoque');
          if (onLogUpdated) onLogUpdated();
          setShowPopup(false);
        } else {
          alert('Erro ao atualizar a entrada de estoque.');
        }
      } catch (err) {
        console.error('Erro ao atualizar log:', err);
        alert('Ocorreu um erro ao atualizar a entrada.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!form.provider || !form.paymentDate || !form.account) return alert('Preencha todos os campos obrigatórios.');
    if (itemArrayList.length === 0) return alert('Adicione pelo menos um item ao estoque.');

    setIsSubmitting(true);
    try {
      // 1. Update Stock
      const formattedDate = formatPaymentDateWithCurrentTime(form.paymentDate);
      await handleStock(itemArrayList, form.account, formattedDate);
      
      const updatedStockData = await getBtnData('stock');
      handleWarningCleanup(updatedStockData, itemArrayList);
      
      // 2. Save to Outgoing
      const finalData = { ...form, dueDate: form.paymentDate }; // Sync dueDate for DB
      await addDoc(collection(db, 'outgoing'), finalData);

      await registerDailyStockMovement('Entrada de Estoque');

      if (setRefreshData) setRefreshData(prev => !prev);
      setShowPopup(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWarningCleanup = (data, itemsStock) => {
    const stored = JSON.parse(localStorage.getItem('warningAmountMessage')) || [];
    data.forEach((item) => {
      const match = itemsStock.find((i) => i.idProduct === item.idProduct);
      if (match && item.totalVolume > item.minimumAmount) {
        const msgIndex = stored.findIndex(
          (msg) => typeof msg === 'string' && msg.includes(`produto ${item.product}`)
        );
        if (msgIndex !== -1) {
          stored[msgIndex] = ''; // clear specific product warning
        }
      }
    });
    localStorage.setItem('warningAmountMessage', JSON.stringify(stored));
    global.setWarningLowRawMaterial(stored);
  };

  // Reusing existing handleStock logic (simplified for clarity here)
  const handleStock = async (itemsStock, account, paymentDate) => {
    const data = await getBtnData('stock');
    for (const currentItem of itemsStock) {
      const itemFinded = data?.find(s => s.product === currentItem.product);
      if (itemFinded) {
        const pack = Math.max(0, Number(itemFinded.amount) + Number(currentItem.amount));
        let totalCost = Number(itemFinded.totalCost || 0) + Number(currentItem.totalCost);
        let totalVolume = Number(itemFinded.totalVolume || 0) + Number(currentItem.totalVolume);

        if (totalVolume <= 0) {
          totalVolume = 0;
          totalCost = 0;
        } else if (totalCost < 0) {
          totalCost = 0;
        }

        const costPerUnit = totalVolume > 0 ? Number((totalCost / totalVolume).toFixed(2)) : 0;

        const updateData = {
          ...itemFinded,
          amount: pack,
          totalCost,
          totalVolume,
          CostPerUnit: costPerUnit,
        };
        
        if (costPerUnit > 0) {
          updateData.lastUnitCost = costPerUnit;
        } else if (itemFinded.lastUnitCost) {
          updateData.lastUnitCost = itemFinded.lastUnitCost;
        }
        await updateDoc(doc(db, 'stock', itemFinded.id), updateData);
        await logStockUsage(itemFinded.id, {
          date: paymentDate, inputProduct: currentItem.totalVolume, cost: currentItem.totalCost,
          package: pack, unit: currentItem.unitOfMeasurement, ContentsInStock: totalVolume,
          totalResourceInvested: totalCost, category: account,
          previousVolume: Number(itemFinded.totalVolume || 0),
          previousCost: Number(itemFinded.totalCost || 0),
          entryVolumePerUnit: Number(currentItem.volumePerUnit),
          entryAmount: Number(currentItem.amount),
          product: currentItem.product || itemFinded.product || '',
          productName: currentItem.product || itemFinded.product || '',
        });
        setLoadingAvailableMenuDishes(true);
        const res = await checkUnavaiableRawMaterial(itemFinded.id);
        setLoadingAvailableMenuDishes(res || false);
      } else {
        const newCostPerUnit = currentItem.totalVolume > 0 ? Number((currentItem.totalCost / currentItem.totalVolume).toFixed(2)) : 0;
        const newRecord = {
          ...currentItem,
          CostPerUnit: newCostPerUnit,
          lastUnitCost: newCostPerUnit > 0 ? newCostPerUnit : 0,
        };
        const newDoc = await addDoc(collection(db, 'stock'), newRecord);
        await logStockUsage(newDoc.id, {
          date: paymentDate, inputProduct: currentItem.totalVolume, cost: currentItem.totalCost,
          package: currentItem.amount, unit: currentItem.unitOfMeasurement, ContentsInStock: currentItem.totalVolume,
          totalResourceInvested: currentItem.totalCost, category: account,
          previousVolume: 0,
          previousCost: 0,
          entryVolumePerUnit: Number(currentItem.volumePerUnit),
          entryAmount: Number(currentItem.amount),
          product: currentItem.product,
          productName: currentItem.product,
        });
        setLoadingAvailableMenuDishes(true);
        const res = await checkUnavaiableRawMaterial(newDoc.id);
        setLoadingAvailableMenuDishes(res || false);
      }
    }
  };

  return (
    <div className={style.containerAddStockEntry}>
      <CloseBtn setClose={setShowPopup} />
      <div className={style.header}>
        {loadingAvailableMenuDishes && <UpdateMenuMessage />}
        <h1>{editingLog ? 'Editar / Corrigir Entrada de Estoque' : 'Nova Entrada de Estoque'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={style.topFields}>
          <div className={`${style.field} ${style.providerField}`} title={tooltips.addStockEntryForm.provider}>
            <label title={tooltips.addStockEntryForm.provider}>Fornecedor</label>
            <select
              id="provider"
              required
              onChange={handleChange}
              value={form.provider}
              disabled={!!editingLog}
              style={editingLog ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
              title={tooltips.addStockEntryForm.provider}
            >
              <option value="">Selecione...</option>
              {providerList?.map((p, i) => <option key={i} value={p.provider}>{p.name}</option>)}
            </select>
          </div>
          <div className={style.smallField}>
            <Input
              id="account"
              required
              label="Nota Fiscal"
              value={form.account}
              type="text"
              onChange={handleChange}
              readOnly={!!editingLog}
              style={editingLog ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
              title={tooltips.addStockEntryForm.account}
            />
          </div>
          <div className={style.smallField}>
            <Input
              id="paymentDate"
              required
              label="Data Pagamento"
              value={form.paymentDate}
              type="date"
              onChange={handleChange}
              readOnly={!!editingLog}
              style={editingLog ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div className={style.smallField}>
            <Input
              id="value"
              label="Valor Total"
              value={form.value}
              type="number"
              readOnly
              className={style.readOnlyInput}
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
              title={tooltips.addStockEntryForm.value}
            />
          </div>
          <div className={style.fullWidth}>
            <Input
              id="paymentProof"
              label="Link do Comprovante (PDF)"
              value={form.paymentProof}
              type="text"
              onChange={handleChange}
              readOnly={!!editingLog}
              style={editingLog ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
              title={tooltips.addStockEntryForm.paymentProof}
            />
          </div>
        </div>

        <fieldset className={style.itemsFieldset}>
          <legend>ADICIONAR ITEM</legend>
          <div className={style.itemsGrid}>
            <div className={`${style.field} ${style.productField}`} title={tooltips.addStockEntryForm.product}>
              <label title={tooltips.addStockEntryForm.product}>Produto</label>
              <select
                id="product"
                value={productList?.findIndex(p => p.name.trim().toLowerCase() === (item.product || '').trim().toLowerCase())}
                onChange={handleItemChange}
                disabled={!!editingLog}
                style={editingLog ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                title={tooltips.addStockEntryForm.product}
              >
                <option value="">{item.product || 'Selecione...'}</option>
                {productList?.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
              </select>
            </div>
            <div className={style.numberField}>
              <Input
                id="amount"
                label="Qtd Volumes"
                value={item.amount}
                type="number"
                onChange={handleItemChange}
                title={tooltips.addStockEntryForm.amount}
              />
            </div>
            <div className={style.numberField}>
              <Input
                id="CostPerUnit"
                label="Custo Vol"
                value={item.CostPerUnit}
                type="number"
                onChange={handleItemChange}
                title={tooltips.addStockEntryForm.CostPerUnit}
              />
            </div>
            <div className={style.numberField}>
              <Input
                id="totalCost"
                label="Custo Total"
                value={item.totalCost}
                type="number"
                readOnly
                className={style.readOnlyInput}
                title={tooltips.addStockEntryForm.totalCost}
              />
            </div>
            <div className={style.numberField}>
              <Input
                id="volumePerUnit"
                label="Qtd Volume"
                value={item.volumePerUnit}
                type="number"
                onChange={handleItemChange}
                unitText={item.unitOfMeasurement}
                title={tooltips.addStockEntryForm.volumePerUnit}
              />
            </div>
            <button type="button" onClick={addItem} className={style.addItemBtn}>
              ADICIONAR
            </button>
          </div>
        </fieldset>

        <div className={style.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Custo Vol</th>
                <th>Total</th>
                <th>Volume</th>
                <th>Remover</th>
              </tr>
            </thead>
            <tbody>
              {itemArrayList.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.product}</td>
                  <td>{it.amount}</td>
                  <td>R$ {it.CostPerUnit}</td>
                  <td>R$ {it.totalCost}</td>
                  <td>{it.volumePerUnit} {it.unitOfMeasurement}</td>
                  <td onClick={() => deleteItem(idx)} className={style.deleteIcon}>X</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={style.footer}>
          <button type="submit" className={style.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'ENVIANDO...' : editingLog ? 'ENVIAR EDIÇÃO' : 'ENVIAR ENTRADA'}
          </button>
          {editingLog ? (
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className={style.deleteEntryBtnFooter}
              title="Excluir este lançamento de entrada de estoque"
            >
              Excluir entrada
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenRegisterProduct}
              className={style.registerNotRegisteredBtnFooter}
              title="Cadastrar produto não encontrado em outra aba"
            >
              cadastrar produto<br />não encontrado
            </button>
          )}
        </div>
      </form>

      {showConfirmDelete && (
        <div className={style.confirmOverlay}>
          <div className={style.confirmModal}>
            <h3>Excluir Entrada de Estoque</h3>
            <p>
              Tem certeza que deseja excluir esta entrada de estoque?
              <br />
              Esta ação removerá o lançamento do histórico e estornará os saldos do produto.
            </p>
            <div className={style.confirmBtnRow}>
              <button
                type="button"
                className={style.cancelConfirmBtn}
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={style.continueConfirmBtn}
                onClick={handleDeleteEntry}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStockEntryForm;
