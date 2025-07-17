import React, { useEffect } from 'react';
import Input from '../../Input';
import style from '../../../assets/styles/AddExpensesForm.module.scss';
import CloseBtn from '../../closeBtn';
import ProductVolumeAdjustmentNote from './ProductVolumeAdjustmentNote';
import {
  getDocs,
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase';
import { getBtnData, addItemToCollection } from '../../../api/Api';

const AddExpensesForm = ({ setShowPopup, setRefreshData, obj }) => {
  const [form, setForm] = React.useState({
    name: '',
    value: 0,
    dueDate: '',
    paymentDate: '',
    expenseId: '',
    category: '',
    account: '',
    provider: '',
    confirmation: 0,
    items: [],
  });

  const [item, setItem] = React.useState({
    product: '',
    amount: 0,
    CostPerUnit: 0,
    totalCost: 0,
    volumePerUnit: 0,
    adjustmentExpenseNote: '',
    currentAmountProduct: 0,
    idProduct: '',
    totalVolume: 0,
    operationSupplies: false,
    unitOfMeasurement: '',
  });
  const [showItemsDetailsForm, setShowItemsDetailsForm] = React.useState(false);
  const [itemArrayList, setItemArrayList] = React.useState([]);
  const [productList, setProductList] = React.useState(null);
  const [providerList, setProviderList] = React.useState(null);
  const [expensesList, setExpensesList] = React.useState(null);
  const [note, setNote] = React.useState('');
  const [showPopupNote, setShowPopupNote] = React.useState(null);
  //const [currentAmountProduct, setCurrentAmountProduct] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const db = getFirestore(app);

  React.useEffect(() => {
    const fetchRegisterLists = async () => {
      const [dataProduct, dataProvider, dataExpenses] = await Promise.all([
        getBtnData('product'),
        getBtnData('provider'),
        getBtnData('expenses'),
      ]);

      if (dataProduct && dataProduct.length > 0) {
        setProductList(sortedData(dataProduct));
      }
      if (dataExpenses && dataExpenses.length > 0) {
        setExpensesList(sortedData(dataExpenses));
      }
      if (dataProvider && dataProvider.length > 0) {
        setProviderList(sortedData(dataProvider));
      }
    };
    fetchRegisterLists();
  }, []);

  const sortedData = (list) => {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  };

  React.useEffect(() => {
    if (itemArrayList) {
      let totalItemsCost = 0;
      itemArrayList.forEach((item) => {
        totalItemsCost += item.totalCost;
      });
      setTotal(totalItemsCost);
    }
    renderTableItem();
  }, [itemArrayList]);

  React.useEffect(() => {
    console.log('total     ', total);
    setForm({
      ...form,
      items: itemArrayList,
      value: total,
      confirmation: total,
    });
  }, [total]);

  React.useEffect(() => {
    if (obj) {
      setForm({
        name: obj.name || '',
        value: obj.value || 0,
        dueDate: obj.dueDate || '',
        paymentDate: obj.paymentDate || '',
        category: obj.category || '',
        confirmation: obj.confirmation || 0,
        expenseId: String(obj.expenseId || ''),
        account: obj.account || '',
        provider: obj.provider || '',
        items: obj.items || [],
      });

      if (obj.items && obj.items.length > 0) {
        setItemArrayList(obj.items);
        setShowItemsDetailsForm(true);
      }
    } else {
      setForm({
        name: '',
        value: 0,
        dueDate: '',
        paymentDate: '',
        category: '',
        confirmation: 0,
        expenseId: '',
        account: '',
        provider: '',
        items: [],
      });
    }
  }, [obj]);

  React.useEffect(() => {
    if (item.CostPerUnit !== 0 && item.amount !== 0) {
      setItem((prevItem) => ({
        ...prevItem,
        totalCost: prevItem.CostPerUnit * prevItem.amount,
      }));
    }
  }, [item.CostPerUnit, item.amount]);

  React.useEffect(() => {
    if (item.volumePerUnit !== 0 && item.amount !== 0) {
      setItem((prevItem) => ({
        ...prevItem,
        totalVolume: prevItem.volumePerUnit * prevItem.amount,
      }));
    }
  }, [item.volumePerUnit, item.amount]);

  React.useEffect(() => {
    if (showPopupNote !== true) {
      setItem({
        ...item,
        adjustmentExpenseNote: note,
      });
    }
  }, [showPopupNote]);

  const addItem = () => {
    if (item.product !== '') {
      setItem({
        ...item,
        totalVolume: item.volumePerUnit * item.amount,
      });

      setItemArrayList((prevArrayList) => [...prevArrayList, item]);
    } else {
      alert('Produto não foi selecionado. Por favor, selecione o produto.');
    }
    console.log('total ', total);
    setItem({
      product: '',
      amount: 0,
      CostPerUnit: 0,
      adjustmentExpenseNote: '',
      currentAmountProduct: '',
      totalCost: 0,
      volumePerUnit: 0,
      idProduct: '',
      totalVolume: 0,
      unitOfMeasurement: '',
    });
  };
  const deleteItem = (indexToRemove) => {
    setItemArrayList((prevArrayList) =>
      prevArrayList.filter((_, index) => index !== indexToRemove)
    );
  };

  const renderTableItem = () => {
    return (
      <div className={style.ContainerTableIngredients}>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Custo por unidade</th>
              <th>Custo Total</th>
              <th>Volume</th>
              <th>Unidade de medida</th>
              <th>Volume atual</th>
              <th>Nota</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {itemArrayList &&
              itemArrayList.length > 0 &&
              itemArrayList.map((requestItem, index) => (
                <tr key={index}>
                  <td>{requestItem.product}</td>
                  <td>{requestItem.amount}</td>
                  <td>{requestItem.CostPerUnit}</td>
                  <td>{requestItem.totalCost}</td>
                  <td>{requestItem.volumePerUnit}</td>
                  <td>{requestItem.unitOfMeasurement}</td>
                  <td>{requestItem.currentAmountProduct}</td>
                  <td title={requestItem.adjustmentExpenseNote}>
                    {requestItem.adjustmentExpenseNote ? 'nota' : 'sem nota'}
                  </td>
                  <td onClick={() => deleteItem(index)}>X</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleStock = async (itemsStock, account = '000', paymentDate) => {
    console.log('objeto recebido   ', itemsStock);

    const data = await getBtnData('stock'); // Obtém todos os registros existentes no estoque

    for (let i = 0; i < itemsStock.length; i++) {
      const currentItem = itemsStock[i];

      // Verifica se o item já existe no banco de dados
      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );
      if (itemFinded) {
        // Atualiza os valores de custo e volume totais
        let previousCost = itemFinded.totalCost;
        const adjustmentExpenseNote = currentItem.adjustmentExpenseNote;
        let previousVolume = itemFinded.totalVolume;

        if (currentItem.currentAmountProduct) {
          previousVolume = Number(currentItem.currentAmountProduct);

          // Evita divisão por zero
          if (currentItem.totalVolume && currentItem.totalCost) {
            const unitCost = currentItem.totalCost / currentItem.totalVolume;
            previousCost = unitCost * currentItem.currentAmountProduct;
          } else {
            console.warn(
              'Não foi possível calcular o custo unitário: totalVolume ou totalCost ausentes ou inválidos.'
            );
          }
        }
        const cost = currentItem.totalCost;
        const pack = Number(itemFinded.amount) + Number(currentItem.amount);
        const volume = currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;
        currentItem.totalCost += currentItem.currentAmountProduct
          ? previousCost
          : itemFinded.totalCost || 0;
        currentItem.totalVolume += currentItem.currentAmountProduct
          ? previousVolume
          : itemFinded.totalVolume || 0;

        // Inicializa ou adiciona ao UsageHistory
        currentItem.UsageHistory = itemFinded.UsageHistory || [];
        currentItem.operationSupplies =
          'operationSupplies' in itemsStock[i]
            ? itemsStock[i].operationSupplies
            : false;
        currentItem.UsageHistory.push(
          stockHistoryList(
            itemFinded,
            account,
            adjustmentExpenseNote,
            paymentDate,
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
        const docRef = doc(db, 'stock', itemFinded.id);
        await updateDoc(docRef, currentItem);
      } else {
        const previousCost = 0;
        const constpreviousVolume = 0;
        const cost = currentItem.totalCost;
        const pack = Number(currentItem.amount);
        const volume = currentItem.totalVolume;
        const unit = currentItem.unitOfMeasurement;

        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
            pack,
            cost,
            unit,
            volume,
            constpreviousVolume,
            previousCost,
            currentItem.totalCost,
            currentItem.totalVolume
          ),
        ];
        await addDoc(collection(db, 'stock'), currentItem);
      }
    }
  };

  const stockHistoryList = (
    item,
    account,
    adjustmentExpenseNote,
    paymentDate,
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
      package: pack,
      inputProduct: volume,
      cost: cost,
      adjustmentExpenseNote: adjustmentExpenseNote,
      previousVolume: previousVolume,
      previousCost: previousCost,
      ContentsInStock: totalVolume,
      totalResourceInvested: totalCost,
    };
    return stockEventRegistration;
  };

  // import { collection, addDoc } from 'firebase/firestore';
  // import { db } from './firebaseConfig';

  const distributeItemsToExpenseList = async (
    items,
    account,
    provider,
    paymentDate,
    expenseId
  ) => {
    if (obj || Object.keys(obj).length > 0) {
      console.warn('O objeto "obj" está vazio ou não possui valores.');
      return;
    }
    try {
      const itemsWithAdditionalData = items.map((item) => ({
        ...item,
        account,
        provider,
        paymentDate,
        expenseID: expenseId,
      }));
      console.log('Formato dos itens  ', itemsWithAdditionalData);
      const writePromises = itemsWithAdditionalData.map(async (item) => {
        await addItemToCollection('expenseItems', item);
      });

      await Promise.all(writePromises);
      console.log("Todos os itens foram adicionados à coleção 'stockItems'.");
    } catch (error) {
      console.error('Erro ao distribuir itens para o estoque:', error);
    }
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /** 1. Garante que cada item tenha account, provider, paymentDate, expenseId */
    const enrichedItems = form.items.map((item) => ({
      ...item,
      account: form.account,
      provider: form.provider,
      paymentDate: form.paymentDate,
      expenseId: form.expenseId,
    }));

    /** 2. Cria um novo objeto form sem mutar o state original */
    const dataToSave = { ...form, items: enrichedItems };

    /** 3. (Opcional) Se ainda usa handleStock ou distributeItemsToExpenseList */
    if (enrichedItems.length > 0) {
      handleStock(enrichedItems, form.account, form.paymentDate);
      // distributeItemsToExpenseList(enrichedItems, ...);
    }

    try {
      if (obj) {
        // --- Atualização ---
        const docRef = doc(db, 'outgoing', obj.id);
        await updateDoc(docRef, dataToSave);
        console.log('Documento atualizado com sucesso!');
      } else {
        // --- Criação ---
        await addDoc(collection(db, 'outgoing'), dataToSave);
        console.log('Documento criado com sucesso!');
      }

      /** 4. Pós‑salvamento: reset UI */
      setRefreshData((prev) => !prev);
      setShowPopup(false);
      setForm({
        name: '',
        value: 0,
        dueDate: '',
        paymentDate: '',
        category: '',
        confirmation: 0,
        expenseId: '',
        account: '',
        provider: '',
        items: [],
      });
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  };

  const handleChange = (e) => {
    let { id, value } = e.target;

    toggleFormItemsByExpenseType(id, value);

    if (id === 'name') {
      const selectedExpense = expensesList.find(
        (item) => item.humanId === Number(value)
      );

      if (selectedExpense) {
        setForm((prevForm) => ({
          ...prevForm,
          name: selectedExpense.name,
          expenseId: selectedExpense.humanId,
        }));
        return;
      }
    }

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const toggleFormItemsByExpenseType = (id, value) => {
    if (id === 'name') {
      const selectedExpense = expensesList.filter(
        (item) => item.humanId === Number(value)
      );
      if (selectedExpense[0].multiply === 'composto') {
        setShowItemsDetailsForm(true);
      } else {
        setShowItemsDetailsForm(false);
      }
    }
  };

  const handleItemChange = (e) => {
    const { id, value } = e.target;

    let selectedProduct = {};
    if (id === 'product') {
      selectedProduct = productList[value]; // Acesse o produto selecionado pelo índice
      console.log('Produto selecionado:', selectedProduct);

      setItem((prevForm) => ({
        ...prevForm,
        idProduct: selectedProduct.idProduct, // Define o ID do produto
        product: selectedProduct ? selectedProduct.name : '', // Define o nome do produto
        operationSupplies: selectedProduct.operationSupplies ? true : false,
        unitOfMeasurement: selectedProduct
          ? selectedProduct.unitOfMeasurement
          : '', // Define a unidade de medida
      }));
      return;
    } else {
      if (id === 'amount' && item.unitOfMeasurement === 'un') {
        console.log(item.unitOfMeasurement);
        setItem((prevForm) => ({
          ...prevForm,
          [id]: value,
          volumePerUnit: 1,
        }));
        return;
      }
      // Comportamento genérico para outros inputs
      setItem((prevForm) => ({
        ...prevForm,
        [id]: value,
      }));
    }
  };
  const handleFocus = () => {
    console.log('To aqui');
  };
  const checkCurrentValue = () => {
    if (item.currentAmountProduct !== '') {
      setShowPopupNote(true);
    }
  };

  return (
    <div className={style.containerAddExpensesForm}>
      <CloseBtn setClose={setShowPopup} />

      <h1>Adicione uma nova despesa</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className={style.formProduct}>
          <div className={style.selectform}>
            <select
              id="name"
              required
              value={form.expenseId}
              onChange={handleChange}
              onFocus={handleFocus}
            >
              <option>Selecione uma despesa</option>
              {expensesList &&
                expensesList.map((expense, index) => (
                  <option key={index} value={String(expense.humanId)}>
                    {expense.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            id="value"
            autoComplete="off"
            required
            label="Valor"
            value={form.value}
            type="number"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="dueDate"
            autoComplete="off"
            required
            label="Vencimento"
            value={form.dueDate}
            type="date"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="paymentDate"
            autoComplete="off"
            required
            label="Data Pagamento"
            value={form.paymentDate}
            type="date"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <Input
            id="confirmation"
            autoComplete="off"
            required
            label="Confirmação"
            value={form.confirmation}
            type="number"
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <div className={style.selectform}>
            <select
              id="provider"
              required
              onChange={handleChange}
              value={form.provider}
            >
              <option>Selecione um fornecedor</option>
              {providerList &&
                providerList.length > 0 &&
                providerList.map((category, index) => (
                  <option key={index} value={category.provider}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            id="account"
            autoComplete="off"
            className="account"
            label="Nota fiscal"
            value={form.account}
            type="text"
            onChange={handleChange}
          />
          <div className={style.selectform}>
            <select
              id="category"
              value={form.category}
              required
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                Selecione o tipo de custo
              </option>
              <option value="fixed">Fixo</option>
              <option value="variable"> Variável</option>
            </select>
          </div>
        </div>
        {showItemsDetailsForm && (
          <fieldset>
            <legend>Adicionar Item</legend>
            <div className={style.selectform}>
              <select
                id="product"
                value={productList?.findIndex(
                  (product) => product.name === item.product
                )}
                onChange={handleItemChange}
              >
                <option value="">Selecione um produto</option>
                {productList &&
                  productList.map((category, index) => (
                    <option key={index} value={index}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              id="amount"
              autoComplete="off"
              className="num"
              label="Qtd de volumes"
              value={item.amount}
              type="number"
              onChange={handleItemChange}
            />
            <Input
              id="CostPerUnit"
              autoComplete="off"
              className="num"
              label="Custo por vol"
              value={item.CostPerUnit}
              type="number"
              onChange={handleItemChange}
            />
            <Input
              id="totalCost"
              autoComplete="off"
              className="num"
              label="Custo Total"
              value={item.totalCost}
              type="number"
              onChange={handleItemChange}
            />
            <Input
              id="currentAmountProduct"
              autoComplete="off"
              className="num"
              label="Volume atual do produto"
              value={item.currentAmountProduct}
              type="text"
              onChange={handleItemChange}
              onBlur={checkCurrentValue}
            />

            <Input
              id="volumePerUnit"
              autoComplete="off"
              className="num"
              label="Qtd por volume"
              value={item.volumePerUnit}
              type="text"
              onChange={handleItemChange}
            />
            <button type="button" onClick={addItem}>
              Adicionar
            </button>
          </fieldset>
        )}
        <button>Enviar</button>
      </form>

      {showPopupNote && (
        <ProductVolumeAdjustmentNote
          setNote={setNote}
          setShowPopupNote={setShowPopupNote}
          showPopupNote={showPopupNote}
        />
      )}
      {showItemsDetailsForm && item && renderTableItem()}
    </div>
  );
};
export default AddExpensesForm;
