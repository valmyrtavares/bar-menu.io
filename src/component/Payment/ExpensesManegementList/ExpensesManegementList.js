import React from 'react';
import '../../../assets/styles/ExpensesManegementList.css';
import { getBtnData, deleteData } from '../../../api/Api';
import AddExpensesForm from './AddExpensesForm.js';
import RegisterProvider from './RegisterProvider.js';
import SumaryExpensesListPopup from './SumaryExpensesListPopup.js';
import DefaultComumMessage from '../../Messages/DefaultComumMessage';

const ExpensesManegementList = () => {
  const [expensesList, setExpensesList] = React.useState(null);

  const [showExpensesPopup, setShowExpensesPopup] = React.useState(false);
  const [showProviderRegisterPopup, setShowProviderRegisterPopup] =
    React.useState(false);

  const [excludeCustomer, setExcludeCustomer] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);
  const [obj, setObj] = React.useState(null);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [openSumaryPopup, setOpenSumaryPopup] = React.useState(false);
  const [oneExpense, setOneExpense] = React.useState(null);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('outgoing');
      setExpensesList(data);
    };
    fetchCustomer();
  }, []);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('outgoing');
      setExpensesList(data);
    };
    fetchCustomer();
  }, [refreshData]);

  const editContent = (data) => {
    setObj(data);
    setShowExpensesPopup(true);
  };
  const deleteExpenses = (item, permission) => {
    setExcludeCustomer(item);
    setShowWarningDeltePopup(true);

    if (permission && excludeCustomer.name === item.name) {
      setShowWarningDeltePopup(false);
      deleteData('outgoing', item.id);
      setRefreshData((prev) => !prev);
    }
  };

  const addNewExpense = () => {
    setShowExpensesPopup(true);
    setObj(null);
  };
  const registerProduct = () => {
    console.log('Registrou');
  };
  const addRegisterProvider = () => {
    console.log('Registrou');
    setShowProviderRegisterPopup(true);
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
      <tr className="totals">
        <td>Total Estimado = </td> {/* Primeira coluna vazia */}
        <td>{result.estimate}</td> {/* Segunda coluna com o total */}
        <td colSpan={2}></td>{' '}
        {/* Três colunas vazias (Data de Vencimento, Categoria, Data do Pagamento) */}
        <td>Total Pago = </td>
        <td>{result.paid}</td> {/* Sexta coluna com o total */}
        <td colSpan={2}></td>{' '}
        {/* Últimas duas colunas (Editar, Excluir) vazias */}
      </tr>
    );
  };

  const openLoadSumaryPopup = (item) => {
    setOpenSumaryPopup(true);
    setOneExpense(item);
  };

  return (
    <div className="customerList-container">
      {showWarningDeletePopup && (
        <DefaultComumMessage
          msg={`Você está prestes a excluir ${excludeCustomer.name}`}
          item={excludeCustomer}
          onConfirm={deleteExpenses}
          onClose={() => setShowWarningDeltePopup(false)}
        />
      )}
      <div className="container-add-expenses">
        {showProviderRegisterPopup && (
          <RegisterProvider
            setShowPopup={setShowProviderRegisterPopup}
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
      <div className="btn-add">
        <button onClick={registerProduct}>Cadastrar Produtos de Estoque</button>
        <button onClick={addNewExpense}>Adicione Despesa</button>{' '}
        <button onClick={addRegisterProvider}>Cadastrar Fornecedores</button>
      </div>
      <div className="title-table">
        <h1>Lista de Despesas</h1>
      </div>
      <table striped bordered hover>
        <thead>
          <tr>
            <th>Nome da despesa</th>
            <th>Valor</th>
            <th>Data de Vencimento</th>
            <th>Categoria</th>
            <th>Data do Pagamento</th>
            <th>Confirmação</th>
            <th>Editar</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {expensesList &&
            expensesList.length > 0 &&
            expensesList.map((item, index) => (
              <tr key={index}>
                <td onClick={() => openLoadSumaryPopup(item)}>{item.name}</td>
                <td>{item.value}</td>
                <td>{item.dueDate}</td>
                <td>{item.category}</td>
                <td>{item.paymentDate}</td>
                <td>{item.confirmation}</td>
                <td>
                  <button onClick={() => editContent(item)}>Editar</button>
                </td>
                <td>
                  <button onClick={() => deleteExpenses(item, false)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          {totalExpensesValue()} {/* Linha de totais no final */}
        </tbody>
      </table>
    </div>
  );
};
export default ExpensesManegementList;
