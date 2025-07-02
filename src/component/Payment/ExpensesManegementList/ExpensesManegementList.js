import { useRef } from 'react';
import React from 'react';
import expenses from '../../../assets/styles/ExpensesManegementList.module.scss';
//import adminStyle from '../../../assets/styles/adminStyleReuse.module.css';
import { getBtnData, deleteData, updateCollection } from '../../../api/Api';
import AddExpensesForm from './AddExpensesForm.js';
import RegisterProvider from './RegisterProvider.js';
import RegisterProduct from './RegisterProduct.js';
import RegisterExpenses from './RegisterExpenses';
import SumaryExpensesListPopup from './SumaryExpensesListPopup.js';
import DefaultComumMessage from '../../Messages/DefaultComumMessage';
import { Link } from 'react-router-dom';
import Title from '../../title.js';
import FilterExpenses from './filterExpenses.js';
import Table from '../../Table.js';
import { tab } from '@testing-library/user-event/dist/tab.js';

const Expensescolumns = [
  { nomeDaColuna: 'Tipo de despesa', valorDaColuna: 'name' },
  { nomeDaColuna: 'Valor', valorDaColuna: 'value' },
  { nomeDaColuna: 'Data', valorDaColuna: 'dueDate' },
  { nomeDaColuna: 'Fornecedor', valorDaColuna: 'provider' },
  { nomeDaColuna: 'NotaFiscal', valorDaColuna: 'account' },
];

const Itemscolumns = [
  { nomeDaColuna: 'Item', valorDaColuna: 'product' },
  { nomeDaColuna: 'Valor', valorDaColuna: 'totalCost' },
  { nomeDaColuna: 'Data', valorDaColuna: 'paymentDate' },
  { nomeDaColuna: 'Fornecedor', valorDaColuna: 'provider' },
  { nomeDaColuna: 'NotaFiscal', valorDaColuna: 'account' },
  { nomeDaColuna: 'Un medida', valorDaColuna: 'unitOfMeasurement' },
];

const ExpensesManegementList = () => {
  const filterRef = useRef();
  const [expensesList, setExpensesList] = React.useState(null);
  const [itemList, setItemList] = React.useState(null);
  const [originalExpensesList, setOriginalExpensesList] = React.useState(null);
  const [originalItemList, setOriginalItemList] = React.useState(null);

  const [showExpensesPopup, setShowExpensesPopup] = React.useState(false);
  const [showProviderRegisterPopup, setShowProviderRegisterPopup] =
    React.useState(false);
  const [showExpensesRegisterPopup, setShowExpensesRegisterPopup] =
    React.useState(false);
  const [showProductRegistePopup, setShowProductRegisterPopup] =
    React.useState(false);

  const [excludeExpense, setExcludeExpense] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [openSumaryPopup, setOpenSumaryPopup] = React.useState(false);
  const [oneExpense, setOneExpense] = React.useState(null);
  const [changeTable, setChangeTable] = React.useState(false);

  React.useEffect(() => {
    fetchExpensesData();
  }, []);

  React.useEffect(() => {
    fetchExpensesData();
  }, [refreshData]);

  const fetchExpensesData = async () => {
    try {
      const expensesData = await getBtnData('outgoing');

      const outgoingList = Array.isArray(expensesData) ? expensesData : [];

      const mergedItems = outgoingList.flatMap((expense) =>
        Array.isArray(expense.items) ? expense.items : []
      );

      setExpensesList(sortedData(outgoingList));
      setOriginalExpensesList(sortedData(outgoingList));
      setItemList(sortedData(mergedItems));
      setOriginalItemList(sortedData(mergedItems));
    } catch (error) {
      console.error('Erro ao buscar dados de despesas:', error);
    }
  };

  React.useEffect(() => {
    console.log('item List:', itemList);
    console.log('LISTA DE DESPESAS:', expensesList);
  }, [itemList, expensesList]);

  const sortedData = (data) => {
    return data.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  };

  const editContent = (data) => {
    if (data.product && data.idProduct) {
      const expenseSelected = originalExpensesList.find(
        (expense) => expense.expenseId === data.expenseId
      );
      setObj(expenseSelected);
      setShowExpensesPopup(true);
      return;
    }
    setObj(data);
    setShowExpensesPopup(true);
  };

  const deleteExpenses = async (item, permission) => {
    setExcludeExpense(item);
    setShowWarningDeltePopup(true);
    if (permission && excludeExpense) {
      setShowWarningDeltePopup(false);

      if (Array.isArray(item.items) || item.name) {
        // Primeiro tipo de exclusão
        deleteData('outgoing', item.id);

        const relatedItems = itemList.filter(
          (i) => i.expenseID === item.expenseId
        );

        relatedItems.forEach((relatedItem) => {
          deleteData('expenseItems', relatedItem.id);
        });
      } else {
        // Segundo tipo de exclusão
        // deleteData('expenseItems', item.id);

        // Agora vamos remover o item correspondente da coleção 'outgoing'
        const targetExpense = expensesList.find(
          (expense) => expense.expenseId === item.expenseId
        );

        if (targetExpense.items && targetExpense.items.length > 0) {
          const filteredItems = targetExpense.items.filter(
            (i) => i.idProduct !== item.idProduct
          );

          // Atualiza o documento no Firestore com os items filtrados
          const updatedExpense = {
            ...targetExpense,
            items: filteredItems,
          };

          // Chama a função para atualizar o documento na coleção 'outgoing'
          await updateCollection('outgoing', targetExpense.id, updatedExpense);
        }
      }

      setRefreshData((prev) => !prev);
    }
  };

  const addNewExpense = () => {
    setShowExpensesPopup(true);
    setObj(null);
  };
  // const registerProduct = () => {
  //   setShowProductRegisterPopup(true);
  // };
  // const addRegisterProvider = () => {
  //   console.log('Registrou');
  //   setShowProviderRegisterPopup(true);
  // };

  const handleRegisterChange = (e) => {
    const value = e.target.value;

    if (value === 'product') {
      setShowProductRegisterPopup(true);
    } else if (value === 'provider') {
      setShowProviderRegisterPopup(true);
    } else if (value === 'expenses') {
      setShowExpensesRegisterPopup(true);
    }

    // Opcional: resetar o select após a ação
    e.target.value = '';
  };

  const totalExpensesValue = () => {
    if (!expensesList || expensesList.length === 0) {
      return null;
    }
    //let totals = { paid: 0, estimate: 0 };

    const result = expensesList.reduce(
      (totals, item) => {
        totals.estimate += Number(item.value);
        totals.paid += Number(item.confirmation);
        return totals;
      },
      { paid: 0, estimate: 0 } // valor inicial do acumulador
    );

    return (
      <tr className={expenses.totals}>
        <td>Total Estimado = </td> {/* Primeira coluna vazia */}
        <td>{Number(result.estimate).toFixed(2)}</td>{' '}
        {/* Segunda coluna com o total */}
        <td colSpan={2}></td>{' '}
        {/* Três colunas vazias (Data de Vencimento, Categoria, Data do Pagamento) */}
        <td>Total Pago = </td>
        <td>{Number(result.paid).toFixed(2)}</td>{' '}
        {/* Sexta coluna com o total */}
        <td colSpan={2}></td>{' '}
        {/* Últimas duas colunas (Editar, Excluir) vazias */}
      </tr>
    );
  };

  const bringExpenseItemsSelected = async (idRawMaterial) => {
    const data = originalItemList.filter(
      (item) => item.idProduct === idRawMaterial
    );
    if (data && data.length > 0) {
      setChangeTable(true);
      setItemList(data);
    } else {
      setChangeTable(true);
      setItemList([]);
      filterRef.current?.clearForm();
    }
    return;
  };

  const filterExpenseList = (form) => {
    if (form.idRawMaterial) {
      bringExpenseItemsSelected(form.idRawMaterial);
      return;
    }
    if (changeTable) {
      setChangeTable(false);
    }
    const hasFilters =
      form.expenseName?.trim() ||
      form.rawMaterial?.trim() ||
      form.supplier?.trim();

    const hasDates = form.initialDate?.trim() && form.finalDate?.trim();

    // Verificar se mais de um campo de filtro foi preenchido
    const filterFields = [
      form.expenseName?.trim(),
      form.supplier?.trim(),
      form.rawMaterial?.trim(),
      form.invoice?.trim(),
    ];

    const filledCount = filterFields.filter(Boolean).length;

    if (filledCount > 1) {
      alert('Somente um parâmetro pode ser selecionado por pesquisa.');
      return false;
    }

    if (hasFilters && !hasDates) {
      alert(
        'Para pesquisar por nome, matéria-prima ou fornecedor, as datas de filtro precisam estar preenchidas.'
      );
      return false;
    }

    if (!hasFilters && !hasDates) {
      alert('Preencha algum campo para efetuar o filtro de dados.');
      return false;
    }
    setExpensesList(grabSelectedItems(form));
    return true;
  };

  const grabSelectedItems = (form) => {
    if (!expensesList || expensesList.length === 0) return [];

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, ' ').trim();

    const { initialDate, finalDate, expenseName, supplier, invoice } = form;

    // Começa com todos os itens
    let filteredItems = [...originalExpensesList];

    // Filtro obrigatório: entre datas
    if (initialDate && finalDate) {
      filteredItems = filteredItems.filter((expense) => {
        return expense.dueDate >= initialDate && expense.dueDate <= finalDate;
      });
    }

    // Filtro opcional: nome da despesa
    if (expenseName?.trim()) {
      filteredItems = filteredItems.filter((expense) => {
        return normalize(expense.name) === normalize(expenseName);
      });
    }

    // Filtro opcional: nota fiscal
    if (invoice?.trim()) {
      filteredItems = filteredItems.filter((expense) => {
        return normalize(expense.account) === normalize(invoice);
      });
    }

    // Filtro opcional: fornecedor

    if (supplier?.trim()) {
      filteredItems = filteredItems.filter((expense) => {
        return normalize(expense.provider) === normalize(supplier);
      });
    }

    return filteredItems;

    // Ou: setFilteredExpenses(filteredItems);
  };

  const cleanFilter = () => {
    if (!changeTable) {
      setExpensesList(originalExpensesList);
    } else {
      setItemList(sortedData(originalItemList));
      setChangeTable(false);
      setExpensesList(originalExpensesList);
    }
  };

  const openLoadSumaryPopup = (item) => {
    setOpenSumaryPopup(true);
    setOneExpense(item);
  };

  return (
    <div className={expenses.customerListContainer}>
      {showWarningDeletePopup && (
        <DefaultComumMessage
          msg={`Você está prestes a excluir ${
            excludeExpense.name ? excludeExpense.name : excludeExpense.product
          }. Tem certeza?`}
          item={excludeExpense}
          onConfirm={deleteExpenses}
          onClose={() => setShowWarningDeltePopup(false)}
        />
      )}
      <div className="containerAddExpenses">
        {showExpensesRegisterPopup && (
          <RegisterExpenses
            setShowPopup={setShowExpensesRegisterPopup}
            obj={obj}
          />
        )}
      </div>
      <div className="container-add-expenses">
        {showProviderRegisterPopup && (
          <RegisterProvider
            setShowPopup={setShowProviderRegisterPopup}
            obj={obj}
          />
        )}
      </div>
      <div className="containerAddExpenses">
        {showProductRegistePopup && (
          <RegisterProduct
            setShowPopup={setShowProductRegisterPopup}
            obj={obj}
          />
        )}
      </div>
      <div className="container-add-provider">
        {showExpensesPopup && (
          <AddExpensesForm
            setShowPopup={setShowExpensesPopup}
            setRefreshData={setRefreshData}
            obj={obj}
          />
        )}
      </div>
      {openSumaryPopup && (
        <SumaryExpensesListPopup
          setOpenSumaryPopup={setOpenSumaryPopup}
          oneExpense={oneExpense}
        />
      )}
      <div className={expenses.titleTable}>
        <Link to="/admin/admin">
          <Title mainTitle="Despesas"></Title>
        </Link>
      </div>
      <FilterExpenses
        ref={filterRef}
        filterExpenseList={filterExpenseList}
        cleanFilter={cleanFilter}
      />

      <div className={expenses.btnAdd}>
        {/* <button onClick={registerProduct}>Cadastrar Produtos de Estoque</button> */}
        <button onClick={addNewExpense}>Adicione Despesa</button>{' '}
        {/* <button onClick={addRegisterProvider}>Cadastrar Fornecedores</button> */}
        <select id="register" onChange={handleRegisterChange} defaultValue="">
          <option value="" disabled>
            Selecione uma opção de cadastro
          </option>
          <option value="product">Cadastrar Produtos</option>
          <option value="provider">Cadastrar Fornecedores</option>
          <option value="expenses">Cadastrar Despesas</option>
        </select>
      </div>
      <div className={expenses.containerExpensesManegementTable}>
        {changeTable ? (
          <Table
            title="Lista de Matérias-Primas"
            data={itemList}
            columns={Itemscolumns}
            onEdit={editContent}
            onDelete={deleteExpenses}
          />
        ) : (
          <Table
            title="Lista de Despesas"
            data={expensesList}
            columns={Expensescolumns}
            onEdit={editContent}
            onDelete={deleteExpenses}
            eventClick={openLoadSumaryPopup}
            labelEventClick="Ver Itens"
          />
        )}
      </div>
    </div>
  );
};
export default ExpensesManegementList;
