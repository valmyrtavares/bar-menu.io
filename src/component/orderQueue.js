import React from "react";
import { getBtnData } from "../api/Api.js";
import "../assets/styles/orderQueue.css";

const OrderQueue = () => {
  const [waitingLine, setWaitingLine] = React.useState([]);
  const [doneLine, setDoneLine] = React.useState([]);

  React.useEffect(() => {
    const fetchRequest = async () => {
      const data = await getBtnData("request");
      console.log("request data   ", data);
      const waitingLine = data.filter((item) => item.done);
      const doneLine = data.filter((item) => !item.done);
      if (waitingLine) {
        setWaitingLine(waitingLine);
      }
      if (doneLine) {
        if (doneLine.length > 4) {
          doneLine.splice(0, 1);
        }
        setDoneLine(doneLine);
      }
    };
    fetchRequest();
  }, []);

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
