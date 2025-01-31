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
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getBtnData } from '../../api/Api';

const CreatePromotions = () => {
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    finalDate: '',
    startDate: '',
    minimumValue: '',
    reusable: '',
    rules: '',
  });

  const app = getApp();
  const db = getFirestore(app);

  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [promotions, setPromotions] = useState([]);

  React.useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const data = await getBtnData('Promotions');
    console.log('Promotions', data);
    setPromotions(data);
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
      });
    }
  }, [selectedPromotion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e) => {
    setSelectedPromotion(e.target.value);
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
    });
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.promotionForm}>
        <Link to="/admin/admin">
          <Title mainTitle="Promoções"></Title>
        </Link>
        <div>
          <label>Titulo da Promoção:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Desconto:</label>
          <input
            type="text"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
          />
        </div>
        <div className={styles.dateField}>
          <div>
            <label>Data Incial:</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Data Final:</label>
            <input
              type="date"
              name="finalDate"
              value={formData.finalDate}
              onChange={handleChange}
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
          <label>Reuso:</label>
          <select
            name="reusable"
            value={formData.reusable}
            onChange={handleChange}
          >
            <option value="">Reuso</option>
            <option value="true">Reusable</option>
            <option value="false">Not Reusable</option>
          </select>
        </div>
        <div>
          <label>Valor mínimo da promoção para resgate do desconto:</label>
          <input
            type="text"
            name="minimumValue"
            value={formData.minimumValue}
            onChange={handleChange}
          />
        </div>
        <div className={styles.rulesField}>
          <label>Regras da promoção:</label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
          />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.button}>
            {selectedPromotion ? 'Editar Promoção' : 'Criar Promoção'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePromotions;
