import { useRef } from 'react';
import React from 'react';
import expenses from '../../../assets/styles/ExpensesManegementList.module.scss';
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

const formatDateToDMY = (dateStr) => {
  if (!dateStr) return '-';
  if (typeof dateStr !== 'string') return String(dateStr);
  const trimmed = dateStr.trim();
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return trimmed;
};

const Expensescolumns = [
  { nomeDaColuna: 'Tipo de despesa', valorDaColuna: 'name' },
  { nomeDaColuna: 'Valor', valorDaColuna: 'value' },
  { nomeDaColuna: 'Data', valorDaColuna: 'dueDateDisplay' },
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

  React.useEffect(() => {
    fetchExpensesData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('openPopup') === 'registerProduct' || params.get('registerProduct') === 'true') {
      setShowProductRegisterPopup(true);
    }
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

      // Map names for Stock entries
      const mappedList = outgoingList.map(exp => ({
        ...exp,
        name: exp.entryType === 'stock' ? 'Entrada de estoque' : exp.name
      }));

      setExpensesList(sortedData(mappedList));
      setOriginalExpensesList(sortedData(mappedList));
      setItemList(sortedData(mergedItems));
      setOriginalItemList(sortedData(mergedItems));
    } catch (error) {
      console.error('Erro ao buscar dados de despesas:', error);
    }
  };

const parseToDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal;
  
  if (typeof dateVal.toDate === 'function') {
    return dateVal.toDate();
  }
  if (typeof dateVal.seconds === 'number') {
    return new Date(dateVal.seconds * 1000);
  }

  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof dateVal === 'string') {
    const str = dateVal.trim();
    if (!str) return null;

    if (str.includes('/')) {
      const cleanStr = str.split(' - ')[0].split(' ')[0].trim();
      const parts = cleanStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }

    if (str.includes('-')) {
      const cleanStr = str.split('T')[0].split(' ')[0].trim();
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        } else {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        }
      }
    }
  }

  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

  const sortedData = (data) => {
    return data.sort((a, b) => {
      const dateA = parseToDate(a.dueDate || a.paymentDate || a.date) || new Date(0);
      const dateB = parseToDate(b.dueDate || b.paymentDate || b.date) || new Date(0);
      return dateB - dateA;
    });
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
        deleteData('outgoing', item.id);
      } else {
        const targetExpense = expensesList.find(
          (expense) => expense.expenseId === item.expenseId
        );

        if (targetExpense.items && targetExpense.items.length > 0) {
          const filteredItems = targetExpense.items.filter(
            (i) => i.idProduct !== item.idProduct
          );
          const updatedExpense = {
            ...targetExpense,
            items: filteredItems,
          };
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

  const handleRegisterChange = (e) => {
    const value = e.target.value;
    if (value === 'product') setShowProductRegisterPopup(true);
    else if (value === 'provider') setShowProviderRegisterPopup(true);
    else if (value === 'expenses') setShowExpensesRegisterPopup(true);
    e.target.value = '';
  };

  const filterExpenseList = (form) => {
    const hasFilters = form.expenseName?.trim() || form.rawMaterial?.trim() || form.supplier?.trim() || form.invoice?.trim();
    const hasDates = form.initialDate?.trim() && form.finalDate?.trim();

    const filterFields = [form.expenseName?.trim(), form.supplier?.trim(), form.rawMaterial?.trim(), form.invoice?.trim()];
    const filledCount = filterFields.filter(Boolean).length;

    if (filledCount > 1) {
      alert('Somente um parâmetro pode ser selecionado por pesquisa.');
      filterRef.current?.clearForm();
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
    if (!originalExpensesList || originalExpensesList.length === 0) return [];
    const normalize = (str) =>
      str
        ? str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        : '';
    const { initialDate, finalDate, expenseName, supplier, invoice, idRawMaterial, rawMaterial } = form;

    let filteredItems = [...originalExpensesList];

    if (initialDate && finalDate) {
      const start = parseToDate(initialDate);
      if (start) start.setHours(0, 0, 0, 0);

      const end = parseToDate(finalDate);
      if (end) end.setHours(23, 59, 59, 999);

      if (start && end) {
        filteredItems = filteredItems.filter((expense) => {
          const expDate = parseToDate(expense.dueDate || expense.paymentDate || expense.date);
          if (!expDate) return false;
          return expDate >= start && expDate <= end;
        });
      }
    }

    if (expenseName?.trim()) {
      const target = normalize(expenseName);
      filteredItems = filteredItems.filter((expense) => {
        const expName = normalize(expense.name);
        return (
          expName === target ||
          expName.startsWith(target) ||
          expName.includes(target) ||
          target.includes(expName)
        );
      });
    }

    if (invoice?.trim()) {
      const target = normalize(invoice);
      filteredItems = filteredItems.filter((expense) => {
        const expAccount = normalize(expense.account);
        return expAccount === target || expAccount.includes(target);
      });
    }

    if (supplier?.trim()) {
      const target = normalize(supplier);
      filteredItems = filteredItems.filter((expense) => {
        const expProvider = normalize(expense.provider);
        return expProvider === target || expProvider.includes(target);
      });
    }

    if (idRawMaterial || rawMaterial?.trim()) {
      const targetRawMaterial = normalize(rawMaterial);
      filteredItems = filteredItems.filter((expense) => {
        if (!expense.items || !Array.isArray(expense.items)) return false;
        return expense.items.some((item) => {
          if (idRawMaterial && (item.idProduct === idRawMaterial || item.id === idRawMaterial)) {
            return true;
          }
          if (targetRawMaterial) {
            const itemName = normalize(item.product || item.name);
            return itemName === targetRawMaterial || itemName.includes(targetRawMaterial);
          }
          return false;
        });
      });
    }

    return filteredItems;
  };

  const cleanFilter = () => setExpensesList(originalExpensesList);

  const openLoadSumaryPopup = (item) => {
    setOpenSumaryPopup(true);
    setOneExpense(item);
  };

  const formattedExpensesList = React.useMemo(() => {
    if (!expensesList) return null;
    return expensesList.map(item => ({
      ...item,
      dueDateDisplay: formatDateToDMY(item.dueDate || item.paymentDate || item.date)
    }));
  }, [expensesList]);

  return (
    <div className={expenses.customerListContainer}>
      <div className={expenses.containerIcon}>
        <a href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.lastl0sptfl5#heading=h.ft9y0s2jnma8" target="_blank" rel="noopener noreferrer">
          <span>?</span>
        </a>
      </div>
      <Link to="/admin/admin" className={expenses.btnBack}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      
      {showWarningDeletePopup && (
        <DefaultComumMessage
          msg={`Você está prestes a excluir ${excludeExpense.name ? excludeExpense.name : excludeExpense.product}. Tem certeza?`}
          item={excludeExpense}
          onConfirm={deleteExpenses}
          onClose={() => setShowWarningDeltePopup(false)}
        />
      )}

      {showExpensesRegisterPopup && <RegisterExpenses setShowPopup={setShowExpensesRegisterPopup} obj={obj} />}
      {showProviderRegisterPopup && <RegisterProvider setShowPopup={setShowProviderRegisterPopup} obj={obj} />}
      {showProductRegistePopup && <RegisterProduct setShowPopup={setShowProductRegisterPopup} obj={obj} />}
      {showExpensesPopup && <AddExpensesForm setShowPopup={setShowExpensesPopup} setRefreshData={setRefreshData} obj={obj} />}
      {openSumaryPopup && <SumaryExpensesListPopup setOpenSumaryPopup={setOpenSumaryPopup} oneExpense={oneExpense} />}

      <div className={expenses.titleTable}>
        <Link to="/admin/admin"><Title mainTitle="Despesas"></Title></Link>
      </div>

      <FilterExpenses ref={filterRef} filterExpenseList={filterExpenseList} cleanFilter={cleanFilter} />

      <div className={expenses.btnAdd}>
        <button onClick={addNewExpense}>Adicione Despesa</button>
        <select id="register" onChange={handleRegisterChange} defaultValue="">
          <option value="" disabled>Selecione uma opção de cadastro</option>
          <option value="product">Cadastrar Produtos</option>
          <option value="provider">Cadastrar Fornecedores</option>
          <option value="expenses">Cadastrar Despesas</option>
        </select>
      </div>

      <div className={expenses.containerExpensesManegementTable}>
        <Table
          title="Lista de Despesas"
          data={formattedExpensesList}
          columns={Expensescolumns}
          onEdit={editContent}
          onDelete={deleteExpenses}
          eventClick={openLoadSumaryPopup}
          labelEventClick="Ver Itens"
        />
      </div>
    </div>
  );
};
export default ExpensesManegementList;
