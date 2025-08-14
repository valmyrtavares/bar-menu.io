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
    const payGoData = {
      ...payGo,
      formaPagamentoId: 21,
      valorTotalVendido: 1,
    };
    try {
      setLoading(true);
      setErrorMessage('');

      const res = await fetch('http://localhost:3001/api/paygo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payGoData),
      });

      if (!res.ok) {
        throw new Error(`Erro na requisição: ${res.status}`);
      }
      const data = await res.json();
      console.log('✅ Resposta do backend:', data);

      console.log('resposta do backend:', data);
      if (data.status === 'SUCESSO') {
        console.log('Pagamento aprovado:', data);
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
