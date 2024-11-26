import React from 'react';
import '../../assets/styles/customerList.css';
import { getBtnData, deleteData } from '../../api/Api';
import { getFirstFourLetters, firstNameClient } from '../../Helpers/Helpers';
import EachCustomer from './eachCustomer';
import DefaultComumMessage from '../Messages/DefaultComumMessage';

const CustomerList = () => {
  const [customerList, setCustomerList] = React.useState(null);
  const [customer, setCustomer] = React.useState('');
  const [originalCustomerList, setOriginalCustomerList] = React.useState([]);
  const [oneClient, setOneClient] = React.useState({});
  const [showPopup, setShowPopup] = React.useState(false);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeCustomer, setExcludeCustomer] = React.useState('');

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('user');
      setCustomerList(data);
      setOriginalCustomerList(data);
    };
    fetchCustomer();
  }, []);

  const deleteAnonymousCustomer = async () => {
    const data = await getBtnData('user');
    const excludeCustomer = data.filter((item) => item.name === 'anonimo');
    if (excludeCustomer.length > 0) {
      await Promise.all(
        excludeCustomer.map((item) => deleteData('user', item.id))
      );
    }
  };
  const deleteCustomer = (item, permission) => {
    setExcludeCustomer(item);
    setShowWarningDeltePopup(true);
    if (permission && excludeCustomer.name === item.name) {
      setShowWarningDeltePopup(false);
      deleteData('user', item.id);
    }
  };

  const handleChange = ({ target }) => {
    const searchValue = target.value.toLowerCase();
    setCustomer(searchValue);

    if (searchValue === '') {
      setCustomerList(originalCustomerList);
    } else {
      const filtered = originalCustomerList.filter((customer) => {
        const nameMatch =
          customer.name && customer.name.toLowerCase().includes(searchValue);
        const cpfMatch =
          customer.cpf && customer.cpf.toLowerCase().includes(searchValue);
        const birthdayMatch =
          customer.birthday &&
          customer.birthday.toLowerCase().includes(searchValue);

        return nameMatch || cpfMatch || birthdayMatch;
      });

      setCustomerList(filtered);
    }
  };

  const eachCustomer = (client) => {
    setOneClient(client);
    setShowPopup(true);
  };

  return (
    <div className="customerList-container">
      {showPopup && (
        <EachCustomer oneClient={oneClient} setShowPopup={setShowPopup} />
      )}

      <div className="search-container">
        <input
          type="text"
          value={customer}
          onChange={handleChange}
          placeholder="Busque pelo nome "
        />
      </div>
      <div className="button-title-container">
        {customerList && customerList.length > 0 && (
          <h5>
            <span>{customerList.length}</span> Clientes
          </h5>
        )}
        <h1>Lista de Clientes</h1>
        <button onClick={deleteAnonymousCustomer}>Excluir Anonimos</button>
      </div>
      <table striped bordered hover>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>Celular</th>
          <th>Aniverário</th>
          <th>Excluir</th>
        </tr>
        {customerList &&
          customerList.length > 0 &&
          customerList.map((item, index) => (
            <tr>
              <td onClick={() => eachCustomer(item)}>
                {firstNameClient(item.name)}
              </td>
              <td>{item.cpf}</td>
              <td>{item.phone}</td>
              <td>{item.birthday}</td>
              <td>
                {showWarningDeletePopup && (
                  <DefaultComumMessage
                    msg={`Você está prestes a excluir ${excludeCustomer.name}`}
                    item={excludeCustomer}
                    onConfirm={deleteCustomer}
                    onClose={() => setShowWarningDeltePopup(false)}
                  />
                )}
                <button onClick={() => deleteCustomer(item, false)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default CustomerList;
