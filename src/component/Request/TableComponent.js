import React from 'react';
import { requestSorter } from '../../Helpers/Helpers.js';
import style from '../../assets/styles/TableComponent.module.scss';

const TableComponent = ({ filteredCompleteRequests }) => {
  const [totalInScreen, setTotalInScreen] = React.useState(null);

  React.useEffect(() => {
    if (filteredCompleteRequests) {
      console.log('I am here    ', filteredCompleteRequests);
    }
    const TotalObject = totalSellOfDay();
    if (TotalObject) {
      setTotalInScreen(TotalObject);
    }
  }, [filteredCompleteRequests]);

  React.useState(() => {
    if (totalInScreen) {
      showTotals();
    }
  }, [totalInScreen]);

  const showTotals = () => {
    if (totalInScreen) {
      return (
        <table>
          <thead>
            <tr>
              <th>Método de Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Débito</td>
              <td>{totalInScreen.debit}</td>
            </tr>
            <tr>
              <td>Crédito</td>
              <td>{totalInScreen.credit}</td>
            </tr>
            <tr>
              <td>Dinheiro</td>
              <td>{totalInScreen.cash}</td>
            </tr>
            <tr>
              <td>Pix</td>
              <td>{totalInScreen.pix}</td>
            </tr>
            <tr>
              <td>Total Bruto</td>
              <td>{totalInScreen.grossdiscount}</td>
            </tr>
            <tr>
              <td>Desconto</td>
              <td>{totalInScreen.discount}</td>
            </tr>
            <tr>
              <td>Total com Desconto</td>
              <td>{totalInScreen.total}</td>
            </tr>
          </tbody>
        </table>
      );
    }
  };

  const renderTableRows = () => {
    if (!filteredCompleteRequests || filteredCompleteRequests.length === 0) {
      return null;
    }
    filteredCompleteRequests = requestSorter(filteredCompleteRequests);

    return filteredCompleteRequests.flatMap((item) => {
      const {
        paymentMethod,
        dateTime,
        countRequest,
        finalPriceRequest,
        request,
      } = item;

      // Cria uma linha para cada item dentro de `request`
      return request.map((requestItem, index) => (
        <tr key={`${requestItem.name}-${index}`}>
          <td>{requestItem.name}</td>
          <td>{countRequest}</td>
          <td>{paymentMethod}</td>
          <td>{finalPriceRequest}</td>
          <td>{requestItem.finalPrice}</td>
          <td>{dateTime}</td>
        </tr>
      ));
    });
  };

  const totalSellOfDay = () => {
    if (!filteredCompleteRequests || filteredCompleteRequests.length === 0) {
      return null;
    }

    // Objeto inicial para acumular os totais
    const totals = filteredCompleteRequests.reduce(
      (acc, item) => {
        const { paymentMethod, request, finalPriceRequest } = item;

        // Calcula a soma dos preços dos itens no pedido
        const sumItemsPrice = request.reduce(
          (sum, reqItem) => sum + reqItem.finalPrice,
          0
        );

        // Adiciona ao total geral
        acc.total += finalPriceRequest;

        // Calcula o desconto (se houver diferença)
        const discount = sumItemsPrice - finalPriceRequest;

        if (discount > 0) {
          acc.discount += discount; // Acumula o desconto
        }

        // Soma aos subtotais por método de pagamento
        request.forEach((reqItem) => {
          const price = reqItem.finalPrice;
          acc.grossdiscount += price;

          if (paymentMethod === 'debit') {
            acc.debit += price;
          } else if (paymentMethod === 'credite') {
            acc.credit += price;
          } else if (paymentMethod === 'cash') {
            acc.cash += price;
          } else if (paymentMethod === 'pix') {
            acc.pix += price;
          }
        });

        return acc;
      },
      {
        total: 0,
        debit: 0,
        credit: 0,
        cash: 0,
        pix: 0,
        discount: 0,
        grossdiscount: 0,
      } // Objeto inicial
    );

    return totals; // Retorna o objeto final com os totais
  };

  return (
    <div className={style.containerTable}>
      {showTotals()}
      <table>
        <thead>
          <tr>
            <th>Nome do Produto</th>
            <th>Numero</th>
            <th>Método de Pagamento</th>
            <th>Preço Final</th>
            <th>Preço item</th>
            <th>Data e Hora</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
    </div>
  );
};

export default TableComponent;
