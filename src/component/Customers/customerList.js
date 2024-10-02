import React from "react";
import "../../assets/styles/customerList.css";
import { getBtnData, deleteData } from "../../api/Api";
import { getFirstFourLetters, firstNameClient } from "../../Helpers/Helpers";

const CustomerList = () => {
  const [customerList, setCustomerList] = React.useState(null);
  const [customer, setCustomer] = React.useState("");
  const [originalCustomerList, setOriginalCustomerList] = React.useState([]);

  React.useEffect(() => {
    const fetchCustomer = async () => {
      const data = await getBtnData("user");
      setCustomerList(data);
      setOriginalCustomerList(data);
    };
    fetchCustomer();
  }, []);

  const deleteAnonymousCustomer = async () => {
    const data = await getBtnData("user");
    const excludeCustomer = data.filter((item) => item.name === "anonimo");
    if (excludeCustomer.length > 0) {
      await Promise.all(
        excludeCustomer.map((item) => deleteData("user", item.id))
      );
    }
  };

  const handleChange = ({ target }) => {
    const searchValue = target.value.toLowerCase();
    setCustomer(searchValue);

    if (searchValue === "") {
      setCustomerList(originalCustomerList);
    } else {
      const filtered = originalCustomerList.filter(
        (customer) =>
          (customer.name &&
            customer.name.toLowerCase().includes(searchValue)) ||
          (customer.cpf && customer.cpf.toLowerCase().includes(searchValue))
      );
      setCustomerList(filtered);
    }
  };

  return (
    <div className="customerList-container">
      <div className="search-container">
        <input
          type="text"
          value={customer}
          onChange={handleChange}
          placeholder="Busque pelo nome "
        />
      </div>
      <div className="button-title-container">
        <h1>Lista de Clientes</h1>
        <button onClick={deleteAnonymousCustomer}>Excluir Anonimos</button>
      </div>
      <table striped bordered hover>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>Celular</th>
          <th>Email</th>
        </tr>
        {customerList &&
          customerList.length > 0 &&
          customerList.map((item, index) => (
            <tr>
              <td>{firstNameClient(item.name)}</td>
              <td>{item.cpf}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default CustomerList;
