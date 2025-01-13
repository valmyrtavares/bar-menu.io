import React from 'react';
import '../../assets/styles/RequestList.css';
import { fetchInDataChanges } from '../../api/Api.js';
import { getFirstFourLetters } from '../../Helpers/Helpers.js';
import { requestSorter } from '../../Helpers/Helpers.js';
import Title from '../title.js';
import { Link } from 'react-router-dom';
// import Input from "../Input.js";

const RequestList = () => {
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [form, setForm] = React.useState({
    category: '',
    search: '',
  });

  React.useEffect(() => {
    const unsubscribe = fetchInDataChanges('request', (data) => {
      const dataSorted = requestSorter(data, 'direction');

      setRequestDoneList(dataSorted);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="container-request-list">
      <Link to="/admin/admin">
        <Title mainTitle="Lista de Pedidos" />
      </Link>
      {requestsDoneList &&
        requestsDoneList.map((item) => (
          <div key={item.id} className="request">
            <div className="customer">
              <h3>Cliente</h3>
              <p className="customer-name">
                <span>Nome</span> {item.name}
              </p>
              <p className="customer-request">
                <span>Pedido</span> {getFirstFourLetters(item.id, 5)}/
                <strong>{item.countRequest}</strong>
              </p>
              <p>
                <span>Tipo de pagamento</span> {item.paymentMethod}
              </p>
              <p>
                <span>Valor Total R$ </span> {item.finalPriceRequest},00
              </p>
              <p>
                {' '}
                <span>Data</span> {item.dateTime}
              </p>
              <p className="idUser">
                <span></span> {item.idUser}
              </p>
            </div>
            <div>
              {item.request &&
                item.request.map((dishe, index) => (
                  <div className="dishes" key={index}>
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
                            <p>{sidedishe.name}</p>
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
