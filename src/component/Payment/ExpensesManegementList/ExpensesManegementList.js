import React from 'react';
import expenses from '../../../assets/styles/ExpensesManegementList.module.scss';
//import adminStyle from '../../../assets/styles/adminStyleReuse.module.css';
import { getBtnData, deleteData } from '../../../api/Api';
import AddExpensesForm from './AddExpensesForm.js';
import RegisterProvider from './RegisterProvider.js';
import RegisterProduct from './RegisterProduct.js';
import SumaryExpensesListPopup from './SumaryExpensesListPopup.js';
import DefaultComumMessage from '../../Messages/DefaultComumMessage';
import { Link } from 'react-router-dom';
import Title from '../../title.js';

const ExpensesManegementList = () => {
  const [expensesList, setExpensesList] = React.useState(null);

  const [showExpensesPopup, setShowExpensesPopup] = React.useState(false);
  const [showProviderRegisterPopup, setShowProviderRegisterPopup] =
    React.useState(false);
  const [showProductRegistePopup, setShowProductRegisterPopup] =
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
      const sortedData = data.sort(
        (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
      );

      setExpensesList(sortedData);
    };
    fetchCustomer();
  }, []);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('outgoing');
      const sortedData = data.sort(
        (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
      );
      setExpensesList(sortedData);
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
    setShowProductRegisterPopup(true);
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

  const openLoadSumaryPopup = (item) => {
    setOpenSumaryPopup(true);
    setOneExpense(item);
  };

  return (
    <div className={expenses.customerListContainer}>
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

      <div className={expenses.btnAdd}>
        <button onClick={registerProduct}>Cadastrar Produtos de Estoque</button>
        <button onClick={addNewExpense}>Adicione Despesa</button>{' '}
        <button onClick={addRegisterProvider}>Cadastrar Fornecedores</button>
      </div>
      <div className={expenses.containerExpensesManegementTable}>
        <table striped bordered hover>
          <thead>
            <tr>
              <th>Nome da despesa</th>
              <th>Valor</th>
              <th>Data de Vencimento</th>
              <th>Categoria</th>
              <th>Data do Pagamento</th>
              <th>Fornecedor</th>
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
                  <td
                    Title={item.name}
                    className="openPopup"
                    onClick={() => openLoadSumaryPopup(item)}
                  >
                    {item.name?.length > 10
                      ? `${item.name.slice(0, 10)}...`
                      : item.name}
                  </td>
                  <td>{Number(item.value).toFixed(2)}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.category}</td>
                  <td>{item.paymentDate}</td>
                  <td title={item.provider}>
                    {item.provider?.length > 10
                      ? `${item.provider.slice(0, 10)}...`
                      : item.paymentDate}
                  </td>
                  <td>{Number(item.confirmation).toFixed(2)}</td>
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
    </div>
  );
};
export default ExpensesManegementList;
