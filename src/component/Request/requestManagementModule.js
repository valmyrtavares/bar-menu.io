import React from "react";
import { getBtnData } from "../../api/Api";
import "../../assets/styles/requestManagementModule.css";
import Input from "../../component/Input.js";
import { cardClasses } from "@mui/material";

const RequestManagementModule = () => {
  const [requestList, setRequestList] = React.useState(null);
  const [originalRequestList, setOriginalRequestList] = React.useState([]);
  const [totalParams, setTotalParams] = React.useState({
    amount: 0,
    totalValue: 0,
  });
  const [form, setForm] = React.useState({
    startDate: "",
    endDate: "",
  });

  React.useEffect(() => {
    const fetchRequest = async () => {
      const data = await getBtnData("request");

      const allRequests = data.reduce((accumulator, currentOrder) => {
        const requestsWithDate = currentOrder.request.map((item) => {
          return {
            ...item,
            dateTime: currentOrder.dateTime,
          };
        });
        return [...accumulator, ...requestsWithDate];
      }, []);

      setRequestList(allRequests);
      setOriginalRequestList(allRequests);
    };

    fetchRequest();
  }, []);

  // UseEffect para filtrar as datas
  React.useEffect(() => {
    const filterdDate = () => {
      if (form.startDate && form.endDate) {
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);
        if (startDate > endDate) {
          alert("Data de início não pode ser maior que a data de fim.");
        } else {
          const filteredRequests = originalRequestList.filter((item) => {
            const itemDate = new Date(
              item.dateTime?.split(" - ")[0].split("/").reverse().join("-")
            );
            return itemDate >= startDate && itemDate <= endDate;
          });

          const statsList = calculateProductsStats(filteredRequests);
          setRequestList(statsList);
        }
      }
    };
    filterdDate();
  }, [form, originalRequestList]);

  // Novo useEffect para calcular o total quando a lista de pedidos mudar
  React.useEffect(() => {
    totalScore();
  }, [requestList]); // Executa totalScore sempre que requestList mudar

  const totalScore = () => {
    let price = 0;
    let amount = 0;

    if (requestList && requestList.length > 0) {
      requestList.forEach((item) => {
        if (item && item.totalSum && item.repetitions) {
          price += Number(item.totalSum);
          amount += Number(item.repetitions);
        }
      });
    }

    setTotalParams({
      amount: amount,
      totalValue: price,
    });
  };

  const calculateProductsStats = (filteredRequests) => {
    const productMap = {};

    filteredRequests.forEach((item) => {
      const { name, finalPrice } = item;
      const price = Number(finalPrice) || 0;

      if (productMap[name]) {
        productMap[name].repetitions += 1;
        productMap[name].totalSum += price;
      } else {
        productMap[name] = {
          name: name,
          repetitions: 1,
          totalSum: price,
        };
      }
    });

    return Object.values(productMap);
  };

  const handleChange = ({ target }) => {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value,
    });
  };

  return (
    <div className="management-requests">
      <div className="container-date">
        <div>
          <Input
            id="startDate"
            required
            label="Data Inicial"
            value={form.startDate}
            type="date"
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            id="endDate"
            required
            label="Data Final"
            value={form.endDate}
            type="date"
            onChange={handleChange}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>quantidade</th>
            <th>valor total</th>
          </tr>
        </thead>
        <tbody>
          {requestList &&
          requestList.length > 0 &&
          requestList[0].repetitions ? (
            requestList.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.repetitions}</td>
                <td>{item.totalSum}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-message">
                Selecione alguma data válida
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="score-total">
        <p></p>
        <p>
          QUANTIDADE <span>{totalParams.amount}</span>
        </p>
        <p>
          TOTAL R$<span>{totalParams.totalValue},00</span>
        </p>
      </div>
    </div>
  );
};

export default RequestManagementModule;
