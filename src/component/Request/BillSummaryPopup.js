import React from 'react';
import styles from '../../assets/styles/BillPopups.module.scss';

const BillSummaryPopup = ({ 
  requests, 
  subtotal, 
  includeServiceCharge, 
  setIncludeServiceCharge, 
  isProcessingPayment,
  onBack, 
  onPay 
}) => {
  const serviceChargeValue = subtotal * 0.1;
  const totalFinal = subtotal + (includeServiceCharge ? serviceChargeValue : 0);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={styles.billPopupOverlay}>
      <div className={styles.billPopup}>
        <h3>Extrato do Pedido</h3>
        
        <div className={styles.billTableContainer}>
          <table className={styles.billTable}>
            <thead>
              <tr>
                <th>Produto</th>
                <th style={{ textAlign: 'right' }}>Preço</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.finalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.billingDetails}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          <div className={styles.serviceCharge}>
            <label>
              <input 
                type="checkbox" 
                disabled={isProcessingPayment}
                checked={includeServiceCharge}
                onChange={(e) => setIncludeServiceCharge(e.target.checked)}
              />
              Cobrar atendimento (10%)
            </label>
            {includeServiceCharge && (
              <span>{formatCurrency(serviceChargeValue)}</span>
            )}
          </div>

          <div className={styles.totalFinal}>
            <span>Total Final</span>
            <span>{formatCurrency(totalFinal)}</span>
          </div>
        </div>

        <div className={styles.popupActions}>
          <button 
            className={`${styles.actionBtn} ${styles.cancelBtn}`} 
            onClick={onBack}
            disabled={isProcessingPayment}
          >
            Voltar
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.confirmBtn}`} 
            onClick={onPay}
            disabled={isProcessingPayment}
          >
            Pagar
          </button>

          {isProcessingPayment && (
            <div className={styles.waiterComingMessage}>
              O Garçom já está a caminho!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillSummaryPopup;
