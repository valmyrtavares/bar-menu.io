import React from "react";
import { app } from "../config-firebase/firebase.js";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { fetchInDataChanges } from "../api/Api.js";
import "../assets/styles/orderQueue.css";

const OrderQueue = () => {
  const [waitingLine, setWaitingLine] = React.useState([]);
  const [doneLine, setDoneLine] = React.useState([]);
  const db = getFirestore(app);

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges("request", (data) => {
      // Separando os dados em duas listas com base no campo `done`
      const waitingLineData = data.filter((item) => item.done);
      const doneLineData = data.filter((item) => !item.done);

      setWaitingLine(waitingLineData);
      setDoneLine(doneLineData);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="order-queue-container">
      <h1> Fila de pedidos</h1>
      <p>Acompanhe abaixo o andamento e o status do seu pedido</p>
      <div className="list-columns">
        <div>
          {waitingLine &&
            waitingLine.map((item, index) => (
              <div key={item.id} className="horizont-line-queue border-red">
                <span>{index}</span>
                <p>{item.name}</p>
                <p> Em preparo</p>
              </div>
            ))}
        </div>
        <div>
          {doneLine &&
            doneLine.map((item, index) => (
              <div key={item.id} className="horizont-line-queue border-green">
                <span>{index} - </span>
                <p>{item.name}</p>
                <p>Entregue</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default OrderQueue;
