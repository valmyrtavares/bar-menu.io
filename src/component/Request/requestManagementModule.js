import React from 'react';
import { getBtnData } from '../../api/Api';
import style from '../../assets/styles/requestManagementModule.module.scss';
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
          if (!Array.isArray(currentOrder.request)) {
            console.warn(
              'Elemento ignorado, `request` não é um array:',
              currentOrder
            );
            return accumulator; // Ignora itens com estrutura inesperada
          }
          const requestsWithDate =
            currentOrder.request?.map((item) => {
              return {
                ...item,
                dateTime: currentOrder.dateTime,
                paymentMethod: currentOrder.paymentMethod,
              };
            }) || [];
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
            //return an array with requests between the dates
            //traz somente os pedidos do filtro de data
            originalRequestList, // all requests
            startDate,
            endDate
          );

          const statusList = await calculateProductsStatus(
            originalRequestListArray
          );
          console.log('statusList   ', statusList);
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
    let card = 0;
    let profit = 0;
    let cost = 0;
    if (requestList && requestList.length > 0) {
      requestList.forEach((item) => {
        if (item && item.totalSum && item.repetitions) {
          price += Number(item.totalSum);
          amount += Number(item.repetitions);
          profit += Number(item.profit);
          card += Number(item.card);
          cost += Number(item.cost);
        }
      });
    }

    setTotalParams({
      ...totalParams,
      amount: amount,
      card: card,
      totalValue: price,
      cost: cost,
      profit: profit,
    });
  };

  const calculateTransactionFee = (totalSum, paymentMethod) => {
    const fees = {
      debit: 0.025, // 2.5%
      pix: 0.025, // 2.5%
      cash: 0, // 0% para dinheiro
      credite: 0.029, // 2.9%
      vr: 0.07, // 7% para VR
    };

    const feeRate = fees[paymentMethod] || 0; // Padrão 0 caso o método não seja encontrado
    let result = totalSum * feeRate;
    return result;
  };

  const calculateProductsStatus = async (filteredRequestsSended) => {
    const productMap = {};

    setFilterRequests(filteredRequestsSended);

    if (filteredRequestsSended && filteredRequestsSended.length > 0) {
      for (const item of filteredRequestsSended) {
        let sideDishesCost = 0;
        let sideDishesProfit = 0;

        // Calcula custos e lucros dos acompanhamentos
        if (item.sideDishes && item.sideDishes.length > 0) {
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

        // Obtém dados do prato principal
        const mainDishData = fetchDishesGlobalCost(
          item.id,
          item.size,
          item.name
        );
        if (mainDishData) {
          const { cost = 0, price = 0 } = mainDishData;
          sideDishesCost += Number(cost);
          sideDishesProfit += Number(price) - Number(cost);
        }

        const { name, finalPrice, paymentMethod } = item;
        const FinalMainprice = Number(finalPrice) || 0;

        // Calcula a taxa do cartão com base no método de pagamento
        const transactionFee = calculateTransactionFee(
          FinalMainprice,
          paymentMethod
        );

        // Verifica se o produto já está no productMap e acumula os valores
        if (productMap[name]) {
          productMap[name].repetitions += 1;
          productMap[name].totalSum += FinalMainprice;
          productMap[name].cost += isNaN(sideDishesCost) ? 0 : sideDishesCost;
          productMap[name].profit +=
            FinalMainprice - (transactionFee + sideDishesCost); // Atualiza o lucro
          productMap[name].card += transactionFee; // Acumula a taxa do cartão
        } else {
          productMap[name] = {
            name: name,
            repetitions: 1,
            totalSum: FinalMainprice,
            cost: isNaN(sideDishesCost) ? 0 : sideDishesCost,
            profit: FinalMainprice - (transactionFee + sideDishesCost), // Calcula o lucro inicial
            card: transactionFee, // Inicia com a taxa do cartão
          };
        }
      }
    }

    console.log('productMap:', productMap);
    return Object.values(productMap);
  };

  const fetchDishesGlobalCost = (id, size, name) => {
    let selectedDish = dish.find((item) => item.id === id);
    // Se não encontrado, tenta pelo título (name)
    if (!selectedDish) {
      selectedDish = dish.find((item) => {
        // Ignora diferenças de maiúsculas/minúsculas e remove espaços extras
        return item.title.trim().toLowerCase() === name.trim().toLowerCase();
      });
    }
    const { costProfitMarginCustomized = {}, costPriceObj = {} } =
      selectedDish || {};

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
    <div className={style.managementRequests}>
      {showAccountingManagementPopup && (
        <AccountingManagementPopup
          dishesRequested={itemSelected}
          setShowAccountingManagementPopup={setShowAccountingManagementPopup}
          setTotals={setTotals}
        />
      )}
      {loadMessage && <Loading />}
      <Link to="/admin/admin">
        <Title mainTitle=" Vendas" />
      </Link>
      <div className={style.containerDate}>
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
      <div className={style.containerRequestManagementTable}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>quantidade</th>
              <th>valor total</th>
              <th>Cartão</th>
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
                  <td>{Number(item.card).toFixed(2)}</td>
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
              <td>{Number(totalParams.card || 0).toFixed(2)}</td>
              <td>{Number(totalParams.cost || 0).toFixed(2)}</td>
              <td>{Number(totalParams.profit || 0).toFixed(2)}</td>
              <td>{totalParams.discount !== 0 ? totalParams.discount : 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestManagementModule;
