import React from 'react';
import '../../assets/styles/eachCustomer.css';
import '../../assets/styles/RequestList.css';
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from 'firebase/firestore';
import { app } from '../../config-firebase/firebase.js';
import { getFirstFourLetters } from '../../Helpers/Helpers.js';

const EachCustomer = ({ oneClient, setShowPopup }) => {
  const [messageType, setMessageType] = React.useState(false);
  const [AllRequestsOfCustomer, setAllRequestsOfCustomer] =
    React.useState(null);

  // FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    if (oneClient) {
      if (oneClient.name === 'anonimo') {
        setMessageType(false);
      } else {
        console.log('CLIENTE  ', oneClient);
        setMessageType(true);
        getRequestsByUserId(oneClient.id)
          .then((requests) => {
            console.log('Pedidos do usuário:', requests);
            setAllRequestsOfCustomer(requests);
          })
          .catch((error) => {
            console.error('Erro:', error);
          });
      }
    }
  }, [oneClient]);

  const copyToClipboard = (label, text) => {
    let fullText = `${text}`;
    if (label === 'Phone:') {
      fullText = text.replace(/\D/g, '');
    }

    navigator.clipboard.writeText(fullText);
  };

  // Função para buscar pedidos de um usuário específico
  async function getRequestsByUserId(userId) {
    try {
      // Crie uma referência para a coleção "request"
      const requestCollectionRef = collection(db, 'request');

      // Crie a consulta para buscar documentos com o idUser especificado
      const q = query(requestCollectionRef, where('idUser', '==', userId));

      // Obtenha os documentos que satisfazem a consulta
      const querySnapshot = await getDocs(q);

      // Transforme os documentos em um array de objetos
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return requests; // Retorne os pedidos como um array de objetos
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  }

  return (
    <div className="container-eachCustomer">
      <div className="btn-container">
        <button onClick={() => setShowPopup(false)}>X</button>
      </div>
      {messageType ? (
        <div>
          <h3>Cliente Selecionado</h3>
          <p onClick={() => copyToClipboard('Nome: ', oneClient.name)}>
            Nome: <span>{oneClient.name}</span>
          </p>
          <p
            onClick={() => copyToClipboard('Aniversário: ', oneClient.birthday)}
          >
            Aniversário: <span>{oneClient.birthday}</span>
          </p>
          <p onClick={() => copyToClipboard('CPF: ', oneClient.cpf)}>
            CPF: <span>{oneClient.cpf}</span>
          </p>
          <p onClick={() => copyToClipboard('EMAIL: ', oneClient.email)}>
            EMAIL: <span>{oneClient.email}</span>
          </p>
          <p onClick={() => copyToClipboard('Phone:', oneClient.phone)}>
            Phone: <span>{oneClient.phone}</span>
          </p>
          {AllRequestsOfCustomer &&
            AllRequestsOfCustomer.map((item) => (
              <div key={item.id} className="Allrequests">
                <div className="customer">
                  <p>
                    <span>Valor Total R$ </span> {item.finalPriceRequest},00
                  </p>
                  <p>
                    {' '}
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
      ) : (
        <h3 className="advert-message">Não temos os dados desse cliente</h3>
      )}
    </div>
  );
};
export default EachCustomer;
