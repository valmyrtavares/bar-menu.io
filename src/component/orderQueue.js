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

  React.useEffect(() => {
    console.log("Antes da depuração  ", doneLine);
    let updatedDoneLine = [];

    if (doneLine) {
      console.log("Teem doneLIne");
      if (doneLine && doneLine.length > 4) {
        updatedDoneLine = [...doneLine]; // Crie uma cópia do array
        updatedDoneLine.splice(3, 1); // Remove o item com índice 3
        console.log(
          "Entrou no segundo if e teem o updateDoneeLine     ",
          updatedDoneLine
        );
      }
      setDoneLine(updatedDoneLine);
    }
    console.log("Depois da updatedDoneLine  ", updatedDoneLine);
    console.log("Depois da depuração  ", doneLine);
  }, [waitingLine]);

  function getFirstFourLetters(inputString) {
    // Retorna os 4 primeiros caracteres da string
    return inputString.slice(0, 4);
  }

  return (
    <div className="order-queue-container">
      <h1> Fila de pedidos</h1>
      <p>Acompanhe abaixo o andamento e o status do seu pedido</p>
      <div className="list-columns">
        <div>
          <h3>Em preparo</h3>
          {waitingLine &&
            waitingLine.map((item, index) => (
              <div className="border-red">
                <div key={item.id} className="horizont-line-queue ">
                  <p>Nome: {item.name}</p>
                  <p>
                    <span>Pedido</span>: {getFirstFourLetters(item.id)} ;{" "}
                  </p>
                </div>
                <p className="date">{item.dateTime}</p>
              </div>
            ))}
        </div>
        <div>
          <h3>Pronto</h3>
          {doneLine &&
            doneLine.map((item, index) => (
              <div className="border-green">
                <div key={item.id} className="horizont-line-queue">
                  <p>{item.name}</p>
                  <p>
                    <span>Pedido</span>: {getFirstFourLetters(item.id)} ;
                  </p>
                </div>
                <p className="date">{item.dateTime}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default OrderQueue;
