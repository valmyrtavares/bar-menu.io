import React from 'react';

import '../../assets/styles/RequestList.scss';
import {
  // fetchInDataChanges,
  // checkAndTrimRequests,
  getPaginatedData,
  updateCollection,
} from '../../api/Api.js';
import { getFirstFourLetters } from '../../Helpers/Helpers.js';
import { requestSorter } from '../../Helpers/Helpers.js';
import Title from '../title.js';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
// import Input from "../Input.js";

const RequestList = () => {
  const [requestsDoneList, setRequestDoneList] = React.useState([]);
  const [alreadyTrimmed, setAlreadyTrimmed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [cancelPaymentMessage, setCancelPaymentMessage] = React.useState(false);
  const [disabledCancelButton, setDisabledCancelButton] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [restoringId, setRestoringId] = React.useState(null);
  const [firstDoc, setFirstDoc] = React.useState(null);
  const [lastDoc, setLastDoc] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const PAGE_SIZE = 40;
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    category: '',
    search: '',
  });

  function generateCorrelationId() {
    return uuidv4();
  }

  React.useEffect(() => {
    fetchRequest(null, 'init');
  }, []);

  const fetchRequest = async (cursorDoc = null, direction = 'init') => {
    try {
      setLoading(true);
      const response = await getPaginatedData('requests', 'countRequest', 'desc', PAGE_SIZE, cursorDoc, direction);

      const dataSorted = requestSorter(response.data, 'direction');
      setRequestDoneList(dataSorted);
      setFirstDoc(response.firstVisible);
      setLastDoc(response.lastVisible);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleRestoreOrder = async (requestId) => {
    try {
      setIsRestoring(true);
      setRestoringId(requestId);
      await updateCollection('requests', requestId, { orderDelivered: false });
      // Redirect to PDV screen
      navigate('/admin/requestlist');
    } catch (error) {
      console.error('Error restoring order:', error);
      setIsRestoring(false);
      setRestoringId(null);
    }
  };

  return (
    <div className="container-request-list">
      {cancelPaymentMessage && (
        <DefaultComumMessage msg="Pagamento Cancelado com sucesso" />
      )}
      <Link to="/admin/admin">
        <Title mainTitle="Lista de Pedidos" />
      </Link>
      {requestsDoneList &&
        requestsDoneList.map((item) => (
          <div key={item.id} className="request">
            <div className="customer">
              <button
                className="btn-restore-order"
                disabled={(isRestoring && restoringId === item.id) || !item.orderDelivered}
                onClick={() => handleRestoreOrder(item.id)}
              >
                {isRestoring && restoringId === item.id ? 'Trazendo pedido na tela...' : 'Recuperar pedido'}
              </button>
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
                <span>Itens R$ </span>{' '}
                {(
                  Number(item.finalPriceRequest || 0) -
                  Number(item.serviceChargeValue || 0)
                ).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {item.serviceChargeEnabled && (
                <p style={{ color: 'var(--btn-color)', fontWeight: 'bold' }}>
                  <span>Taxa de Serviço (10%) R$ </span>{' '}
                  {(Number(item.serviceChargeValue) || 0).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Valor Total R$ </span>{' '}
                {(Number(item.finalPriceRequest) || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p>
                <span>Data</span> {item.dateTime}
              </p>
              
              {item.customerFeedback && (
                <div style={{ marginTop: '10px', padding: '8px', borderLeft: '3px solid var(--btn-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                   {item.customerFeedback.service && (
                    <p style={{ fontSize: '0.85rem' }}><span>Avaliação Serviço:</span> {item.customerFeedback.service}</p>
                   )}
                   {item.customerFeedback.product && (
                    <p style={{ fontSize: '0.85rem' }}><span>Avaliação Produto:</span> {item.customerFeedback.product}</p>
                   )}
                   {item.customerFeedback.comment && (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}><span>Comentário:</span> "{item.customerFeedback.comment}"</p>
                   )}
                </div>
              )}
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
                      {dishe.tempo_levado && (
                        <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
                          {dishe.tempo_levado}
                        </p>
                      )}
                      <p>
                        R${' '}
                        {(Number(dishe.finalPrice) || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
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

      <div className="pagination-controls">
        <button
          className="btn-pagination"
          disabled={pageNumber === 1 || loading}
          onClick={() => {
            setPageNumber(prev => prev - 1);
            fetchRequest(firstDoc, 'prev');
          }}
        >
          Anteriores
        </button>
        <span className="page-info">Página {pageNumber}</span>
        <button
          className="btn-pagination"
          disabled={!lastDoc || requestsDoneList.length < PAGE_SIZE || loading}
          onClick={() => {
            setPageNumber(prev => prev + 1);
            fetchRequest(lastDoc, 'next');
          }}
        >
          Próximos {PAGE_SIZE}
        </button>
      </div>
    </div>
  );
};
export default RequestList;
