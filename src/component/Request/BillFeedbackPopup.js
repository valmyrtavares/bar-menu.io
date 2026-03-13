import React from 'react';
import styles from '../../assets/styles/BillPopups.module.scss';

const BillFeedbackPopup = ({ 
  serviceRating, 
  setServiceRating, 
  foodRating, 
  setFoodRating, 
  waiterComment, 
  setWaiterComment, 
  onCancel, 
  onConfirm 
}) => {
  return (
    <div className={styles.billPopupOverlay}>
      <div className={styles.billPopup}>
        <h3>Avalie sua experiência</h3>
        
        <div className={styles.ratingSection}>
          <p>Qual a avaliação você faz do atendimento?</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={`${styles.star} ${serviceRating >= star ? styles.active : ''}`}
                onClick={() => setServiceRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className={styles.ratingSection}>
          <p>Qual a avaliação você faz dos pratos?</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className={`${styles.star} ${foodRating >= star ? styles.active : ''}`}
                onClick={() => setFoodRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className={styles.commentSection}>
          <p>Deixe o seu comentário se achar necessário</p>
          <textarea 
            value={waiterComment}
            onChange={(e) => setWaiterComment(e.target.value)}
            rows="3"
            placeholder="Sua opinião é muito importante para nós..."
          />
        </div>

        <div className={styles.popupActions}>
          <button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={onCancel}>
            Cancelar
          </button>
          <button className={`${styles.actionBtn} ${styles.confirmBtn}`} onClick={onConfirm}>
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillFeedbackPopup;
