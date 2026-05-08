import React from 'react';
import clients from '../../assets/styles/customerList.module.scss';
import { getBtnData, deleteData } from '../../api/Api';
import { getFirstFourLetters, firstNameClient } from '../../Helpers/Helpers';
import EachCustomer from './eachCustomer';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { Link } from 'react-router-dom';
import Title from '../title';

const CustomerList = () => {
  const [customerList, setCustomerList] = React.useState(null);
  const [customer, setCustomer] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState('');
  const [originalCustomerList, setOriginalCustomerList] = React.useState([]);
  const [oneClient, setOneClient] = React.useState({});
  const [showPopup, setShowPopup] = React.useState(false);
  const [showWarningDeletePopup, setShowWarningDeltePopup] =
    React.useState(false);
  const [excludeCustomer, setExcludeCustomer] = React.useState('');
  const [refreshData, setRefreshData] = React.useState(false);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('user');
      setCustomerList(data);
      setOriginalCustomerList(data);
    };
    fetchCustomer();
  }, []);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData('user');
      setCustomerList(data);
      setOriginalCustomerList(data);
    };
    fetchCustomer();
  }, [refreshData]);

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
      setRefreshData((prev) => !prev);
    }
  };

  const applyFilters = (searchValue, monthValue) => {
    let filtered = originalCustomerList;

    if (searchValue) {
      filtered = filtered.filter((item) => {
        const nameMatch =
          item.name && item.name.toLowerCase().includes(searchValue);
        const cpfMatch =
          item.cpf && item.cpf.toLowerCase().includes(searchValue);
        const phoneMatch =
          item.phone && item.phone.toLowerCase().includes(searchValue);
        const birthdayMatch =
          item.birthday && item.birthday.toLowerCase().includes(searchValue);

        return nameMatch || cpfMatch || phoneMatch || birthdayMatch;
      });
    }

    if (monthValue) {
      filtered = filtered.filter((item) => {
        if (!item.birthday) return false;
        // Normaliza barras para hífens para garantir que o padrão -MM- funcione em ambos os formatos
        const normalizedBirthday = item.birthday.replace(/\//g, '-');
        return normalizedBirthday.includes(`-${monthValue}-`);
      });
    }

    setCustomerList(filtered);
  };

  const handleChange = ({ target }) => {
    const searchValue = target.value.toLowerCase();
    setCustomer(searchValue);
    applyFilters(searchValue, selectedMonth);
  };

  const handleMonthChange = ({ target }) => {
    const monthValue = target.value;
    setSelectedMonth(monthValue);
    applyFilters(customer, monthValue);
  };

  const eachCustomer = (client) => {
    setOneClient(client);
    setShowPopup(true);
  };

  return (
    <div className={clients.customerListContainer}>
      {showPopup && (
        <EachCustomer oneClient={oneClient} setShowPopup={setShowPopup} />
      )}

      <div className={clients.searchContainer}>
        <input
          type="text"
          value={customer}
          onChange={handleChange}
          placeholder="Busque por nome, CPF ou telefone"
        />
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className={clients.monthSelect}
        >
          <option value="">Aniversariantes do Mês</option>
          <option value="01">Janeiro</option>
          <option value="02">Fevereiro</option>
          <option value="03">Março</option>
          <option value="04">Abril</option>
          <option value="05">Maio</option>
          <option value="06">Junho</option>
          <option value="07">Julho</option>
          <option value="08">Agosto</option>
          <option value="09">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>
      </div>
      <div className={clients.headerContainer}>
        <div className={clients.helpIconContainer}>
          <a
            href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.4kp1o8aw6chf"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir documentação"
          >
            <span>?</span>
          </a>
        </div>
        <Link to="/admin/admin">
          <Title mainTitle="Lista de Clientes" />
        </Link>
      </div>

      <div className={clients.buttonTitleContainer}>
        {customerList && customerList.length > 0 && (
          <h5>
            <span>{customerList.length}</span> Clientes
          </h5>
        )}
        <button onClick={deleteAnonymousCustomer}>Excluir Anonimos</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Celular</th>
            <th>Aniverário</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {customerList &&
            customerList.length > 0 &&
            customerList.map((item, index) => (
              <tr key={index}>
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
        </tbody>
      </table>
    </div>
  );
};
export default CustomerList;
