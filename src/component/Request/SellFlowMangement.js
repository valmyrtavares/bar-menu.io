import React from 'react';
import {
  getBtnData,
  fetchingByQuery,
  getOneItemColleciton,
} from '../../api/Api.js';
import '../../assets/styles/requestManagementModule.module.scss';
import Input from '../Input.js';
import { Link } from 'react-router-dom';
import Title from '../title.js';
import TableComponent from './TableComponent.js';

const RequestManagementModule = () => {
  // const [requestList, setRequestList] = React.useState(null);
  // const [originalRequestList, setOriginalRequestList] = React.useState([]);
  // const [itemSelected, setItemSelected] = React.useState([]);
  // const [changeView, setChangeView] = React.useState(true);
  // const [totals, setTotals] = React.useState({
  //   totalCost: 0,
  //   totalPrice: 0,
  //   totalProfit: 0,
  // });
  const [itemTotals, setItemTotals] = React.useState([]);

  const [completeRequests, setCompleteRequests] = React.useState(null);
  const [filteredCompleteRequests, setFilteredCompleteRequests] =
    React.useState(null);

  const [form, setForm] = React.useState({
    startDate: '',
    endDate: '',
  });
  const [filterRequests, setFilterRequests] = React.useState(null);
  // const [loadMessage, setLoadMessage] = React.useState(false);

  // USEEFFECTS SESSION  **********************************************************************************

  React.useEffect(() => {
    const fetchRequest = async () => {
      try {
        const [requestData] = await Promise.all([getBtnData('request')]);
        setCompleteRequests(requestData);
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
          const copleteRequests = filteredRequests(
            //traz somente os pedidos do filtro de data
            completeRequests,
            startDate,
            endDate
          );

          setFilteredCompleteRequests(copleteRequests);
        }
      }
    };
    filterdDate();
  }, [form]);

  // React.useEffect(() => {
  //   if (filteredCompleteRequests) {
  //     filteredCompleteRequests.forEach((item) => {
  //       let payment = item.paymentMethod;
  //       let date = item.dateTime;
  //       item.request.forEach((requestItem) => {
  //         const line = ` <tr>
  //                 <td>{requestItem.name}</td>
  //                 <td>{payment}</td>
  //                 <td>{item.finalPrice}</td>
  //                 <td>{date}</td>
  //               `;
  //       });
  //     });
  //   }
  // }, [filteredCompleteRequests]);

  // Novo useEffect para calcular o total quando a lista de pedidos mudar

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

  // const calculateProductsStatus = async (filteredRequestsSended) => {
  //   const productMap = {};
  //   setFilterRequests(filteredRequestsSended);
  //   if (filteredRequestsSended && filteredRequestsSended.length > 0) {
  //     for (const item of filteredRequestsSended) {
  //       let sideDishesCost = 0;
  //       let sideDishesProfit = 0;

  //       if (item.sideDishes && item.sideDishes.length > 0) {
  //         // Verifica se há acompanhamentos e obtém os custos e lucros
  //         const sideDishesResults = await Promise.all(
  //           item.sideDishes.map((sidedish) =>
  //             fetchSideDishesGlobalCost(sidedish.name, 'sideDishes')
  //           )
  //         );

  //         sideDishesResults.forEach((result) => {
  //           if (result) {
  //             sideDishesCost += result.cost;
  //             sideDishesProfit += result.profit;
  //           }
  //         });
  //       }

  //       const mainDishData = await fetchDishesGlobalCost(item.id, item.size);

  //       // Verifique se `mainDishData` existe antes de tentar acessar `cost` e `price`
  //       if (mainDishData) {
  //         const { cost = 0, price = 0 } = mainDishData; // Define valores padrão
  //         sideDishesCost += Number(cost);
  //         sideDishesProfit += Number(price) - Number(cost);
  //       }

  //       const { name, finalPrice } = item;
  //       const FinalMainprice = Number(finalPrice) || 0;

  //       // Verifica se o produto já está no productMap e acumula os valores
  //       if (productMap[name]) {
  //         productMap[name].repetitions += 1;
  //         productMap[name].totalSum += FinalMainprice;
  //         productMap[name].cost += sideDishesCost; // Acumula o cost
  //         productMap[name].profit += sideDishesProfit; // Acumula o profit
  //       } else {
  //         productMap[name] = {
  //           name: name,
  //           repetitions: 1,
  //           totalSum: FinalMainprice,
  //           cost: sideDishesCost, // Inicia com o valor calculado
  //           profit: sideDishesProfit, // Inicia com o valor calculado
  //         };
  //       }
  //     }
  //   }
  //   console.log('productMap   ', productMap);
  //   return Object.values(productMap);
  // };

  // const fetchDishesGlobalCost = async (id, size, name) => {
  //   console.log('name  ', name);
  //   const { costProfitMarginCustomized, costPriceObj } =
  //     await getOneItemColleciton('item', id);
  //   let currentCostData;
  //   if (costProfitMarginCustomized && costPriceObj) {
  //     if (size === '') {
  //       return {
  //         ...costPriceObj,
  //         cost: Number(costPriceObj.cost), // Converte `cost` para número
  //         price: Number(costPriceObj.price), // Converte `price` para número
  //       };
  //     } else {
  //       currentCostData = Object.values(costProfitMarginCustomized || {}).find(
  //         (priceObj) => priceObj.label === size
  //       );
  //     }
  //     return currentCostData
  //       ? {
  //           ...currentCostData,
  //           cost: Number(currentCostData.cost), // Converte `cost` para número
  //           price: Number(currentCostData.price), // Converte `price` para número
  //         }
  //       : undefined;
  //   }
  //   return undefined;
  // };

  // const fetchSideDishesGlobalCost = async (name, collectionName) => {
  //   const obj = await fetchingByQuery(name, collectionName);

  //   return {
  //     cost: Number(obj.costPriceObj.cost),
  //     profit: obj.costPriceObj.profit,
  //   };
  // };

  const handleChange = ({ target }) => {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value,
    });
  };

  return (
    <div className="management-requests">
      <Link to="/admin/admin">
        <Title mainTitle="Fechamento de Caixa" />
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

      <TableComponent filteredCompleteRequests={filteredCompleteRequests} />
    </div>
  );
};

export default RequestManagementModule;
