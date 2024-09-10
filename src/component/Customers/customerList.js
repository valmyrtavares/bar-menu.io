import React from "react";
import "../../assets/styles/customerList.css";
import { getBtnData } from "../../api/Api";
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

  const handleChange = ({ target }) => {
    const searchValue = target.value.toLowerCase();
    setCustomer(searchValue);

    if (searchValue === "") {
      setCustomerList(originalCustomerList);
    } else {
      const filtered = originalCustomerList.filter(
        (customer) =>
          customer.name && customer.name.toLowerCase().includes(searchValue)
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
      <h1>Lista de Clientes</h1>
      <table striped bordered hover>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>Celular</th>
        </tr>
        {customerList &&
          customerList.length > 0 &&
          customerList.map((item, index) => (
            <tr>
              <td>{firstNameClient(item.name)}</td>
              <td>{item.cpf}</td>
              <td>{item.phone}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default CustomerList;
