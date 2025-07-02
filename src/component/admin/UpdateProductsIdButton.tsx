// src/components/admin/UpdateProductsIdButton.tsx
// import React, { useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   updateDoc,
//   doc,
// } from 'firebase/firestore';

// const UpdateProductsIdButton = () => {
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<string | null>(null);

//   const handleUpdate = async () => {
//     setLoading(true);
//     setStatus(null);

//     const db = getFirestore();
//     const productsCollection = collection(db, 'product');

//     try {
//       const snapshot = await getDocs(productsCollection);

//       for (const document of snapshot.docs) {
//         const docRef = doc(db, 'product', document.id);
//         const data = document.data();

//         if (!data.idProduct) {
//           await updateDoc(docRef, {
//             idProduct: document.id,
//           });
//           console.log(`✅ Atualizado: ${document.id}`);
//         } else {
//           console.log(`⏩ Já possui idProduct: ${document.id}`);
//         }
//       }

//       setStatus('Todos os documentos foram atualizados com sucesso.');
//     } catch (error) {
//       console.error('❌ Erro ao atualizar documentos:', error);
//       setStatus('Erro ao atualizar documentos. Veja o console.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Atualizar idProduct dos documentos</h2>
//       <button onClick={handleUpdate} disabled={loading}>
//         {loading ? 'Atualizando...' : 'Atualizar Coleção "product"'}
//       </button>
//       {status && <p>{status}</p>}
//     </div>
//   );
// };

// export default UpdateProductsIdButton;

// src/components/admin/NormalizeOutgoingDataButton.tsx

import React, { useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

type OutgoingItem = {
  product: string;
  amount: number;
  CostPerUnit: number;
  totalCost: number;
  volumePerUnit: number;
  idProduct: string;
  totalVolume: number;
  operationSupplies: boolean;
  unitOfMeasurement: string;
  paymentDate?: string;
  expenseId?: string;
  account?: string;
  provider?: string;
};

type OutgoingDocument = {
  id: string;
  dueDate: string | Timestamp;
  paymentDate?: string;
  expenseId?: string;
  account?: string;
  provider?: string;
  items?: OutgoingItem[];
};

const NormalizeOutgoingDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const normalizeOutgoing = async () => {
    setLoading(true);
    setStatus(null);

    const db = getFirestore();
    const outgoingCollection = collection(db, 'outgoing');

    try {
      const snapshot = await getDocs(outgoingCollection);

      const documents: OutgoingDocument[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<OutgoingDocument, 'id'>),
      }));

      // Ordenar por dueDate decrescente (mais recente primeiro)
      const sortedDocs = documents.sort((a, b) => {
        const dateA =
          a.dueDate instanceof Timestamp
            ? a.dueDate.toDate()
            : new Date(a.dueDate);
        const dateB =
          b.dueDate instanceof Timestamp
            ? b.dueDate.toDate()
            : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });

      const top10 = sortedDocs.slice(0, 10);
      const toDelete = sortedDocs.slice(10);

      // 🔥 1. Deletar os que não fazem parte dos 10 mais recentes
      for (const docData of toDelete) {
        const docRef = doc(db, 'outgoing', docData.id);
        await deleteDoc(docRef);
        console.log(`🗑️ Documento deletado: ${docData.id}`);
      }

      // 🔁 2. Atualizar os 10 restantes com os dados replicados dentro de items
      for (const docData of top10) {
        const docRef = doc(db, 'outgoing', docData.id);

        const { items, paymentDate, expenseId, account, provider } = docData;

        if (Array.isArray(items) && items.length > 0) {
          const updatedItems = items.map((item) => ({
            ...item,
            paymentDate: paymentDate || '',
            expenseId: expenseId || '',
            account: account || '',
            provider: provider || '',
          }));

          await updateDoc(docRef, {
            items: updatedItems,
          });

          console.log(`✅ Documento atualizado: ${docData.id}`);
        } else {
          console.log(`⏩ Documento ignorado (sem items): ${docData.id}`);
        }
      }

      setStatus('Coleção normalizada com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao normalizar a coleção:', error);
      setStatus('Erro ao normalizar. Veja o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Normalizar coleção "outgoing"</h2>
      <p>
        Isso manterá apenas os 10 mais recentes e irá atualizar os{' '}
        <code>items</code>.
      </p>
      <button onClick={normalizeOutgoing} disabled={loading}>
        {loading ? 'Processando...' : 'Executar Normalização'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default NormalizeOutgoingDataButton;
