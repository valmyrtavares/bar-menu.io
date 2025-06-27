// src/components/admin/UpdateProductsIdButton.tsx
import React, { useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

const UpdateProductsIdButton = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setStatus(null);

    const db = getFirestore();
    const productsCollection = collection(db, 'product');

    try {
      const snapshot = await getDocs(productsCollection);

      for (const document of snapshot.docs) {
        const docRef = doc(db, 'product', document.id);
        const data = document.data();

        if (!data.idProduct) {
          await updateDoc(docRef, {
            idProduct: document.id,
          });
          console.log(`✅ Atualizado: ${document.id}`);
        } else {
          console.log(`⏩ Já possui idProduct: ${document.id}`);
        }
      }

      setStatus('Todos os documentos foram atualizados com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao atualizar documentos:', error);
      setStatus('Erro ao atualizar documentos. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Atualizar idProduct dos documentos</h2>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Atualizando...' : 'Atualizar Coleção "product"'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default UpdateProductsIdButton;
