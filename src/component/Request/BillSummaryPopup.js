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
        
        {isProcessingPayment ? (
          <div className={styles.processingPaymentContainer} style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--btn-color)', marginBottom: '20px' }}>
              Solicitação Enviada!
            </h2>
            <p style={{ fontSize: '1.3rem', lineHeight: '1.6' }}>
              O Garçom já está a caminho com a máquina para finalizar o seu pagamento na mesa.
            </p>
            <p style={{ marginTop: '20px', opacity: 0.8 }}>
              Por favor, aguarde o fechamento da conta.
            </p>
          </div>
        ) : (
          <>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillSummaryPopup;
