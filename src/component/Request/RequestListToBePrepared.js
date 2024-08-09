import React from "react";
import { useParams } from "react-router-dom";
import { getOneItemColleciton } from "../../api/Api.js";
import "../../assets/styles/RequestListToBePrepared.css";

const RequestListToBePrepared = () => {
  const { id } = useParams();

  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [requestsObj, setRequestObj] = React.useState([]);

  React.useEffect(() => {
    const fetchUserRequest = async () => {
      const data = await getOneItemColleciton("user", id);
      if (data) {
        const newArray = [];
        newArray.push(data);
        localStorage.setItem("request", JSON.stringify(newArray));
        setRequestObj(data);
      }
      console.log("data to kitchen", data);
    };
    fetchUserRequest();
  }, [id]);

  React.useEffect(() => {
    if (localStorage.hasOwnProperty("request")) {
      const data1 = JSON.parse(localStorage.getItem("request"));
      console.log("newArray   ", data1);
      setRequestDoneList(data1);
    }
  }, [requestsObj]);

  return (
    <div>
      {requestsDoneList &&
        requestsDoneList.map((item) => (
          <div className="container-requestListToBePrepared">
            <div className="user-container">
              <div>
                <p>
                  <span>Nome</span> {item.name}
                </p>
                <p>
                  <span>Pedido</span>: 1234
                </p>
                <p>
                  <span>Mesa</span>: 12
                </p>
                <p>
                  <span>Data</span>:12-12-2024
                </p>
              </div>
              <button className="btn btn-success">Pronto</button>
            </div>

            {item.request &&
              item.request.map((item) => (
                <div className="request-item">
                  <div>
                    <h5>{item.name}</h5>
                    <h5>Acompanhamento</h5>
                    <div className="sideDishes-list">
                      {item.sideDishes && item.sideDishes.length > 0 ? (
                        item.sideDishes.map((item) => <p>{item}</p>)
                      ) : (
                        <p>Não tem acompanhamento</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <img src={item.image} alt="123" />
                    <button className="btn btn-warning">Receita</button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      ;
    </div>
  );
};
export default RequestListToBePrepared;
