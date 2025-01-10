import React from 'react';
import { app } from '../config-firebase/firebase.js';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { fetchInDataChanges } from '../api/Api.js';
import '../assets/styles/orderQueue.css';
import { getFirstFourLetters, firstNameClient } from '../Helpers/Helpers.js';
import { requestSorter } from '../Helpers/Helpers.js';
import { Link } from 'react-router-dom';
import TransitionPopup from './Request/TrasitionPopup';
// import paris from "/img/paris.jpg";
import audioFile from '../audio/duelosteve.mp3';

const OrderQueue = () => {
  const [waitingLine, setWaitingLine] = React.useState([]);
  const [doneLine, setDoneLine] = React.useState([]);
  const [movingItem, setMovingItem] = React.useState(null);

  // Guardar os estados anteriores das listas
  const prevDoneLine = React.useRef(doneLine);
  const prevWaitingLine = React.useRef(waitingLine);

  const db = getFirestore(app);

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('request', (data) => {
      // Separando os dados em duas listas com base no campo `done`
      let waitingLineData = data.filter((item) => item.done);
      waitingLineData = requestSorter(waitingLineData);
      let doneLineData = data.filter(
        (item) => !item.done && !item.orderDelivered
      );
      doneLineData = requestSorter(doneLineData);

      setWaitingLine(waitingLineData);
      setDoneLine(doneLineData);
    });

    return () => unsubscribe();
  }, [db]);

  React.useEffect(() => {
    const doneLineChanged = doneLine.length !== prevDoneLine.current.length;
    const waitingLineChanged =
      waitingLine.length !== prevWaitingLine.current.length;

    if (doneLineChanged && waitingLineChanged) {
      // Identificando o item movido (do waitingLine para doneLine)

      const movedItem = prevWaitingLine.current.find(
        (item) => !waitingLine.some((waitingItem) => waitingItem.id === item.id)
      );

      if (movedItem) {
        setMovingItem(movedItem);
        console.log('Objeto movido:', movedItem);
        playSound();
      }

      // Atualizar os estados anteriores com os novos estados
      prevDoneLine.current = doneLine;
      prevWaitingLine.current = waitingLine;
    }

    if (doneLineChanged) {
      prevDoneLine.current = doneLine;
    }
    if (waitingLineChanged) {
      prevWaitingLine.current = waitingLine;
    }
  }, [doneLine.length, waitingLine.length]);

  const playSound = () => {
    const audio = new Audio(audioFile); // Caminho para o som
    audio.play();
  };

  return (
    <div className="order-queue-container">
      <div className="title-btn-container">
        <h1> Fila de pedidos</h1>
        <Link to="/">X</Link>
      </div>
      <p>Acompanhe abaixo o andamento e o status do seu pedido</p>
      {movingItem && <TransitionPopup movingItem={movingItem} />}

      <div className="list-columns">
        <div>
          <h3>Em preparo</h3>
          {waitingLine &&
            waitingLine.length > 0 &&
            waitingLine.map((item, index) => (
              <div className="border-red">
                <div key={index} className="horizont-line-queue ">
                  <p>Nome: {firstNameClient(item.name)}</p>
                  <p>
                    <span>Pedido</span>: {getFirstFourLetters(item.id, 4)} ;{' '}
                  </p>
                  <p>
                    <span>Ord</span>: {item.countRequest} ;{' '}
                  </p>
                </div>
              </div>
            ))}
        </div>
        <div>
          <h3>Pronto</h3>
          {doneLine &&
            console.log('PEDIDOS FEITOS   ', doneLine) &&
            doneLine.length > 0 &&
            doneLine.map((item, index) => (
              <div className="border-green">
                <div key={item.id} className="horizont-line-queue">
                  <p>{firstNameClient(item.name)}</p>
                  <p>
                    <span>Pedido</span>: {getFirstFourLetters(item.id, 4)} ;
                  </p>
                  <p>
                    <span>Ord</span>: {item.countRequest} ;{' '}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default OrderQueue;
