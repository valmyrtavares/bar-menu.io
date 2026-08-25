import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { doc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { updateDoc } from '../../api/FirestoreInterceptor';
import styles from './EditCustomerModal.module.scss';

const EditCustomerModal = ({ customer, isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    birthday: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (customer) {
      const initialName =
        customer.name && customer.name !== 'anonimo' && customer.name !== 'anonymous'
          ? customer.name
          : customer.fantasyName || customer.clientName || customer.nome || '';

      setForm({
        name: typeof initialName === 'string' ? initialName.trim() : '',
        cpf: customer.cpf || '',
        phone: customer.phone || '',
        birthday: customer.birthday || '',
        email: customer.email && customer.email !== 'anonimo@anonimo.com' ? customer.email : '',
      });
      setErrorMsg('');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim()) {
      setErrorMsg('O nome do cliente não pode ficar em branco.');
      return;
    }

    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const updatedFields = {
        name: cleanName,
        fantasyName: cleanName,
        cpf: form.cpf ? form.cpf.trim() : '',
        phone: form.phone ? form.phone.trim() : '',
        birthday: form.birthday ? form.birthday.trim() : '',
        email: form.email ? form.email.trim() : '',
      };

      const userDocRef = doc(db, 'user', customer.id);
      await updateDoc(userDocRef, updatedFields);

      if (onSaved) {
        onSaved({ ...customer, ...updatedFields });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setErrorMsg('Erro ao salvar os dados do cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="modal-title">Editar Cliente</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="customer-name">Nome Completo</label>
              <input
                id="customer-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                required
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customer-cpf">CPF</label>
              <input
                id="customer-cpf"
                name="cpf"
                type="text"
                value={form.cpf}
                onChange={handleChange}
                placeholder="Ex: 000.000.000-00"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customer-phone">Celular / Telefone</label>
              <input
                id="customer-phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ex: (11) 98765-4321"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customer-birthday">Data de Aniversário</label>
              <input
                id="customer-birthday"
                name="birthday"
                type="text"
                value={form.birthday}
                onChange={handleChange}
                placeholder="Ex: 15/05/1990 ou 15-05-1990"
              />
              <span className={styles.hint}>
                Use o formato DD/MM/AAAA ou DD-MM-AAAA para suporte aos filtros de aniversariantes.
              </span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="customer-email">E-mail</label>
              <input
                id="customer-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ex: cliente@email.com"
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSave}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default EditCustomerModal;
