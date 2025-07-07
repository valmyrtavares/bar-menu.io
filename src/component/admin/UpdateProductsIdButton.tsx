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

// import React, { useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   updateDoc,
//   doc,
//   deleteDoc,
//   Timestamp,
// } from 'firebase/firestore';

// type OutgoingItem = {
//   product: string;
//   amount: number;
//   CostPerUnit: number;
//   totalCost: number;
//   volumePerUnit: number;
//   idProduct: string;
//   totalVolume: number;
//   operationSupplies: boolean;
//   unitOfMeasurement: string;
//   paymentDate?: string;
//   expenseId?: string;
//   account?: string;
//   provider?: string;
// };

// type OutgoingDocument = {
//   id: string;
//   dueDate: string | Timestamp;
//   paymentDate?: string;
//   expenseId?: string;
//   account?: string;
//   provider?: string;
//   items?: OutgoingItem[];
// };

// const NormalizeOutgoingDataButton = () => {
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<string | null>(null);

//   const normalizeOutgoing = async () => {
//     setLoading(true);
//     setStatus(null);

//     const db = getFirestore();
//     const outgoingCollection = collection(db, 'outgoing');

//     try {
//       const snapshot = await getDocs(outgoingCollection);

//       const documents: OutgoingDocument[] = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...(doc.data() as Omit<OutgoingDocument, 'id'>),
//       }));

//       // Ordenar por dueDate decrescente (mais recente primeiro)
//       const sortedDocs = documents.sort((a, b) => {
//         const dateA =
//           a.dueDate instanceof Timestamp
//             ? a.dueDate.toDate()
//             : new Date(a.dueDate);
//         const dateB =
//           b.dueDate instanceof Timestamp
//             ? b.dueDate.toDate()
//             : new Date(b.dueDate);
//         return dateB.getTime() - dateA.getTime();
//       });

//       const top10 = sortedDocs.slice(0, 10);
//       const toDelete = sortedDocs.slice(10);

//       // 🔥 1. Deletar os que não fazem parte dos 10 mais recentes
//       for (const docData of toDelete) {
//         const docRef = doc(db, 'outgoing', docData.id);
//         await deleteDoc(docRef);
//         console.log(`🗑️ Documento deletado: ${docData.id}`);
//       }

//       // 🔁 2. Atualizar os 10 restantes com os dados replicados dentro de items
//       for (const docData of top10) {
//         const docRef = doc(db, 'outgoing', docData.id);

//         const { items, paymentDate, expenseId, account, provider } = docData;

//         if (Array.isArray(items) && items.length > 0) {
//           const updatedItems = items.map((item) => ({
//             ...item,
//             paymentDate: paymentDate || '',
//             expenseId: expenseId || '',
//             account: account || '',
//             provider: provider || '',
//           }));

//           await updateDoc(docRef, {
//             items: updatedItems,
//           });

//           console.log(`✅ Documento atualizado: ${docData.id}`);
//         } else {
//           console.log(`⏩ Documento ignorado (sem items): ${docData.id}`);
//         }
//       }

//       setStatus('Coleção normalizada com sucesso.');
//     } catch (error) {
//       console.error('❌ Erro ao normalizar a coleção:', error);
//       setStatus('Erro ao normalizar. Veja o console.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Normalizar coleção "outgoing"</h2>
//       <p>
//         Isso manterá apenas os 10 mais recentes e irá atualizar os{' '}
//         <code>items</code>.
//       </p>
//       <button onClick={normalizeOutgoing} disabled={loading}>
//         {loading ? 'Processando...' : 'Executar Normalização'}
//       </button>
//       {status && <p>{status}</p>}
//     </div>
//   );
// };

// export default NormalizeOutgoingDataButton;

//&&&&&&&******************************************************************************************

// import React, { useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   updateDoc,
//   doc,
// } from 'firebase/firestore';

// const CleanUsageHistoryButton = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [resultMessage, setResultMessage] = useState('');

//   const cleanUsageHistory = async () => {
//     setIsLoading(true);
//     setResultMessage('');

//     const db = getFirestore();
//     const stockRef = collection(db, 'stock');

//     try {
//       const snapshot = await getDocs(stockRef);
//       let updatedCount = 0;

//       const updates = snapshot.docs.map(async (document) => {
//         const data = document.data();
//         const usageHistory = data.UsageHistory;

//         if (Array.isArray(usageHistory) && usageHistory.length > 100) {
//           const last100Items = usageHistory.slice(-100); // mantém os últimos 100
//           const docRef = doc(db, 'stock', document.id);

//           await updateDoc(docRef, {
//             UsageHistory: last100Items,
//           });

//           updatedCount++;
//         }
//       });

//       await Promise.all(updates);
//       setResultMessage(
//         `Limpeza concluída com sucesso. ${updatedCount} documento(s) atualizados.`
//       );
//     } catch (error) {
//       console.error('Erro ao limpar UsageHistory:', error);
//       setResultMessage('Ocorreu um erro durante a limpeza.');
//     }

//     setIsLoading(false);
//   };

//   return (
//     <div style={{ padding: '1rem' }}>
//       <button
//         onClick={cleanUsageHistory}
//         disabled={isLoading}
//         style={{
//           padding: '10px 20px',
//           fontSize: '16px',
//           cursor: 'pointer',
//         }}
//       >
//         {isLoading ? 'Limpando...' : 'Limpar UsageHistory'}
//       </button>
//       {resultMessage && <p style={{ marginTop: '10px' }}>{resultMessage}</p>}
//     </div>
//   );
// };

// export default CleanUsageHistoryButton;

//*********************************************************************************** */

import React from 'react';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';

const UpdateProductsIdButton = () => {
  const handleImport = async () => {
    debugger;
    try {
      const response = await fetch('/backup/request-2025-07-04.json');
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('❌ JSON não é um array de objetos.');
        return;
      }

      // Ordena por countRequest do maior para o menor
      const sortedData = data.sort((a, b) => b.countRequest - a.countRequest);

      // Pega os 200 com maior countRequest
      const top200 = sortedData.slice(0, 200);
      debugger;

      const db = getFirestore();
      const collectionRef = collection(db, 'requests'); // nova coleção

      // Adiciona os 200 ao Firestore
      for (const item of top200) {
        if (!item.id) continue; // pular se não tiver ID

        const docRef = doc(collectionRef, item.id); // usa o mesmo ID do documento original
        await setDoc(docRef, item);
        console.log('✅ Documento inserido:', item.id);
      }

      alert(
        '✅ 200 registros importados com sucesso para a nova coleção "requests".'
      );
    } catch (error) {
      console.error('❌ Erro ao importar JSON ou enviar ao Firestore:', error);
      alert('❌ Falha ao importar dados. Verifique o console.');
    }
  };

  return (
    <button onClick={handleImport}>
      Importar últimos 200 pedidos para "requests"
    </button>
  );
};

export default UpdateProductsIdButton;
