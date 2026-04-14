import React from 'react';
import '../../assets/styles/eachCustomer.css';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config-firebase/firebase.js';

const EachCustomer = ({ oneClient, setShowPopup }) => {
  const [messageType, setMessageType] = React.useState(false);
  const [AllRequestsOfCustomer, setAllRequestsOfCustomer] =
    React.useState(null);

  React.useEffect(() => {
    if (oneClient) {
      if (oneClient.name === 'anonimo') {
        setMessageType(false);
      } else {
        setMessageType(true);
        getRequestsByUserId(oneClient.id)
          .then((requests) => {
            setAllRequestsOfCustomer(requests);
          })
          .catch((error) => {
            console.error('Erro:', error);
          });
      }
    }
  }, [oneClient]);

  const copyToClipboard = (text) => {
    if (!text) return;
    const cleanText = text.toString().replace(/\D/g, '') === text.toString() ? text.replace(/\D/g, '') : text;
    navigator.clipboard.writeText(cleanText);
  };

  async function getRequestsByUserId(userId) {
    try {
      const requestCollectionRef = collection(db, 'requests');
      const q = query(requestCollectionRef, where('idUser', '==', userId));
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return requests;
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  }

  const InfoItem = ({ label, value }) => (
    <div className="ec-info-item" onClick={() => copyToClipboard(value)}>
      <span className="ec-info-label">{label}</span>
      <span className="ec-info-value">{value || '---'}</span>
    </div>
  );

  return (
    <div className="container-eachCustomer">
      <div className="ec-header">
        <h3>Detalhes do Cliente</h3>
        <button className="ec-close-btn" onClick={() => setShowPopup(false)}>
          &times;
        </button>
      </div>

      <div className="ec-content">
        {messageType ? (
          <>
            <section className="ec-client-info">
              <div className="ec-info-grid">
                <InfoItem label="Nome" value={oneClient.name} />
                <InfoItem label="Telefone" value={oneClient.phone} />
                <InfoItem label="E-mail" value={oneClient.email} />
                <InfoItem label="CPF" value={oneClient.cpf} />
                <InfoItem label="Aniversário" value={oneClient.birthday} />
              </div>
            </section>

            <section className="ec-requests-section">
              <h4>Histórico de Pedidos</h4>
              {AllRequestsOfCustomer && AllRequestsOfCustomer.length > 0 ? (
                AllRequestsOfCustomer.map((item) => (
                  <div key={item.id} className="ec-request-card">
                    <div className="request-header">
                      <span className="request-date">{item.dateTime}</span>
                      <span className="request-price">
                        R${' '}
                        {(item.finalPriceRequest || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="item-list">
                      {item.request &&
                        item.request.map((dishe, index) => (
                          <div key={index} className="request-item">
                            <div className="item-main-info">
                              <span className="item-name">
                                {index + 1}. {dishe.name}
                              </span>
                              <span className="item-price">
                                R${' '}
                                {(dishe.finalPrice || 0).toLocaleString(
                                  'pt-BR',
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </span>
                            </div>
                            {dishe.sideDishes && dishe.sideDishes.length > 0 && (
                              <div className="side-dishes-box">
                                <div className="side-dishes-title">
                                  Adicionais
                                </div>
                                {dishe.sideDishes.map((side, sIndex) => (
                                  <span key={sIndex} className="side-dish-tag">
                                    {side.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                  Nenhum pedido encontrado.
                </p>
              )}
            </section>
          </>
        ) : (
          <div className="advert-message">
            <h3>Ops!</h3>
            <p>Não temos os dados desse cliente no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EachCustomer;
