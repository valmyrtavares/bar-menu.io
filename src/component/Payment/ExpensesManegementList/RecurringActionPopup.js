import React from 'react';
import styles from '../../../assets/styles/RecurringActionPopup.module.scss';

const RecurringActionPopup = ({ action, expense, onConfirmOnlyThis, onConfirmAllFuture, onClose }) => {
  const isEdit = action === 'edit';

  return (
    <>
      <div className={styles.overlay}></div>
      <div className={styles.popupContainer}>
        <h1>Despesa Recorrente</h1>
        <h3>
          A despesa <strong>{expense.name || expense.product}</strong> possui múltiplas parcelas.
        </h3>
        <h3>
          Você deseja {isEdit ? 'editar' : 'excluir'} <strong>apenas esta parcela</strong> ou{' '}
          <strong>esta e todas as futuras</strong>?
        </h3>
        <div className={styles.containerButton}>
          <button onClick={onConfirmOnlyThis} type="button">
            Somente Esta
          </button>
          <button onClick={onConfirmAllFuture} type="button">
            Esta e Próximas
          </button>
          <button onClick={onClose} type="button">
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

export default RecurringActionPopup;
