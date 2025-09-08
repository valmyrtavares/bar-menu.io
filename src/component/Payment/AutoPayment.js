import React, { useState } from 'react';
import style from '../../assets/styles/AutoPayment.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';
import { v4 as uuidv4 } from 'uuid';

const paymentOptions = [
  { label: 'Débito', value: 'debit' },
  { label: 'Crédito', value: 'credite' },
  { label: 'Pix', value: 'pix' },
  { label: 'Dinheiro', value: 'dinheiro' },
];

const AutoPayment = ({ onChoose, price, setIdPayer }) => {
  const [selected, setSelected] = useState('');
  const [warningCashPaymentMessage, setWarningCashPaymentMessage] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function generateCorrelationId() {
    return uuidv4();
  }

  const paymentOption = {
    debit: 21,
    credite: 22,
    pix: 23,
  };

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selected === 'dinheiro') {
      setWarningCashPaymentMessage(true);
      setTimeout(() => {
        setWarningCashPaymentMessage(false);
        onChoose(selected);
      }, 5000);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // 🔑 1) Gerar correlationId único
      const correlationId = generateCorrelationId();

      // 🔑 2) Montar objeto com esse correlationId
      const payGo = {
        type: 'INPUT',
        origin: 'PAGAMENTO',
        data: {
          callbackUrl:
            'https://webhook.site/82b67759-33fc-466b-9f43-1a47eb261d6f',
          correlationId,
          flow: 'SYNC',
          automationName: 'GERACAOZ',
          receiver: {
            companyId: '003738',
            storeId: '0001',
            terminalId: '01',
          },
          message: {
            command: 'PAYMENT',
            value: 6.0,
            paymentMethod: 'CARD',
            paymentType: 'DEBIT',
            paymentMethodSubType: 'FULL_PAYMENT',
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
      console.log('Objeto inteiro    ', initData);
      const correlationIdFromApi =
        initData.SendMessageResponse.ResponseMetadata.RequestId; // 👈 pega do retorno
      console.log(
        '🚀 Inicia pagamento, correlationIdFromApi:',
        correlationIdFromApi
      );
      console.log('CORRELATION ID ENVIADO  ', correlationId);

      // 4️⃣ Polling para aguardar status (até webhook estar implementado)
      let finalStatus = null;
      const maxAttempts = 60;
      let attempts = 0;

      while (!finalStatus && attempts < maxAttempts) {
        const statusRes = await fetch(
          `http://localhost:3001/api/payer/status/${correlationId}/GERACAOZ`
        );

        if (!statusRes.ok)
          throw new Error(`Erro ao consultar status: ${statusRes.status}`);

        const statusData = await statusRes.json();
        console.log('🔍 Retorno do Payer:', statusData);

        // 👇 pega statusTransaction do local correto
        const statusTransaction =
          statusData?.receivedOutput?.data?.message?.statusTransaction;
        let idPayer = statusData?.receivedOutput?.data?.message?.idPayer;

        if (['APPROVED', 'SUCESSO'].includes(statusTransaction)) {
          finalStatus = 'SUCESSO';

          setIdPayer(idPayer);
          // Seta o idPayer no estado do componente pai
          break;
        }

        if (['REJECTED', 'CANCELED'].includes(statusTransaction)) {
          finalStatus = 'ERRO';
          console.log('Pagamento Rejeitado ou Cancelado');
          break;
        }

        if (attempts > 10) {
          console.log('Tentativas excedidas, cancelando pagamento');
          finalStatus = 'PENDING';
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 5️⃣ Só fecha a tela se o pagamento foi aprovado
      if (finalStatus === 'SUCESSO') {
        console.log('✅ Pagamento aprovado');
        onChoose(selected);
      } else if (finalStatus === 'ERRO') {
        console.log('Estou enviando um desabled no Choose');
        onChoose('desabled');
      } else if (finalStatus === 'PENDING') {
        console.log('Estou enviando um desabled no Choose');
        onChoose('exceded');
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
    <div className={style.autoPaymentContainer}>
      {warningCashPaymentMessage && (
        <DefaultComumMessage msg="Pagamento em dinheiro deve ser efetuado direto no caixa ao lado" />
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
        {loading && <p>Aguardando confirmação do pagamento...</p>}
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
