import React from 'react';

import '../../assets/styles/RequestList.css';
import {
  // fetchInDataChanges,
  // checkAndTrimRequests,
  getBtnData,
} from '../../api/Api.js';
import { getFirstFourLetters } from '../../Helpers/Helpers.js';
import { requestSorter } from '../../Helpers/Helpers.js';
import Title from '../title.js';
import { Link } from 'react-router-dom';
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
  const [form, setForm] = React.useState({
    category: '',
    search: '',
  });

  function generateCorrelationId() {
    return uuidv4();
  }

  React.useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    const data = await getBtnData('requests');

    const dataSorted = requestSorter(data, 'direction');
    console.log(
      'Ordenados:',
      dataSorted.map((item) => item.countRequest),
    );
    setRequestDoneList(dataSorted);
  };

  const cancelPayment = async (idPayer) => {
    try {
      setLoading(true);
      setErrorMessage('');

      // 🔑 1) Gerar correlationId único
      // const correlationId = generateCorrelationId();

      // 🔑 2) Montar objeto com esse correlationId
      const payGo = {
        type: 'INPUT',
        origin: 'PAGAMENTO',
        data: {
          callbackUrl:
            'https://webhook.site/82b67759-33fc-466b-9f43-1a47eb261d6f',
          correlationId: idPayer,
          flow: 'SYNC',
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: '01',
          },
          message: {
            command: 'CANCELLMENT',
            idPayer,
          },
        },
      };

      // 3️⃣ Enviar para sua API que chama o Payer
      const initRes = await fetch('http://localhost:3001/api/payer/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payGo),
      });

      if (!initRes.ok) throw new Error(`Erro na requisição: ${initRes.status}`);
      const initData = await initRes.json();

      // const correlationIdFromApi =
      //   initData.SendMessageResponse.ResponseMetadata.RequestId;
      // console.log(
      //   '🚀 Inicia pagamento, correlationIdFromApi:',
      //   correlationIdFromApi
      // );
      // console.log('CORRELATION ID ENVIADO  ', correlationId);

      // 4️⃣ Polling para aguardar status (até webhook estar implementado)
      let finalStatus = null;
      const maxAttempts = 60;
      let attempts = 0;

      while (!finalStatus && attempts < maxAttempts) {
        const statusRes = await fetch(
          `http://localhost:3001/api/payer/status/${idPayer}/GERACAOZ`,
        );

        if (!statusRes.ok)
          throw new Error(`Erro ao consultar status: ${statusRes.status}`);

        const statusData = await statusRes.json();
        console.log('🔍 Retorno do Payer CANCELAMENTO:', statusData);

        // 👇 pega statusTransaction do local correto
        const statusTransaction =
          statusData?.receivedOutput?.data?.message?.statusTransaction;
        console.log('STATUS TRANSACTION   ', statusTransaction);
        if (['APPROVED', 'SUCESSO'].includes(statusTransaction)) {
          finalStatus = 'SUCESSO';

          // Seta o idPayer no estado do componente pai
          break;
        }

        if (['REJECTED', 'CANCELED'].includes(statusData.statusTransaction)) {
          finalStatus = 'ERRO';
          break;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 5️⃣ Só fecha a tela se o pagamento foi aprovado
      if (finalStatus === 'SUCESSO') {
        console.log('✅ Pagamento Cancelado com sucesso');
        setCancelPaymentMessage(true);
        setDisabledCancelButton(true);
        setTimeout(() => {
          setCancelPaymentMessage(false);
        }, 7000);
      } else {
        throw new Error('Pagamento não aprovado');
      }
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setErrorMessage('Falha no pagamento. Tente novamente.');
    } finally {
      setLoading(false);
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
