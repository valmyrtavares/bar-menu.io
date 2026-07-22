import React, { useState } from 'react';
import style from '../../assets/styles/AutoPayment.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import CloseBtn from '../closeBtn';
import CpfNfPopup from './CpfNfPopup';

const paymentOptions = [
  { label: 'Débito', value: 'DEBIT' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Pix', value: 'PIX' },
  { label: 'Dinheiro', value: 'CASH' },
  { label: 'VR - Débito ', value: 'VR_DEBIT' },
  { label: 'VR - Crédito ', value: 'VR_CREDIT' },
];

const AutoPayment = ({ onChoose, price, setIdPayer, setAutoPayment, isSubmitting }) => {
  const [selected, setSelected] = useState('');
  const [warningCashPaymentMessage, setWarningCashPaymentMessage] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [correlationId, setCorrelationId] = useState(null);
  const [message, setMessage] = useState('');
  const [showCpfPopup, setShowCpfPopup] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const cpfRef = React.useRef('');

  const getTerminalId = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '01' : '02';
  };

  const hasProcessedRef = React.useRef(false);

  React.useEffect(() => {
    if (!correlationId) return; // evita montar antes do submit

    hasProcessedRef.current = false;
    const backendUrl = process.env.REACT_APP_PAYER_API_URL || 'https://payer-4ptm.onrender.com';
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const handleApproved = (payload) => {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      setLoading(false);
      setWaitingForPayment(false);
      setIdPayer(payload.idPayer || null);

      const currentPaymentData = {
        idPayer: payload.idPayer,
        cardBrand: payload.flag,
        cardBrandCode: payload.flagCode,
        nsu: payload.thirdPartyId,
        nsuAuthorizer: payload.authorizerUsn,
        authorizationCode: payload.authorizerId,
        transactionDateTime: payload.transactionDateTime,
        acquirer: payload.acquirer,
        acquirerCNPJ: payload.acquirerCNPJ,
        value: payload.value,
        installments: payload.installments,
        terminalId: payload.terminalId,
        paymentMethod: payload.paymentMethod,
        paymentType: payload.paymentType,
        customerReceipt: payload.reducedCustomerPaymentReceipt,
        shopReceipt: payload.reducedShopPaymentReceipt,
      };

      setPaymentData(currentPaymentData);
      onChoose(selected, cpfRef.current, currentPaymentData);
    };

    // evento enviado pelo backend quando webhook chegar
    socket.on('paymentStatus', (payload) => {
      console.log('📦 PAYLOAD COMPLETO:', JSON.stringify(payload, null, 2));

      if (payload.correlationId !== correlationId) return;
      const statusTransaction = (payload.statusTransaction || payload.status || '').toUpperCase();
      console.log('statusTransaction recebido no socket:', statusTransaction);

      const approvedStatuses = ['APPROVED', 'SUCESSO', 'CONFIRMED', 'PAID', '00'];

      if (approvedStatuses.includes(statusTransaction)) {
        handleApproved(payload);
      } else if (statusTransaction === 'REJECTED' || statusTransaction === 'ERRO') {
        if (hasProcessedRef.current) return;
        setLoading(false);
        setWaitingForPayment(false);
        setMessage('Falha no pagamento. Tente novamente');
        onChoose('desabled');
      } else if (statusTransaction === 'ABORTED') {
        if (hasProcessedRef.current) return;
        setLoading(false);
        setWaitingForPayment(false);
        onChoose('ABORTED');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [correlationId]); // cuidado com dependências: inclua 'selected' se necessário

  function generateCorrelationId() {
    return uuidv4();
  }

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selected === 'CASH') {
      setMessage(
        'Pagamento em dinheiro deve ser realizado por enquanto com atendente com um atendente.',
      );

      setWarningCashPaymentMessage(true);
      setTimeout(() => {
        setWarningCashPaymentMessage(false);
        onChoose(selected); // fecha componente e segue fluxo
      }, 5000);
      return;
    }

    const autoNfceActive = JSON.parse(
      localStorage.getItem('enableAutoNfce') || 'false',
    );

    if (autoNfceActive) {
      setShowCpfPopup(true);
    } else {
      startPaymentFlow(selected, '');
    }
  };

  const startPaymentFlow = async (selectedP, cpf) => {
    console.log('Iniciando pagamento com:', selectedP, 'no valor de:', price);

    try {
      setLoading(true);
      setMessage('Efetue o pagamento na máquina de cartão ao lado');
      setErrorMessage('');

      // 1️⃣ Gera correlationId único
      const correlationId = generateCorrelationId();
      setCorrelationId(correlationId);

      // 2️⃣ Monta o objeto de requisição
      const payGo = {
        type: 'INPUT',
        origin: 'PAGAMENTO',
        data: {
          callbackUrl: `${process.env.REACT_APP_PAYER_API_URL || 'https://payer-4ptm.onrender.com'}/api/payer/webhook`,
          correlationId,
          flow: 'SYNC',
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: getTerminalId(),
          },
          message: {
            command: 'PAYMENT',
            value: Number(price).toFixed(2),
            paymentMethod: selectedP === 'PIX' ? 'PIX' : 'CARD',
            paymentType:
              selectedP === 'PIX'
                ? 'DEBIT'
                : selectedP === 'VR_DEBIT'
                  ? 'DEBIT'
                  : selectedP === 'VR_CREDIT'
                    ? 'CREDIT'
                    : selectedP,
            paymentMethodSubType: 'FULL_PAYMENT',
          },
        },
      };

      // 3️⃣ Envia ao backend
      const backendUrl = process.env.REACT_APP_PAYER_API_URL || 'https://payer-4ptm.onrender.com';
      await fetch(`${backendUrl}/api/payer/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payGo),
      });
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setErrorMessage('Falha no pagamento. Tente novamente.');
      setMessage('Erro ao iniciar pagamento. Tente novamente.');
      setLoading(false);
    }
  };
  const abortPayment = async () => {
    if (!correlationId) return;
    console.log('Pagamento abortado pelo usuário.');
    try {
      setMessage('Cancelando pagamento...');
      const backendUrl = process.env.REACT_APP_PAYER_API_URL || 'https://payer-4ptm.onrender.com';
      await fetch(`${backendUrl}/api/payer/abort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correlationId,
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: getTerminalId(),
          },
        }),
      });
    } catch (err) {
      console.error('Erro ao abortar o pagamento:', err);
      setMessage('Erro ao cancelar o pagamento. Tente novamente.');
    }
  };

  const onContinue = (cpf) => {
    setShowCpfPopup(false);
    cpfRef.current = cpf;
    startPaymentFlow(selected, cpf);
  };

  return (
    <div className={style.autoPaymentContainer}>
      <CloseBtn setClose={setAutoPayment} />
      {warningCashPaymentMessage && (
        <DefaultComumMessage msg="Pagamento em dinheiro ou pix deve ser efetuado direto no caixa ao lado" />
      )}
      <form className={style.autoPayment} onSubmit={handleSubmit}>
        <h1 className={style.title}>Escolha sua forma de pagamento</h1>
        <div className={style.options}>
          {paymentOptions.map((option) => (
            <label key={option.value} className={style.radioLabel}>
              <input
                type="radio"
                name="payment"
                value={option.value}
                checked={selected === option.value}
                onChange={handleChange}
                className={style.radioInput}
              />
              {option.label}
            </label>
          ))}
        </div>
        {loading && !isSubmitting && (
          <DefaultComumMessage msg="Efetue o pagamento na máquina de cartão ao lado" />
        )}
        {isSubmitting && (
          <DefaultComumMessage msg="Pagamento aprovado! Processando o seu pedido..." />
        )}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <button
          type="submit"
          className={style.chooseButton}
          disabled={!selected}
        >
          Escolher
        </button>
      </form>
      {showCpfPopup && (
        <CpfNfPopup setShowCpfPopup={setShowCpfPopup} onContinue={onContinue} />
      )}
    </div>
  );
};

export default AutoPayment;
