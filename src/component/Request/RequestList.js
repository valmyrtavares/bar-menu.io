import React from "react";
import "../../assets/styles/RequestList.css";
import { fetchInDataChanges } from "../../api/Api.js";

const RequestList = () => {
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges("request", (data) => {
      setRequestDoneList(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="container-request-list">
      <h1>Lista de Pedidos</h1>

      {requestsDoneList &&
        requestsDoneList.map((item) => (
          <div key={item.id} className="request">
            <div className="customer">
              <h3>Cliente</h3>
              <p className="customer-name">
                <span>Nome</span> {item.name}
              </p>
              <p>
                <span>Valor Total R$ </span> {item.finalPriceRequest},00
              </p>
              <p>
                {" "}
                <span>Data</span> {item.dateTime}
              </p>
            </div>
            <div>
              {item.request &&
                item.request.map((dishe, index) => (
                  <div className="dishes">
                    <div>
                      <h3>item {index + 1}</h3>
                      <p>{dishe.name}</p>
                      <p>R$ {dishe.finalPrice},00</p>
                    </div>
                    <div className="sidedishes">
                      <p>
                        <h3>Adicionais</h3>
                      </p>
                      {dishe.sideDishes &&
                        dishe.sideDishes.map((sidedishe, index) => (
                          <div>
                            <p>{sidedishe}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};
export default RequestList;
