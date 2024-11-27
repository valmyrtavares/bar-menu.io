import React from 'react';
import '../../assets/styles/ExpensesManegementList.css';
import { getBtnData, deleteData } from '../../api/Api';
import { getFirstFourLetters, firstNameClient } from '../../Helpers/Helpers';

import DefaultComumMessage from '../Messages/DefaultComumMessage';

const CustomerList = () => {
  const [expensesList, setExpensesList] = React.useState(null);

  const [showPopup, setShowPopup] = React.useState(false);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeCustomer, setExcludeCustomer] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('outgoing');
      console.log('EXPENSES   ', data);
      setExpensesList(data);
    };
    fetchCustomer();
  }, []);

  React.useEffect(() => {
    if (expensesList) {
      console.log('EXPENSES LIST   ', expensesList);
    }
  }, [expensesList]);

  // React.useEffect(() => {
  //   const fetchCustomer = async () => {
  //     const data = await getBtnData('user');
  //     setExpensesList(data);
  // setOriginalCustomerList(data);
  //   };
  //   fetchCustomer();
  // }, [refreshData]);

  // const deleteCustomer = (item, permission) => {
  //   setExcludeCustomer(item);
  //   setShowWarningDeltePopup(true);
  //   if (permission && excludeCustomer.name === item.name) {
  //     setShowWarningDeltePopup(false);
  //     deleteData('user', item.id);
  //     setRefreshData((prev) => !prev);
  //   }
  // };

  // const handleChange = ({ target }) => {
  //   const searchValue = target.value.toLowerCase();
  //   setCustomer(searchValue);

  //   if (searchValue === '') {
  //     setCustomerList(originalCustomerList);
  //   } else {
  //     const filtered = originalCustomerList.filter((customer) => {
  //       const nameMatch =
  //         customer.name && customer.name.toLowerCase().includes(searchValue);
  //       const cpfMatch =
  //         customer.cpf && customer.cpf.toLowerCase().includes(searchValue);
  //       const birthdayMatch =
  //         customer.birthday &&
  //         customer.birthday.toLowerCase().includes(searchValue);

  //       return nameMatch || cpfMatch || birthdayMatch;
  //     });

  //     setCustomerList(filtered);
  //   }
  // };

  // const eachCustomer = (client) => {
  //   setOneClient(client);
  //   setShowPopup(true);
  // };

  return (
    <div className="customerList-container">
      <button>Adicione Despesa</button>
      <div className="button-title-container">
        <h1>Lista de Despesas</h1>
      </div>
      <table striped bordered hover>
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
        {expensesList &&
          expensesList.length > 0 &&
          expensesList.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>

              <td>{item.value}</td>
              <td>{item.dueDate}</td>
              <td>{item.category}</td>
              <td>{item.paymentDate}</td>
              <td>{item.confirmation}</td>
              <td>
                <button>Editar</button>
              </td>
              <td>
                <button>Excluir</button>
              </td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default CustomerList;
