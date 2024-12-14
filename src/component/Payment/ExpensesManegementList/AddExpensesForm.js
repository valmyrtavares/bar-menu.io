import React, { useEffect } from 'react';
import Input from '../../Input';
import '../../../assets/styles/AddExpensesForm.css';
import CloseBtn from '../../closeBtn';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase';
import { getBtnData } from '../../../api/Api';

const AddExpensesForm = ({ setShowPopup, setRefreshData, obj }) => {
  const [form, setForm] = React.useState({
    name: '',
    value: 0,
    dueDate: '',
    paymentDate: '',
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
    totalVolume: 0,
    unitOfMeasurement: '',
  });
  const [itemArrayList, setItemArrayList] = React.useState([]);
  const [productList, setProductList] = React.useState(null);
  const [providerList, setProviderList] = React.useState(null);
  const [total, setTotal] = React.useState(0);
  const db = getFirestore(app);

  React.useEffect(() => {
    const fetchProduct = async () => {
      const [dataProduct, dataProvider, sideDishes] = await Promise.all([
        getBtnData('product'),
        getBtnData('provider'),
      ]);

      if (dataProduct && dataProduct.length > 0) {
        setProductList(dataProduct);
      }
      if (dataProvider && dataProvider.length > 0) {
        setProviderList(dataProvider);
      }
    };
    fetchProduct();
  }, []);

  React.useEffect(() => {
    if (productList) console.log('Lista de produtos   ', productList);
  }, [productList]);

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
        name: obj.name,
        value: obj.value,
        dueDate: obj.dueDate,
        paymentDate: obj.paymentDate,
        category: obj.category,
        confirmation: obj.confirmation,
      });
    } else {
      setForm({
        name: '',
        value: 0,
        dueDate: '',
        paymentDate: '',
        category: '',
        confirmation: 0,
      });
    }
  }, [obj]);

  React.useEffect(() => {
    console.log('FORM   ', form);
  }, [form]);

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

  const addItem = () => {
    if (item.product !== '') {
      setItem({
        ...item,
        totalVolume: item.volumePerUnit * item.amount,
      });
      console.log('ITEM ', item);
      setItemArrayList((prevArrayList) => [...prevArrayList, item]);
    }
    console.log('total ', total);
    setItem({
      product: '',
      amount: 0,
      CostPerUnit: 0,
      totalCost: 0,
      volumePerUnit: 0,
      totalVolume: 0,
      unitOfMeasurement: '',
    });
  };
  const deleteItem = (indexToRemove) => {
    console.log('Index removido:', indexToRemove);

    setItemArrayList((prevArrayList) =>
      prevArrayList.filter((_, index) => index !== indexToRemove)
    );
  };

  const renderTableItem = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Custo por unidade</th>
            <th>Custo Total</th>
            <th>Volume</th>
            <th>Unidade de medida</th>
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
                <td onClick={() => deleteItem(index)}>X</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };
  // const handleStock = async (itemsStock, account, paymentDate) => {
  //   const data = await getBtnData('stock');
  //   if (data && data.length > 0) {
  //     for (let i = 0; i < itemsStock.length; i++) {
  //       const itemFinded = data.find(
  //         (itemSearch) => itemSearch.product === itemsStock[i].product
  //       );
  //       if (itemFinded) {
  //         itemsStock[i].totalCost += itemFinded.totalCost || 0;
  //         itemsStock[i].totalVolume += itemFinded.totalVolume || 0;
  //         if (itemFinded.UsageHistory && itemFinded.UsageHistory.length > 0) {
  //           itemsStock[i].UsageHistory.push(
  //             stockHistoryList(
  //               itemFinded,
  //               account,
  //               paymentDate,
  //               itemsStock[i].totalCost,
  //               itemsStock[i].totalVolume
  //             )
  //           );
  //         } else {
  //           itemsStock[i].UsageHistory = [];
  //           itemsStock[i].UsageHistory.push(
  //             stockHistoryList(
  //               itemFinded,
  //               account,
  //               paymentDate,
  //               itemsStock[i].totalCost,
  //               itemsStock[i].totalVolume
  //             )
  //           );
  //         }
  //         // const docRef = doc(db, 'stock', itemFinded.id);
  //         // await updateDoc(docRef, itemsStock[i]);
  //       } else {
  //         await itemsStock[i]; //addDoc(collection(db, 'stock'), itemsStock[i]);
  //       }
  //     }
  //   } else {
  //     for (const item of itemsStock) {
  //       await item; //addDoc(collection(db, 'stock'), item);
  //     }
  //   }
  // };

  const handleStock = async (itemsStock, account, paymentDate) => {
    const data = await getBtnData('stock'); // Obtém todos os registros existentes no estoque

    for (let i = 0; i < itemsStock.length; i++) {
      const currentItem = itemsStock[i];

      // Verifica se o item já existe no banco de dados
      const itemFinded = data?.find(
        (itemSearch) => itemSearch.product === currentItem.product
      );

      if (itemFinded) {
        // Atualiza os valores de custo e volume totais
        currentItem.totalCost += itemFinded.totalCost || 0;
        currentItem.totalVolume += itemFinded.totalVolume || 0;

        // Inicializa ou adiciona ao UsageHistory
        if (!itemFinded.UsageHistory) {
          currentItem.UsageHistory = [];
        }
        currentItem.UsageHistory.push(
          stockHistoryList(
            itemFinded,
            account,
            paymentDate,
            currentItem.totalCost,
            currentItem.totalVolume
          )
        );

        // Atualiza o registro no banco de dados
        const docRef = doc(db, 'stock', itemFinded.id);
        await updateDoc(docRef, currentItem);
      } else {
        // Cria um novo registro para o item no banco de dados
        currentItem.UsageHistory = [
          stockHistoryList(
            currentItem,
            account,
            paymentDate,
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
    paymentDate,
    totalCost,
    totalVolume
  ) => {
    const stockEventRegistration = {
      date: paymentDate,
      inputProduct: item.totalVolume,
      outputProduct: 0,
      category: account,
      ContentsInStock: totalVolume,
      totalResourceInvested: totalCost,
      package: item.amount,
    };
    return stockEventRegistration;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(form);

    debugger;
    if (form && form.items && form.items.length > 0) {
      // Organize the items in stock
      handleStock(form.items, form.account, form.paymentDate);
    }

    if (obj) {
      const docRef = doc(db, 'outgoing', obj.id);
      updateDoc(docRef, form) // Atualiza com os dados do estado "form"
        .then(() => {
          console.log('Documento atualizado com sucesso!');
          setRefreshData((prev) => !prev); // Atualiza a interface, se necessário
          console.log('Documento atualizado com sucesso!');
          setShowPopup(false);
          setForm({
            name: '',
            value: 0,
            dueDate: '',
            paymentDate: '',
            category: '',
            confirmation: 0,
            items: [],
          });
          obj = null;
          console.log('OBJ  ', obj);
        })
        .catch((error) => {
          console.error('Erro ao atualizar o documento:', error);
        });
    } else {
      addDoc(collection(db, 'outgoing'), form).then(() => {
        setRefreshData((prev) => !prev);
        setShowPopup(false);
        setForm({
          name: '',
          value: 0,
          dueDate: '',
          paymentDate: '',
          category: '',
          confirmation: 0,
        });
        obj = null;
        console.log('OBJ  ', obj);
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const handleItemChange = (e) => {
    const { id, value } = e.target;

    if (id === 'product') {
      const selectedProduct = productList[value]; // Acesse o produto selecionado pelo índice

      setItem((prevForm) => ({
        ...prevForm,
        product: selectedProduct ? selectedProduct.name : '', // Define o nome do produto
        unitOfMeasurement: selectedProduct
          ? selectedProduct.unitOfMeasurement
          : '', // Define a unidade de medida
      }));
    } else {
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

  return (
    <div className="container-add-expenses-form">
      <CloseBtn setClose={setShowPopup} />

      <h1>Adicione uma nova despesa</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className="form-product">
          <Input
            id="name"
            autoComplete="off"
            required
            label="Nome"
            value={form.name}
            type="text"
            onFocus={handleFocus}
            onChange={handleChange}
          />
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
          <div className="my-3">
            <label className="form-label">Produto</label>
            <select
              id="provider"
              required
              className="form-select"
              onChange={handleChange}
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
          <div className="select-form">
            <label></label>
            <select
              id="category"
              className="form-select custom-select"
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
        <fieldset>
          <legend>Adicionar Item</legend>
          <div className="my-3">
            <label className="form-label">Produto</label>
            <select
              id="product"
              value={productList?.findIndex(
                (product) => product.name === item.product
              )}
              className="form-select"
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
            id="volumePerUnit"
            autoComplete="off"
            className="num"
            label="Qtd por volume"
            value={item.volumePerUnit}
            type="number"
            onChange={handleItemChange}
          />
          <button type="button" onClick={addItem}>
            Adicionar
          </button>
        </fieldset>
        <button>Enviar</button>
      </form>
      {item && renderTableItem()}
    </div>
  );
};
export default AddExpensesForm;
