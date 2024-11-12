import React from 'react';
import { getOneItemColleciton } from '../../api/Api';
import '../../assets/styles/AccountingManagementPopup.css';
import CloseBtn from '../closeBtn';

const AccountingManagementPopup = ({
  dishesRequested,
  setShowAccountingManagementPopup,
  setTotals,
}) => {
  const [costPrice, setCostPrice] = React.useState(null);

  React.useEffect(() => {
    const fetchDish = async () => {
      if (dishesRequested && dishesRequested.length > 0) {
        try {
          const data = await getOneItemColleciton(
            'item',
            dishesRequested[0].id
          );

          setCostPrice({
            name: dishesRequested[0].name,
            costPriceObj: data?.costPriceObj ? data?.costPriceObj : undefined,
            costProfitMarginCustomized: data?.costProfitMarginCustomized
              ? data?.costProfitMarginCustomized
              : undefined,
          });
        } catch (error) {
          console.error('Erro ao buscar o item:', error);
        }
      } else {
        console.warn('dishesRequested ou dishesRequested.id estão indefinidos');
      }
    };

    fetchDish();
  }, [dishesRequested]);

  React.useEffect(() => {
    if (costPrice) {
      console.log('costPrice     ', costPrice);
    }
  }, [costPrice]);

  //renderTableRows

  const renderTableRows = () => {
    if (!costPrice?.costPriceObj) {
      return <h1>Esses dados não foram cadastrados</h1>;
    }

    let totalCost = 0;
    let totalPrice = 0;
    let totalProfit = 0;

    const rows = dishesRequested.map((item, index) => {
      let currentCostData;

      if (item.size) {
        currentCostData = Object.values(
          //Object.values(...) transforma o objeto em um array contendo todos os valores desse objeto. Por exemplo, se costProfitMarginCustomized tiver esta estrutura:
          costPrice.costProfitMarginCustomized || {}
        ).find((priceObj) => priceObj.label === item.size); //Aqui, .find(...) é usado para buscar um objeto específico dentro do array de valores. Ele retorna o primeiro objeto que satisfaz a condição fornecida.
      }

      const costData = currentCostData || costPrice.costPriceObj;
      const profit = costData ? costData.price - costData.cost : null;

      // Acumulando os valores
      if (costData) {
        totalCost += Number(costData.cost);
        totalPrice += Number(costData.price);
        totalProfit += Number(profit);
      }

      return (
        <tr key={index}>
          <td>{item.name}</td>
          <td>{costData.cost}</td>
          <td>{costData.price}</td>
          <td>{profit}</td>
          <td>{costData.percentage}</td>
          {item.sideDishes.length > 0 ? (
            <>
              <td>{item.name}</td>
              <td>{costData.cost}</td>
              <td>{costData.price}</td>
              <td>{profit}</td>
              <td>{costData.percentage}</td>
            </>
          ) : (
            ''
          )}
        </tr>
      );
    });

    // Enviando os totais para o componente pai
    setTotals({ totalCost, totalPrice, totalProfit });

    // Adicionando a linha de total no final
    rows.push(
      <tr key="totals">
        <td>
          <strong>Total</strong>
        </td>
        <td>
          <strong>{totalCost}</strong>
        </td>
        <td>
          <strong>{totalPrice}</strong>
        </td>
        <td>
          <strong>{totalProfit}</strong>
        </td>
      </tr>
    );

    return rows;
  };

  return (
    <div className="accounting-management-popup-container">
      <CloseBtn setClose={setShowAccountingManagementPopup} />
      {costPrice?.costPriceObj ? (
        <table striped bordered hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Custo</th>
              <th>Preço</th>
              <th>Lucro</th>
              <th>Porcentagem</th>
              <th>Nome</th>
              <th>Custo</th>
              <th>Preço</th>
              <th>Lucro</th>
              <th>Porcentagem</th>
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      ) : (
        <h1>Esses dados não foram cadastrados</h1>
      )}
    </div>
  );
};

export default AccountingManagementPopup;
