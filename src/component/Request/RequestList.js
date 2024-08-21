import React from "react";
import "../../assets/styles/RequestList.css";
import { fetchInDataChanges } from "../../api/Api.js";
import { getFirstFourLetters } from "../../Helpers/Helpers.js";
// import Input from "../Input.js";

const RequestList = () => {
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [form, setForm] = React.useState({
    category: "",
    search: "",
  });

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges("request", (data) => {
      setRequestDoneList(data);
      console.log(data);
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
                <span>Pedido</span> {getFirstFourLetters(item.id)}
              </p>
              <p>
                <span>Valor Total R$ </span> {item.finalPriceRequest},00
              </p>
              <p>
                {" "}
                <span>Data</span> {item.dateTime}
              </p>
              <p className="idUser">
                <span></span> {item.idUser}
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
