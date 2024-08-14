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
              <p>
                <span>Nome</span> {item.name}
              </p>
              <p>
                <span>Valor</span> {item.finalPriceRequest}
              </p>
              <p>
                {" "}
                <span>Data</span> {item.dateTime}
              </p>
            </div>
            <div>
              {item.request &&
                item.request.map((dishe) => (
                  <div className="dishes">
                    <div>
                      <p>{dishe.name}</p>
                      <p>{dishe.finalPrice}</p>
                    </div>
                    <div className="sidedishes">
                      {dishe.sideDishes &&
                        dishe.sideDishes.map((sidedishe, index) => (
                          <p>{sidedishe}</p>
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
