import React from "react";
import "../../assets/styles/customerList.css";
import { getBtnData } from "../../api/Api";
import { getFirstFourLetters } from "../../Helpers/Helpers";

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
          <th>id</th>
          <th>Nome</th>
          <th>phone</th>
          <th>email</th>
        </tr>
        {customerList &&
          customerList.length > 0 &&
          customerList.map((item, index) => (
            <tr>
              <td>{getFirstFourLetters(item.id, 4)}</td>
              <td>{getFirstFourLetters(item.name, 8)}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default CustomerList;
