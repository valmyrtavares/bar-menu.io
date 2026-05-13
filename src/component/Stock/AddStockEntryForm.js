import React, { useEffect, useState, useContext } from 'react';
import Input from '../Input';
import style from '../../assets/styles/AddStockEntryForm.module.scss';
import CloseBtn from '../closeBtn';
import { db } from '../../config-firebase/firebase.js';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getBtnData, addItemToCollection } from '../../api/Api';
import { GlobalContext } from '../../GlobalContext';
import { checkUnavaiableRawMaterial } from '../../Helpers/Helpers.js';
import { UpdateMenuMessage } from '../Messages/UpdateMenuMessage.js';

const AddStockEntryForm = ({ setShowPopup, setRefreshData, obj }) => {
  const global = useContext(GlobalContext);
  const [loadingAvailableMenuDishes, setLoadingAvailableMenuDishes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  useEffect(() => {
    const fetchLists = async () => {
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
    };
    fetchLists();
  }, []);

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
      setItem(prev => ({
        ...prev,
        idProduct: selected.idProduct || selected.id,
        product: selected.name,
        operationSupplies: false,
        unitOfMeasurement: selected.unitOfMeasurement || '',
        minimumAmount: selected.minimumAmount || 0,
      }));
    } else {
      setItem(prev => ({ ...prev, [id]: value }));
    }
  };

  const addItem = () => {
    if (!item.product) return alert('Selecione um produto.');
    if (item.amount <= 0 || item.CostPerUnit <= 0) return alert('Quantidade e custo devem ser maiores que zero.');
    if (item.volumePerUnit <= 0) return alert('Volume deve ser maior que zero.');

    setItemArrayList(prev => [...prev, { ...item, totalVolume: item.volumePerUnit * item.amount }]);
    setItem({
      product: '', amount: 0, CostPerUnit: 0, totalCost: 0, volumePerUnit: 0,
      currentAmountProduct: 0, idProduct: '', totalVolume: 0, operationSupplies: false, unitOfMeasurement: '',
    });
  };

  const deleteItem = (idx) => setItemArrayList(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.provider || !form.paymentDate || !form.account) return alert('Preencha todos os campos obrigatórios.');
    if (itemArrayList.length === 0) return alert('Adicione pelo menos um item ao estoque.');

    setIsSubmitting(true);
    try {
      // 1. Update Stock
      await handleStock(itemArrayList, form.account, form.paymentDate);
      
      const updatedStockData = await getBtnData('stock');
      handleWarningCleanup(updatedStockData, itemArrayList);
      
      // 2. Save to Outgoing
      const finalData = { ...form, dueDate: form.paymentDate }; // Sync dueDate for DB
      await addDoc(collection(db, 'outgoing'), finalData);

      setRefreshData(prev => !prev);
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
        const pack = Number(itemFinded.amount) + Number(currentItem.amount);
        const totalCost = Number(itemFinded.totalCost || 0) + Number(currentItem.totalCost);
        const totalVolume = Number(itemFinded.totalVolume || 0) + Number(currentItem.totalVolume);
        const costPerUnit = totalVolume > 0 ? Number((totalCost / totalVolume).toFixed(2)) : 0;

        const updateData = {
          ...itemFinded,
          amount: pack,
          totalCost,
          totalVolume,
          CostPerUnit: costPerUnit,
          UsageHistory: [...(itemFinded.UsageHistory || []), {
            date: paymentDate, inputProduct: currentItem.totalVolume, cost: currentItem.totalCost,
            package: pack, unit: currentItem.unitOfMeasurement, ContentsInStock: totalVolume,
            totalResourceInvested: totalCost, category: account
          }]
        };
        await updateDoc(doc(db, 'stock', itemFinded.id), updateData);
        setLoadingAvailableMenuDishes(true);
        const res = await checkUnavaiableRawMaterial(itemFinded.id);
        setLoadingAvailableMenuDishes(res || false);
      } else {
        const newRecord = {
          ...currentItem,
          UsageHistory: [{
            date: paymentDate, inputProduct: currentItem.totalVolume, cost: currentItem.totalCost,
            package: currentItem.amount, unit: currentItem.unitOfMeasurement, ContentsInStock: currentItem.totalVolume,
            totalResourceInvested: currentItem.totalCost, category: account
          }]
        };
        const newDoc = await addDoc(collection(db, 'stock'), newRecord);
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
        <h1>Nova Entrada de Estoque</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={style.topFields}>
          <div className={`${style.field} ${style.providerField}`}>
            <label>Fornecedor</label>
            <select id="provider" required onChange={handleChange} value={form.provider}>
              <option value="">Selecione...</option>
              {providerList?.map((p, i) => <option key={i} value={p.provider}>{p.name}</option>)}
            </select>
          </div>
          <div className={style.smallField}>
            <Input id="account" required label="Nota Fiscal" value={form.account} type="text" onChange={handleChange} />
          </div>
          <div className={style.smallField}>
            <Input id="paymentDate" required label="Data Pagamento" value={form.paymentDate} type="date" onChange={handleChange} />
          </div>
          <div className={style.smallField}>
            <Input id="value" label="Valor Total" value={form.value} type="number" readOnly className={style.readOnlyInput} />
          </div>
          <div className={style.fullWidth}>
            <Input id="paymentProof" label="Link do Comprovante (PDF)" value={form.paymentProof} type="text" onChange={handleChange} />
          </div>
        </div>

        <fieldset className={style.itemsFieldset}>
          <legend>ADICIONAR ITEM</legend>
          <div className={style.itemsGrid}>
            <div className={`${style.field} ${style.productField}`}>
              <label>Produto</label>
              <select id="product" value={productList?.findIndex(p => p.name === item.product)} onChange={handleItemChange}>
                <option value="">Selecione...</option>
                {productList?.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
              </select>
            </div>
            <div className={style.numberField}>
              <Input id="amount" label="Qtd Volumes" value={item.amount} type="number" onChange={handleItemChange} />
            </div>
            <div className={style.numberField}>
              <Input id="CostPerUnit" label="Custo Vol" value={item.CostPerUnit} type="number" onChange={handleItemChange} />
            </div>
            <div className={style.numberField}>
              <Input id="totalCost" label="Custo Total" value={item.totalCost} type="number" readOnly className={style.readOnlyInput} />
            </div>
            <div className={style.numberField}>
              <Input id="volumePerUnit" label="Qtd Volume" value={item.volumePerUnit} type="number" onChange={handleItemChange} />
            </div>
            <button type="button" onClick={addItem} className={style.addItemBtn}>ADICIONAR</button>
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
            {isSubmitting ? 'ENVIANDO...' : 'ENVIAR ENTRADA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStockEntryForm;
