import React, { useState } from 'react';
import styles from '../../assets/styles/CreatePromotions.module.scss';
import Title from '../title';
import { Link } from 'react-router-dom';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getBtnData, deleteData } from '../../api/Api';
import { db } from '../../config-firebase/firebase';
import DefaultComumMessage from '../Messages/DefaultComumMessage';

const CreatePromotions = () => {
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    finalDate: '',
    startDate: '',
    minimumValue: '',
    reusable: '',
    rules: '',
    promotionalItemId: '',
    promotionalItemName: '',
  });

  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [items, setItems] = useState([]);
  const [voucherValue, setVoucherValue] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  React.useEffect(() => {
    fetchPromotions();
    fetchItems();
    fetchVoucherValue();
  }, []);

  const fetchVoucherValue = async () => {
    const docRef = doc(db, 'GlobalConfig', 'voucherSettings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setVoucherValue(docSnap.data().voucherValue || 0);
    }
  };

  const fetchPromotions = async () => {
    const data = await getBtnData('Promotions');
    console.log('Promotions', data);
    setPromotions(data);
  };

  const fetchItems = async () => {
    const data = await getBtnData('item');
    setItems(data);
  };

  React.useEffect(() => {
    if (selectedPromotion) {
      const promotion = promotions.find(
        (item) => item.title === selectedPromotion
      );
      setFormData({
        title: promotion.title,
        discount: promotion.discount,
        finalDate: promotion.finalDate,
        startDate: promotion.startDate,
        minimumValue: promotion.minimumValue,
        reusable: promotion.reusable,
        rules: promotion.rules,
        promotionalItemId: promotion.promotionalItemId || '',
        promotionalItemName: promotion.promotionalItemName || '',
      });
    }
  }, [selectedPromotion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent negative values for discount
    if (name === 'discount' && value < 0) return;

    // Special handling for promotional item select to save both ID and Name
    if (name === 'promotionalItemId') {
      const selectedItem = items.find(item => item.id === value);
      setFormData({
        ...formData,
        promotionalItemId: value,
        promotionalItemName: selectedItem ? selectedItem.title : '',
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e) => {
    setSelectedPromotion(e.target.value);
  };

  const handleConfirmDelete = async () => {
    if (selectedPromotion) {
      try {
        const promotionDoc = promotions.find(
          (item) => item.title === selectedPromotion
        );
        await deleteData('Promotions', promotionDoc.id);
        alert('Promoção excluída com sucesso!');
        fetchPromotions();
        setSelectedPromotion('');
        setFormData({
          title: '',
          discount: '',
          finalDate: '',
          startDate: '',
          minimumValue: '',
          reusable: '',
          rules: '',
          promotionalItemId: '',
          promotionalItemName: '',
        });
      } catch (error) {
        console.error('Erro ao excluir promoção: ', error);
        alert('Erro ao excluir promoção.');
      }
    }
    setShowDeletePopup(false);
  };

  const saveVoucherValue = async () => {
    try {
      const docRef = doc(db, 'GlobalConfig', 'voucherSettings');
      await setDoc(docRef, { voucherValue: Number(voucherValue) }, { merge: true });
      alert('Valor do Voucher de Cadastro atualizado com sucesso!');
    } catch (e) {
      console.error('Error updating voucher value: ', e);
      alert('Erro ao atualizar o valor do voucher.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPromotion) {
        const promotionDoc = promotions.find(
          (item) => item.title === selectedPromotion
        );
        const docRef = doc(db, 'Promotions', promotionDoc.id);
        await updateDoc(docRef, formData);
        console.log('Document updated with ID: ', promotionDoc.id);
        fetchPromotions();
      } else {
        const docRef = await addDoc(collection(db, 'Promotions'), formData);
        fetchPromotions();
        console.log('Document written with ID: ', docRef.id);
      }
    } catch (e) {
      console.error('Error updating or adding document: ', e);
    }
    setSelectedPromotion('');
    setFormData({
      title: '',
      discount: '',
      finalDate: '',
      startDate: '',
      minimumValue: '',
      reusable: '',
      rules: '',
      promotionalItemId: '',
      promotionalItemName: '',
    });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.containerIcon}>
        <a
          href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.475scaihgxn2#heading=h.djl9hnzi3hx"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir documentação"
        >
          <span>?</span>
        </a>
      </div>
      <form onSubmit={handleSubmit} className={styles.promotionForm}>
        <Link to="/admin/admin">
          <Title mainTitle="Promoções"></Title>
        </Link>
        <div>
          <label title="O nome que aparecerá no PDV (ex: &quot;Happy Hour&quot;).">
            Titulo da Promoção:
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            title="O nome que aparecerá no PDV (ex: &quot;Happy Hour&quot;)."
          />
        </div>
        <div>
          <label title="O valor fixo que será subtraído do total do pedido.">
            {formData.promotionalItemId ? 'Novo valor do produto com desconto:' : 'Desconto:'}
          </label>
          <input
            type="number"
            name="discount"
            min="0"
            step="0.01"
            value={formData.discount}
            onChange={handleChange}
            title="O valor fixo que será subtraído do total ou o novo preço do item selecionado."
          />
        </div>

        <div className={styles.orSeparator}>ou</div>

        <div className={styles.promotionalItemField}>
          <label title="Escolha um item específico para esta promoção. Se selecionado, o valor acima será o preço final deste item.">
            Produto da Promoção:
          </label>
          <select
            name="promotionalItemId"
            value={formData.promotionalItemId}
            onChange={handleChange}
          >
            <option value="">Nenhum (Desconto Global)</option>
            {items && items.length > 0 && items.map((item, index) => (
              <option key={index} value={item.id}>
                {item.title} (R$ {item.price})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dateField}>
          <div>
            <label title="Define o período de validade. Se hoje não estiver entre essas datas, a promoção não aparecerá no PDV.">
              Data Incial:
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              title="Define o período de validade. Se hoje não estiver entre essas datas, a promoção não aparecerá no PDV."
            />
          </div>
          <div>
            <label title="Define o período de validade. Se hoje não estiver entre essas datas, a promoção não aparecerá no PDV.">
              Data Final:
            </label>
            <input
              type="date"
              name="finalDate"
              value={formData.finalDate}
              onChange={handleChange}
              title="Define o período de validade. Se hoje não estiver entre essas datas, a promoção não aparecerá no PDV."
            />
          </div>
        </div>
        <div>
          <label>Selecione uma promoção:</label>
          <select
            name="selectedPromotion"
            value={selectedPromotion}
            onChange={handleSelectChange}
          >
            <option value="">Selecione uma promoção para editar</option>
            {promotions &&
              promotions.length > 0 &&
              promotions.map((promotion, index) => (
                <option key={index} value={promotion.title}>
                  {promotion.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label title="Define se um cliente pode usar a promoção mais de uma vez (leia mais abaixo).">
            Reuso:
          </label>
          <select
            name="reusable"
            value={formData.reusable}
            onChange={handleChange}
            title="Define se um cliente pode usar a promoção mais de uma vez (leia mais abaixo)."
          >
            <option value="">Reuso</option>
            <option value="true">Reusable</option>
            <option value="false">Not Reusable</option>
          </select>
        </div>
        <div>
          <label title="O valor que o cliente precisa atingir (em um pedido ou acumulado) para &quot;desbloquear&quot; o desconto.">
            Valor mínimo da promoção para resgate do desconto:
          </label>
          <input
            type="text"
            name="minimumValue"
            value={formData.minimumValue}
            onChange={handleChange}
            title="O valor que o cliente precisa atingir (em um pedido ou acumulado) para &quot;desbloquear&quot; o desconto."
          />
        </div>
        <div className={styles.rulesField}>
          <label title="Texto descritivo das regras que o atendente verá ao aplicar a promoção.">
            Regras da promoção:
          </label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            title="Texto descritivo das regras que o atendente verá ao aplicar a promoção."
          />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.button}>
            {selectedPromotion ? 'Salvar novas edições' : 'Criar Promoção'}
          </button>
          {selectedPromotion && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setShowDeletePopup(true)}
            >
              Excluir Promoção
            </button>
          )}
        </div>

        {showDeletePopup && (
          <DefaultComumMessage
            msg={`Tem certeza que deseja excluir a promoção "${selectedPromotion}"?`}
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
            affirmativeResponse="Excluir"
            negativeResponse="Cancelar"
          />
        )}

        <div className={styles.voucherSection}>
          <label title="Este valor define o desconto automático para novos clientes cadastrados. Se for 0, o voucher será desabilitado. O nome do cliente no PDV só será clicável se houver um valor definido.">
            Voucher para clientes que se cadastrarem:
          </label>
          <div className={styles.voucherInputWrapper}>
            <input
              type="number"
              min="0"
              value={voucherValue}
              onChange={(e) => setVoucherValue(e.target.value)}
              title="Este valor define o desconto automático para novos clientes cadastrados. Se for 0, o voucher será desabilitado."
            />
            <button
              type="button"
              onClick={saveVoucherValue}
              className={styles.voucherButton}
            >
              Salvar Voucher
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePromotions;
