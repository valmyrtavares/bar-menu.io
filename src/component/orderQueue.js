import React from "react";
import { app } from "../config-firebase/firebase.js";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import "../assets/styles/orderQueue.css";

const OrderQueue = () => {
  const [waitingLine, setWaitingLine] = React.useState([]);
  const [doneLine, setDoneLine] = React.useState([]);
  const db = getFirestore(app);

  React.useEffect(() => {
    const requestCollection = collection(db, "request");

    const unsubscribe = onSnapshot(requestCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const waitingLine = data.filter((item) => item.done);

      setWaitingLine(waitingLine);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [db]);

  React.useState(() => {
    const requestCollection = collection(db, "request");
    const unsubscribe = onSnapshot(requestCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const doneLine = data.filter((item) => !item.done);

      setDoneLine(doneLine.slice(-4)); // Limita a lista doneLine aos últimos 4 itens
    });

    return () => unsubscribe();
  }, [waitingLine]);

  return (
    <div className="order-queue-container">
      <h1> Fila de pedidos</h1>
      <div className="list-columns">
        <div>
          {waitingLine &&
            waitingLine.map((item, index) => (
              <div className="horizont-line-queue border-red">
                <span>{index}</span>
                <p>{item.name}</p>
                <p> Em preparo</p>
              </div>
            ))}
        </div>
        <div>
          {doneLine &&
            doneLine.map((item, index) => (
              <div className="horizont-line-queue border-green">
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
