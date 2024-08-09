import React from "react";
import { useParams } from "react-router-dom";
import { getBtnData, getOneItemColleciton } from "../../api/Api.js";
import { app } from "../../config-firebase/firebase.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import "../../assets/styles/RequestListToBePrepared.css";

const RequestListToBePrepared = () => {
  const { id } = useParams();
  const db = getFirestore(app);

  const [requestsDoneList, setRequestDoneList] = React.useState([]);

  React.useEffect(() => {
    const fetchUserRequest = async () => {
      const data = await getOneItemColleciton("user", id);
      if (data) {
        data.done = true;
        addDoc(collection(db, "request"), data);
      }
      let requestList = await getBtnData("request");
      console.log("requestList    ", requestList);
      requestList = requestList.filter((item) => item.done == true);
      console.log("requestList    ", requestList);
      setRequestDoneList(requestList);
    };
    fetchUserRequest();
  }, [id]);

  const RequestDone = (item) => {
    item.done = false;
    console.log(item);
    setDoc(doc(db, "request", item.id), item)
      .then(() => {
        console.log("Document successfully updated !");
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
              <button
                className="btn btn-success"
                onClick={() => RequestDone(item)}
              >
                Pronto
              </button>
            </div>

            {item.request &&
              item.request.map((item) => (
                <div className="request-item">
                  <div>
                    <h5>{item.name}</h5>
                    <h5>Acompanhamento</h5>
                    <div className="sideDishes-list">
                      {item.sideDishes && item.sideDishes.length > 0 ? (
                        item.sideDishes.map((item) => <p>{item},</p>)
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
