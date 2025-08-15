import React, { useState } from 'react';
import style from '../../assets/styles/AutoPayment.module.scss';
import DefaultComumMessage from '../Messages/DefaultComumMessage';

const paymentOptions = [
  { label: 'Débito', value: 'debit' },
  { label: 'Crédito', value: 'credite' },
  { label: 'Pix', value: 'pix' },
  { label: 'Dinheiro', value: 'dinheiro' },
];

const AutoPayment = ({ onChoose, price }) => {
  const [selected, setSelected] = useState('');
  const [warningCashPaymentMessage, setWarningCashPaymentMessage] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const paymentOption = {
    debit: 21,
    credite: 22,
    pix: 23,
  };
  let payGo = {
    formaPagamentoId: '',
    pedidoId: null,
    terminalId: '4517',
    observacao: 'Venda teste',
    aguardarTefIniciarTransacao: true,
    adquirente: 'DEMO',
    parcelamentoAdmin: true,
    quantidadeParcelas: 1,
    valorTotalVendido: '',
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

    // Valores chumbados para teste
    const payGoData = {
      ...payGo,
      formaPagamentoId: 21, // Crédito fixo
      valorTotalVendido: 1, // Valor fixo
    };

    try {
      setLoading(true);
      setErrorMessage('');

      // 1️⃣ Inicia a venda
      const initRes = await fetch('http://localhost:3001/api/paygo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payGoData),
      });

      if (!initRes.ok) throw new Error(`Erro na requisição: ${initRes.status}`);
      const initData = await initRes.json();
      console.log('Resposta da inicialização da venda:', initData);
      const vendaId = initData.intencaoVenda?.id;
      console.log('Venda iniciada, id:', vendaId);

      // 2️⃣ Polling para aguardar status final
      let finalStatus = null;
      const maxAttempts = 60; // 60 segundos
      let attempts = 0;

      while (!finalStatus && attempts < maxAttempts) {
        const statusRes = await fetch(
          `http://localhost:3001/api/paygo/${vendaId}`
        );
        if (!statusRes.ok)
          throw new Error(`Erro ao consultar status: ${statusRes.status}`);
        const statusData = await statusRes.json();

        const status = statusData.intencaoVenda?.intencaoVendaStatus?.nome;
        console.log('Status atual da venda:', status);
        console.log(
          '🔍 Status retornado do polling:',
          statusData.intencaoVenda.intencaoVendaStatus
        );

        // if (status === 'Aprovado' || status === 'SUCESSO') {
        //   finalStatus = 'SUCESSO';
        //   break;
        // }
        // if (status === 'Negado' || status === 'Cancelado') {
        //   finalStatus = 'FALHA';
        //   break;
        // }
        if (['Creditado', 'Aprovado', 'SUCESSO'].includes(status)) {
          finalStatus = 'SUCESSO';
          break;
        }

        // fallback por pagamentosExternos
        const ext =
          statusData.intencaoVenda?.pagamentosExternos?.[0]
            ?.pagamentoExternoStatus?.nome;
        if (['Finalizado', 'Aprovado'].includes(ext)) {
          finalStatus = 'SUCESSO';
          break;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
      }

      if (finalStatus === 'SUCESSO') {
        console.log('Pagamento aprovado');
        onChoose(selected);
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
