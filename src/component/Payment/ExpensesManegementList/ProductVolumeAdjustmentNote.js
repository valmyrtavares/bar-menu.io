import React, { useState } from 'react';
import styles from '../../../assets/styles/productVolumeAdjustmentNote.module.scss';

// src/component/Payment/ExpensesManegementList/productVolumeAdjustmentNote.js

const ProductVolumeAdjustmentNote = ({
  showPopupNote,
  setShowPopupNote,
  setNote,
}) => {
  const [noteValue, setNoteValue] = useState('');

  if (!showPopupNote) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setNote(noteValue);
    setShowPopupNote(false);
    setNoteValue('');
  };

  return (
    <div className={styles.ProductVolumeAdjustmentNote__container}>
      <div className={styles.ProductVolumeAdjustmentNote__message}>
        Para editar para mais ou para menos o atual volume desse produto é
        necessário uma breve nota justificando.
      </div>
      <form
        className={styles.ProductVolumeAdjustmentNote__form}
        onSubmit={handleSubmit}
      >
        <textarea
          className={styles.ProductVolumeAdjustmentNote__textarea}
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          rows={5}
          maxLength={300}
          placeholder="Digite sua justificativa..."
          required
        />
        <button
          type="submit"
          className={styles.ProductVolumeAdjustmentNote__button}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ProductVolumeAdjustmentNote;
