import React from "react";
import { useParams } from "react-router-dom";
import { getOneItemColleciton } from "../../api/Api.js";
import "../../assets/styles/RequestListToBePrepared.css";

const RequestListToBePrepared = () => {
  const { id } = useParams();

  const [requestsDoneList, setRequestDoneList] = React.useState([]);

  React.useEffect(() => {
    const fetchUserRequest = async () => {
      const data = await getOneItemColleciton("user", id);
      if (data) {
        setRequestDoneList(data);
      }
      console.log(data);
    };
    fetchUserRequest();
  }, [id]);

  return (
    <div>
      {requestsDoneList && (
        <div className="container-requestListToBePrepared">
          <p>Nome: {requestsDoneList.name}</p>
          {requestsDoneList.request &&
            requestsDoneList.request.map((item) => (
              <div className="request-item">
                <img src={item.image} alt="123" />
                <h5>{item.name}</h5>
              </div>
            ))}
        </div>
      )}
      ;
    </div>
  );
};
export default RequestListToBePrepared;
