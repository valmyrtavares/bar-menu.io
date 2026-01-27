import React, { useState } from 'react';
import style from '../../assets/styles/AutoPayment.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import CloseBtn from '../closeBtn';

const paymentOptions = [
  { label: 'Débito', value: 'DEBIT' },
  { label: 'Crédito', value: 'CREDIT' },
  { label: 'Pix', value: 'PIX' },
  { label: 'Dinheiro', value: 'CASH' },
];

const AutoPayment = ({ onChoose, price, setIdPayer, setAutoPayment }) => {
  const [selected, setSelected] = useState('');
  const [warningCashPaymentMessage, setWarningCashPaymentMessage] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [correlationId, setCorrelationId] = useState(null);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (!correlationId) return; // evita montar antes do submit

    const socket = io('https://payer-4ptm.onrender.com'); // url do seu backend

    socket.on('connect', () => {
      console.log('Socket conectado', socket.id);
    });

    // evento enviado pelo backend quando webhook chegar
    // payload: { correlationId, status: 'SUCESSO'|'ERRO'|'PENDING', idPayer }
    socket.on('paymentStatus', (payload) => {
      console.log('Resultado do pagamento via socket:', payload);

      if (payload.correlationId !== correlationId) return;
      const { statusTransaction } = payload;
      console.log('statusTransaction recebido no socket:', statusTransaction);
      if (statusTransaction === 'APPROVED') {
        setWaitingForPayment(false);
        setIdPayer(payload.idPayer || null);
        onChoose(selected); // chama o onChoose como no fluxo aprovado
      } else if (statusTransaction === 'REJECTED') {
        setWaitingForPayment(false);
        setMessage('Falha no pagamento. Tente novamente');
        onChoose('desabled'); // manter seu comportamento anterior
      } else if (statusTransaction === 'ABORTED') {
        console.log('Objeto completo  ', payload);
        setWaitingForPayment(false);
        onChoose('ABORTED'); // seu caso antigo tratava como pending -> selecionado
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

    console.log('Iniciando pagamento com:', selected, 'no valor de:', price);

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
          callbackUrl: 'https://payer-4ptm.onrender.com/api/payer/webhook', // 👈 agora aponta para o seu backend
          correlationId,
          flow: 'SYNC',
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: '02',
          },
          message: {
            command: 'PAYMENT',
            value: price,
            paymentMethod: selected === 'PIX' ? 'PIX' : 'CARD',
            paymentType: selected === 'PIX' ? 'DEBIT' : selected,
            paymentMethodSubType: 'FULL_PAYMENT',
          },
        },
      };

      // 3️⃣ Envia ao backend hospedado no Render
      await fetch('https://payer-4ptm.onrender.com/api/payer/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payGo),
      });
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setErrorMessage('Falha no pagamento. Tente novamente.');
      setMessage('Erro ao iniciar pagamento. Tente novamente.');
    }
  };
  const abortPayment = async () => {
    if (!correlationId) return;
    console.log('Pagamento abortado pelo usuário.');
    try {
      setMessage('Cancelando pagamento...');
      await fetch('https://payer-4ptm.onrender.com/api/payer/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correlationId,
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: '02',
          },
        }),
      });
    } catch (err) {
      console.error('Erro ao abortar o pagamento:', err);
      setMessage('Erro ao cancelar o pagamento. Tente novamente.');
    }
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
        {loading && (
          <DefaultComumMessage
            msg="Efetue o pagamento na máquina de cartão ao lado"
            onClose={abortPayment}
          />
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
    </div>
  );
};

export default AutoPayment;
