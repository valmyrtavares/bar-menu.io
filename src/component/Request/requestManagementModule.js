import React from 'react';
import { getBtnData } from '../../api/Api';
import '../../assets/styles/requestManagementModule.css';
import Input from '../../component/Input.js';
import AccountingManagementPopup from './AccountingManagementPopup';
import Loading from '../Loading.js';
import { Link } from 'react-router-dom';
import Title from '../title.js';

const RequestManagementModule = () => {
  const [requestList, setRequestList] = React.useState(null);
  const [originalRequestList, setOriginalRequestList] = React.useState([]);
  const [itemSelected, setItemSelected] = React.useState([]);
  const [totals, setTotals] = React.useState({
    totalCost: 0,
    totalPrice: 0,
    totalProfit: 0,
  });
  const [voucher, setVoucher] = React.useState([]);
  const [sideDish, setSideDish] = React.useState(null);
  const [dish, setDish] = React.useState(null);

  const [showAccountingManagementPopup, setShowAccountingManagementPopup] =
    React.useState(false);
  const [totalParams, setTotalParams] = React.useState({
    amount: 0,
    totalValue: 0,
    cost: 0,
    profit: 0,
    discount: 0,
  });
  const [form, setForm] = React.useState({
    startDate: '',
    endDate: '',
  });
  const [filterRequests, setFilterRequests] = React.useState(null);
  const [loadMessage, setLoadMessage] = React.useState(false);

  // USEEFFECTS SESSION  **********************************************************************************

  React.useEffect(() => {
    const fetchRequest = async () => {
      try {
        const [requestData, voucherData, sideDishesList, item] =
          await Promise.all([
            getBtnData('request'),
            getBtnData('voucherPromotion'),
            getBtnData('sideDishes'),
            getBtnData('item'),
          ]);
        const allRequests = requestData.reduce((accumulator, currentOrder) => {
          //grab all dishes inside of request put out of it and add in each dish the request's datatime creating a new list of dishes
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
        setDish(item);
        setSideDish(sideDishesList);
        setVoucher(voucherData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
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
          setLoadMessage(true);
          const originalRequestListArray = filteredRequests(
            //traz somente os pedidos do filtro de data
            originalRequestList,
            startDate,
            endDate
          );

          const statusList = await calculateProductsStatus(
            originalRequestListArray
          );

          console.log('VOUCHER   ', voucher);
          const voucherFiltered = filteredRequests(voucher, startDate, endDate);

          showDiscountsVoucher(voucherFiltered);
          setRequestList(statusList);
          setLoadMessage(false);
        }
      }
    };
    filterdDate();
  }, [form, originalRequestList]);

  // Novo useEffect para calcular o total quando a lista de pedidos mudar
  React.useEffect(() => {
    totalScore();
  }, [requestList]); // Executa totalScore sempre que requestList mudar

  // FUNCTION SESSION******************************************************************************

  const filteredRequests = (data, startDate, endDate) => {
    if (data && data.length > 0) {
      return data.filter((item) => {
        const itemDate = new Date(
          item.dateTime?.split(' - ')[0].split('/').reverse().join('-')
        );

        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    return []; // Retorna um array vazio se `data` estiver indefinido ou vazio
  };

  const showDiscountsVoucher = (voucherFiltered) => {
    let totalDiscount = 0;
    if (voucherFiltered) {
      voucherFiltered.forEach((item) => {
        totalDiscount += Number(item.discount);
      });
      setTotalParams({
        ...totalParams,
        discount: totalDiscount,
      });
      console.log('Total params 2   ', totalParams);
    }
  };

  const totalScore = () => {
    let price = 0;
    let amount = 0;
    let profit = 0;
    let cost = 0;

    if (requestList && requestList.length > 0) {
      requestList.forEach((item) => {
        if (item && item.totalSum && item.repetitions) {
          price += Number(item.totalSum);
          amount += Number(item.repetitions);
          profit += Number(item.profit);
          cost += Number(item.cost);
        }
      });
    }

    setTotalParams({
      ...totalParams,
      amount: amount,
      totalValue: price,
      cost: cost,
      profit: profit,
    });
  };

  const calculateProductsStatus = async (filteredRequestsSended) => {
    const productMap = {};
    setFilterRequests(filteredRequestsSended);
    if (filteredRequestsSended && filteredRequestsSended.length > 0) {
      for (const item of filteredRequestsSended) {
        let sideDishesCost = 0;
        let sideDishesProfit = 0;

        if (item.sideDishes && item.sideDishes.length > 0) {
          // Verifica se há acompanhamentos e obtém os custos e lucros
          const sideDishesResults = item.sideDishes.map((sidedish) =>
            fetchSideDishesGlobalCost(sidedish.name)
          );

          sideDishesResults.forEach((result) => {
            if (result) {
              sideDishesCost += result.cost;
              sideDishesProfit += result.profit;
            }
          });
        }

        const mainDishData = fetchDishesGlobalCost(item.id, item.size);

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
    }
    console.log('productMap   ', productMap);
    return Object.values(productMap);
  };

  const fetchDishesGlobalCost = (id, size, name) => {
    const selectedDish = dish.find((item) => item.id === id);

    const { costProfitMarginCustomized, costPriceObj } = selectedDish;

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

  const fetchSideDishesGlobalCost = (name) => {
    const obj = sideDish.find((dish) => dish.name === name);

    if (!obj) {
      // Retorna valores padrão se o item não for encontrado
      return { cost: 0, profit: 0 };
    }

    return {
      cost: Number(obj.costPriceObj.cost),
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
      {loadMessage && <Loading />}
      <Link to="/admin/admin">
        <Title mainTitle="Acompanhamento de Vendas" />
      </Link>
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
            <th>Desconto</th>
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
                <td>{Number(item.cost).toFixed(2)}</td>
                <td>{Number(item.profit).toFixed(2)}</td>
                <td colSpan="1"></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty-message">
                Selecione alguma data válida
              </td>
            </tr>
          )}
          <tr className="score-total">
            <td>Total</td>
            <td>{totalParams.amount}</td>
            <td>
              {totalParams.discount
                ? totalParams.totalValue - totalParams.discount
                : totalParams.totalValue}
              ,00
            </td>
            <td>{Number(totalParams.cost || 0).toFixed(2)}</td>
            <td>{Number(totalParams.profit || 0).toFixed(2)}</td>
            <td>{totalParams.discount !== 0 ? totalParams.discount : 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RequestManagementModule;
