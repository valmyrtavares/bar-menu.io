import React from 'react';
import { getOneItemColleciton } from '../../api/Api';
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import '../../assets/styles/AccountingManagementPopup.css';
import CloseBtn from '../closeBtn';
import { app } from '../../config-firebase/firebase.js';

const AccountingManagementPopup = ({
  dishesRequested,
  setShowAccountingManagementPopup,
  setTotals,
}) => {
  const [costPrice, setCostPrice] = React.useState(null);
  const [sideDishesData, setSideDishesData] = React.useState({});
  const db = getFirestore(app);

  // USEEFFECTS SESSION  **********************************************************************************

  React.useEffect(() => {
    const fetchDishAndSideDishes = async () => {
      if (dishesRequested && dishesRequested.length > 0) {
        console.log('DISHES REQUESTED:', dishesRequested);

        // Busca os dados principais do prato
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

        // Busca os dados dos acompanhamentos
        const fetchedData = {};

        for (const item of dishesRequested) {
          if (item.sideDishes) {
            for (const sideDish of item.sideDishes) {
              if (!fetchedData[sideDish.name]) {
                try {
                  const sideDishData = await fetchingSideDishes(sideDish.name);
                  fetchedData[sideDish.name] = sideDishData;
                } catch (error) {
                  console.error(
                    'Erro ao buscar acompanhamento:',
                    sideDish.name,
                    error
                  );
                }
              }
            }
          }
        }

        setSideDishesData(fetchedData);
        console.log('SIDE DISHES DATA:', fetchedData); // Log para monitorar o conteúdo de sideDishesData
      } else {
        console.warn('dishesRequested ou dishesRequested.id estão indefinidos');
      }
    };

    fetchDishAndSideDishes();
  }, [dishesRequested]);

  React.useEffect(() => {
    if (costPrice) {
      console.log('costPrice     ', costPrice);
    }
  }, [costPrice]);

  // FUNCTION SESSION  **********************************************************************************

  // Função para buscar dados do acompanhamento no Firestore
  const fetchingSideDishes = async (name) => {
    try {
      const sideDishesRef = collection(db, 'sideDishes'); // referencia a coleção "sideDishes"

      // Filtra os documentos pelo campo "sideDishes" igual ao nome recebido
      const q = query(sideDishesRef, where('sideDishes', '==', name));

      const querySnapshot = await getDocs(q); // Executa a consulta

      // Verifica se encontrou algum documento
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Pega o primeiro documento encontrado
        const costPriceObj = doc.data(); // Obtém os dados do documento
        // Retorna o objeto com os dados de custo e preço
        return {
          cost: costPriceObj.costPriceObj.cost,
          price: costPriceObj.price,
          percentage: costPriceObj.costPriceObj.percentage,
          profit: costPriceObj.costPriceObj.profit,
        };
      } else {
        console.log('Acompanhamento não encontrado');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar o acompanhamento:', error);
      return null;
    }
  };

  //renderTableRows

  const renderTableRows = () => {
    if (!costPrice?.costPriceObj) {
      return <h1>Esses dados não foram cadastrados</h1>;
    }

    let totalCost = 0;
    let totalPrice = 0;
    let totalProfit = 0;

    const rows = dishesRequested.flatMap((item, index) => {
      let currentCostData;

      if (item.size) {
        currentCostData = Object.values(
          costPrice.costProfitMarginCustomized || {}
        ).find((priceObj) => priceObj.label === item.size);
      }

      const costData = currentCostData || costPrice.costPriceObj;
      const profit = costData ? costData.price - costData.cost : null;

      // Acumula os valores do item principal
      if (costData) {
        totalCost += Number(costData.cost);
        totalPrice += Number(costData.price);
        totalProfit += Number(profit);
      }

      // Verifica se existem acompanhamentos
      const hasSideDishes = item.sideDishes && item.sideDishes.length > 0;

      // Primeira linha: Dados do item principal
      console.log('costData   ', costData);
      const mainRow = (
        <tr key={`${index}-main`}>
          <td>{item.name}</td>
          <td>{costData?.cost || 'N/A'}</td>
          <td>{costData?.price || 'N/A'}</td>
          <td>{profit || 'N/A'}</td>
          <td>{costData?.percentage || 'N/A'}</td>
        </tr>
      );

      // Gera as linhas dos acompanhamentos
      const sideDishRows = hasSideDishes
        ? item.sideDishes.map((sideDish, sideIndex) => {
            const sideData = sideDishesData[sideDish.name];
            const sideProfit = sideData ? sideData.price - sideData.cost : null;

            if (sideData) {
              // Acumula os valores dos acompanhamentos
              totalCost += Number(sideData.cost);
              totalPrice += Number(sideData.price);
              totalProfit += Number(sideProfit);
            }

            return (
              <tr key={`${index}-sideDish-${sideIndex}`}>
                <td colSpan="5"></td> {/* Células vazias para alinhamento */}
                <td>{sideDish.name}</td>
                <td>{sideData?.cost || 'N/A'}</td>
                <td>{sideData?.price || 'N/A'}</td>
                <td>{sideProfit || 'N/A'}</td>
                <td>{sideData?.percentage || 'N/A'}</td>
              </tr>
            );
          })
        : [];

      // Retorna um array com a linha do item principal seguida das linhas dos acompanhamentos
      return [mainRow, ...sideDishRows];
    });

    // Adiciona a linha de totais no final da tabela
    rows.push(
      <tr key="totals">
        <td></td>
        <td>
          <strong>{Number(totalCost).toFixed(2)}</strong>
        </td>
        <td>
          <strong>{Number(totalPrice).toFixed(2)}</strong>
        </td>
        <td>
          <strong>{Number(totalProfit).toFixed(2)}</strong>
        </td>
        <td colSpan="6"></td>
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
