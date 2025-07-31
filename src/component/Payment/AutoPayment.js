import React, { useState } from 'react';
import style from '../../assets/styles/AutoPayment.module.scss';

const paymentOptions = [
  { label: 'Débito', value: 'debito' },
  { label: 'Crédito', value: 'credito' },
  { label: 'Pix', value: 'pix' },
  { label: 'Dinheiro', value: 'dinheiro' },
];

const AutoPayment = ({ onChoose }) => {
  const [selected, setSelected] = useState('');

  const handleChange = (e) => {
    setSelected(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selected) {
      onChoose(selected);
    }
  };

  return (
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
      <button type="submit" className={style.chooseButton} disabled={!selected}>
        Escolher
      </button>
    </form>
  );
};

export default AutoPayment;
