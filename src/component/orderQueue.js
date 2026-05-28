import React from 'react';
import { db } from '../config-firebase/firebase';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { fetchInDataChanges } from '../api/Api.js';
import '../assets/styles/orderQueue.css';
import {
  getFirstFourLetters,
  firstNameClient,
  isOrderFullyFinished,
} from '../Helpers/Helpers.js';
import { requestSorter } from '../Helpers/Helpers.js';
import { Link } from 'react-router-dom';


const OrderQueue = () => {
  const [waitingLine, setWaitingLine] = React.useState([]);
  const [doneLine, setDoneLine] = React.useState([]);
  const [movingItem, setMovingItem] = React.useState(null);
  const [finalizedItem, setFinalizedItem] = React.useState(null);

  // Guardar os estados anteriores das listas
  const prevDoneLine = React.useRef(doneLine);
  const prevWaitingLine = React.useRef(waitingLine);

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('requests', (data) => {
      // Filtrar apenas pedidos que NÃO foram entregues (finalizados)
      const activeOrders = data.filter((item) => !item.orderDelivered);

      // Separando os dados em duas listas com base no status de finalização
      // Em preparo: done é true (vindo do modal) E ainda não está totalmente pronto na cozinha
      let waitingLineData = activeOrders.filter(
        (item) => item.done && !isOrderFullyFinished(item)
      );
      waitingLineData = requestSorter(waitingLineData);

      // Pronto: cozinha marcou tudo como pronto/entregue OU done foi setado como false manualmente
      let doneLineData = activeOrders.filter(
        (item) => item.done === false || isOrderFullyFinished(item)
      );
      doneLineData = requestSorter(doneLineData);

      setWaitingLine(waitingLineData);
      setDoneLine(doneLineData);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    // Identificando o item movido (do waitingLine para doneLine)
    const movedItem = prevWaitingLine.current.find(
      (item) => !waitingLine.some((waitingItem) => waitingItem.id === item.id) &&
                doneLine.some((doneItem) => doneItem.id === item.id)
    );

    if (movedItem) {
      setMovingItem(movedItem);
      // Clear the popup after the animation completes (4s)
      setTimeout(() => {
        setMovingItem(null);
      }, 4000);
    }

    // Identificando o item finalizado (saiu do doneLine e não voltou para waitingLine)
    const finishedItem = prevDoneLine.current.find(
      (item) => !doneLine.some((doneItem) => doneItem.id === item.id) &&
                !waitingLine.some((waitItem) => waitItem.id === item.id)
    );

    if (finishedItem) {
      setFinalizedItem(finishedItem);
      setTimeout(() => {
        setFinalizedItem(null);
      }, 2000);
    }

    // Atualizar os estados anteriores com os novos estados
    prevDoneLine.current = doneLine;
    prevWaitingLine.current = waitingLine;
  }, [doneLine, waitingLine]);

  // Dynamic scaling calculations
  const maxItems = Math.max(waitingLine.length, doneLine.length, 6);
  const scale = maxItems > 6 ? 6 / maxItems : 1;

  const dynamicItemStyle = {
    padding: `${15 * scale}px`,
    marginBottom: `${10 * scale}px`,
  };

  const dynamicTextStyle = {
    fontSize: `${28 * scale}px`,
  };

  return (
    <div className="order-queue-container">
      <div className="title-btn-container">
        <h1>Fila de Pedidos</h1>
        <Link to={localStorage.getItem('tableNumber') ? `/${localStorage.getItem('tableNumber')}` : "/"}>X</Link>
      </div>
      <p>Acompanhe abaixo o andamento e o status do seu pedido</p>

      {movingItem && (
        <div className="ready-popup-overlay">
          <h2>Seu pedido está pronto!</h2>
          <h1>{firstNameClient(movingItem.name)} - {movingItem.countRequest}</h1>
        </div>
      )}

      {finalizedItem && (
        <div className="finalized-name-overlay">
          {firstNameClient(finalizedItem.name)} - {finalizedItem.countRequest}
        </div>
      )}

      <div className="list-columns">
        <div>
          <h3>Em preparo</h3>
          {waitingLine &&
            waitingLine.length > 0 &&
            waitingLine.map((item, index) => (
              <div className="border-red" key={index}>
                <div className="horizont-line-queue" style={dynamicItemStyle}>
                  <p style={dynamicTextStyle}>{firstNameClient(item.name)} - {item.countRequest}</p>
                </div>
              </div>
            ))}
        </div>
        <div>
          <h3>Pronto</h3>
          {doneLine &&
            doneLine.length > 0 &&
            doneLine.map((item, index) => (
              <div className="border-green" key={index}>
                <div key={item.id} className="horizont-line-queue" style={dynamicItemStyle}>
                  <p style={dynamicTextStyle}>{firstNameClient(item.name)} - {item.countRequest}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default OrderQueue;
