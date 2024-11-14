import React from 'react';
import {
  getBtnData,
  fetchingByQuery,
  getOneItemColleciton,
} from '../../api/Api';
import '../../assets/styles/requestManagementModule.css';
import Input from '../../component/Input.js';
import { cardClasses } from '@mui/material';
import AccountingManagementPopup from './AccountingManagementPopup';

const RequestManagementModule = () => {
  const [requestList, setRequestList] = React.useState(null);
  const [originalRequestList, setOriginalRequestList] = React.useState([]);
  const [itemSelected, setItemSelected] = React.useState([]);
  const [totals, setTotals] = React.useState({
    totalCost: 0,
    totalPrice: 0,
    totalProfit: 0,
  });
  const [itemTotals, setItemTotals] = React.useState([]);

  const [showAccountingManagementPopup, setShowAccountingManagementPopup] =
    React.useState(false);
  const [totalParams, setTotalParams] = React.useState({
    amount: 0,
    totalValue: 0,
  });
  const [form, setForm] = React.useState({
    startDate: '',
    endDate: '',
  });
  const [filterRequests, setFilterRequests] = React.useState(null);

  // USEEFFECTS SESSION  **********************************************************************************

  React.useEffect(() => {
    const fetchRequest = async () => {
      const data = await getBtnData('request');
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
    const filterdDate = async () => {
      if (form.startDate && form.endDate) {
        const startDate = new Date(form.startDate);
        const endDate = new Date(form.endDate);
        if (startDate > endDate) {
          alert('Data de início não pode ser maior que a data de fim.');
        } else {
          const filteredRequests = originalRequestList.filter((item) => {
            const itemDate = new Date(
              item.dateTime?.split(' - ')[0].split('/').reverse().join('-')
            );
            return itemDate >= startDate && itemDate <= endDate;
          });

          const statusList = await calculateProductsStatus(filteredRequests);

          setRequestList(statusList);
        }
      }
    };
    filterdDate();
  }, [form, originalRequestList]);

  // Novo useEffect para calcular o total quando a lista de pedidos mudar
  React.useEffect(() => {
    if (requestList) {
      console.log('requestList    ', requestList);
    }
    totalScore();
  }, [requestList]); // Executa totalScore sempre que requestList mudar

  // React.useEffect(() => {
  //   console.log('FILTER REQUESTS    ', filterRequests);
  // }, [filterRequests]);

  // FUNCTION SESSION******************************************************************************

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

  const calculateProductsStatus = async (filteredRequestsSended) => {
    const productMap = {};
    setFilterRequests(filteredRequestsSended);

    for (const item of filteredRequestsSended) {
      let sideDishesCost = 0;
      let sideDishesProfit = 0;

      // Verifica se há acompanhamentos e obtém os custos e lucros
      if (item.sideDishes && item.sideDishes.length > 0) {
        const sideDishesResults = await Promise.all(
          item.sideDishes.map((sidedish) =>
            fetchSideDishesGlobalCost(sidedish.name, 'sideDishes')
          )
        );

        sideDishesResults.forEach((result) => {
          if (result) {
            sideDishesCost += result.cost;
            sideDishesProfit += result.profit;
          }
        });
      }

      const mainDishData = await fetchDishesGlobalCost(item.id, item.size);

      // Verifique se `mainDishData` existe antes de tentar acessar `cost` e `price`
      if (mainDishData) {
        const { cost = 0, price = 0 } = mainDishData; // Define valores padrão
        sideDishesCost += Number(cost);
        sideDishesProfit += Number(price) - Number(cost);
      }

      const { name, finalPrice } = item;
      const FinalMainprice = Number(finalPrice) || 0;

      // Verifica se o produto já está no productMap e acumula os valores
      if (productMap[name]) {
        productMap[name].repetitions += 1;
        productMap[name].totalSum += FinalMainprice;
        productMap[name].cost += sideDishesCost; // Acumula o cost
        productMap[name].profit += sideDishesProfit; // Acumula o profit
      } else {
        productMap[name] = {
          name: name,
          repetitions: 1,
          totalSum: FinalMainprice,
          cost: sideDishesCost, // Inicia com o valor calculado
          profit: sideDishesProfit, // Inicia com o valor calculado
        };
      }
    }
    console.log('productMap   ', productMap);
    return Object.values(productMap);
  };

  const fetchDishesGlobalCost = async (id, size, name) => {
    console.log('name  ', name);
    const { costProfitMarginCustomized, costPriceObj } =
      await getOneItemColleciton('item', id);
    let currentCostData;
    if (costProfitMarginCustomized && costPriceObj) {
      if (size === '') {
        return {
          ...costPriceObj,
          cost: Number(costPriceObj.cost), // Converte `cost` para número
          price: Number(costPriceObj.price), // Converte `price` para número
        };
      } else {
        currentCostData = Object.values(costProfitMarginCustomized || {}).find(
          (priceObj) => priceObj.label === size
        );
      }
      return currentCostData
        ? {
            ...currentCostData,
            cost: Number(currentCostData.cost), // Converte `cost` para número
            price: Number(currentCostData.price), // Converte `price` para número
          }
        : undefined;
    }
    return undefined;
  };

  const fetchSideDishesGlobalCost = async (name, collectionName) => {
    const obj = await fetchingByQuery(name, collectionName);

    return {
      cost: obj.costPriceObj.cost,
      profit: obj.costPriceObj.profit,
    };
  };

  const sendAccountManagementData = (dish) => {
    const itemSelectedProps = filterRequests.filter(
      (item) => item.name === dish.name
    );
    setItemSelected(itemSelectedProps);
    console.log('itemSelected', itemSelected);
    setShowAccountingManagementPopup(true);
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
      {showAccountingManagementPopup && (
        <AccountingManagementPopup
          dishesRequested={itemSelected}
          setShowAccountingManagementPopup={setShowAccountingManagementPopup}
          setTotals={setTotals}
        />
      )}
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
            <th> Custo</th>
            <th> Lucro</th>
          </tr>
        </thead>
        <tbody>
          {requestList &&
          requestList.length > 0 &&
          requestList[0].repetitions ? (
            requestList.map((item, index) => (
              <tr key={index} onClick={() => sendAccountManagementData(item)}>
                <td>{item.name}</td>
                <td>{item.repetitions}</td>
                <td>{item.totalSum}</td>
                <td>{item.cost}</td>
                <td>{item.profit}</td>
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
