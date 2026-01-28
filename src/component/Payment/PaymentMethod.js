import React from 'react';
import '../../assets/styles/PaymentMethod.css';
import { cardClasses } from '@mui/material';

const PaymentMethod = ({ onPaymentMethodChange, item }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState('cash');

  React.useEffect(() => {
    const { paymentMethod } = item;
    if (paymentMethod === 'CREDIT') {
      setSelectedPaymentMethod('credite');
    } else if (paymentMethod === 'DEBIT') {
      setSelectedPaymentMethod('debit');
    } else if (paymentMethod === 'PIX') {
      setSelectedPaymentMethod('pix');
    } else if (paymentMethod === 'VR') {
      setSelectedPaymentMethod('vr');
    }
  }, [item]);

  const handleChange = (e) => {
    const { value } = e.target;
    setSelectedPaymentMethod(value);
    onPaymentMethodChange(value, item);
  };

  return (
    <div className="paymentMethod-container">
      <div>
        <input
          className="form-check-input"
          id="cash"
          value="cash"
          name="options"
          type="radio"
          checked={selectedPaymentMethod === 'cash'} // Define se está selecionado
          onChange={handleChange}
        />
        <label className="form-check-label">Dinheiro</label>
      </div>
      <div>
        <input
          className="form-check-input"
          id="credite"
          value="credite"
          name="options"
          type="radio"
          checked={selectedPaymentMethod === 'credite'} // Define se está selecionado
          onChange={handleChange}
        />
        <label className="form-check-label">Crédito</label>
      </div>
      <div>
        <input
          className="form-check-input"
          id="debit"
          value="debit"
          name="options"
          type="radio"
          checked={selectedPaymentMethod === 'debit'}
          onChange={handleChange}
        />
        <label className="form-check-label">Débito</label>
      </div>
      <div>
        <input
          className="form-check-input"
          id="pix"
          value="pix"
          name="options"
          type="radio"
          checked={selectedPaymentMethod === 'pix'}
          onChange={handleChange}
        />
        <label className="form-check-label">Pix</label>
      </div>
      <div>
        <input
          className="form-check-input"
          id="vr"
          value="vr"
          name="options"
          type="radio"
          checked={selectedPaymentMethod === 'vr'}
          onChange={handleChange}
        />
        <label className="form-check-label">VR</label>
      </div>
    </div>
  );
};

export default PaymentMethod;
