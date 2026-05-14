import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';

const InventoryHistoryPopup = ({ onClose }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'inventoryHistory'));
        const data = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          
          // Calcular a diferença real usando o array de items
          let difference = 0;
          if (docData.items && Array.isArray(docData.items)) {
            difference = docData.items.reduce((acc, item) => {
              return acc + (Number(item.currentCost) - Number(item.previousCost));
            }, 0);
          } else {
            // Fallback se por acaso a lógica de items falhar (ex: usando apenas totalLossValue antigo)
            difference = -(docData.totalLossValue || 0);
          }

          data.push({
            id: doc.id.substring(0, 4).toUpperCase(),
            fullId: doc.id,
            date: docData.date,
            timestamp: docData.timestamp || 0,
            difference: difference
          });
        });

        // Ordenar do mais recente para o mais antigo
        data.sort((a, b) => b.timestamp - a.timestamp);
        
        setHistoryItems(data);
      } catch (err) {
        console.error("Erro ao carregar histórico de inventários", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className={styleEdit.popupOverlay}>
      <div className={styleEdit.containerEditStock} style={{ maxWidth: '800px' }}>
        <div className={styleEdit.closeBtnRow}>
          <button className={styleEdit.closeBtn} type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className={styleEdit.titleRow}>
          <h2>Histórico de Inventários</h2>
          <p style={{ marginTop: '10px' }}>Consulta de inventários salvos anteriormente.</p>
        </div>

        <div className={styleTrack.tableStockContainer} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <p>Carregando histórico...</p>
          ) : historyItems.length === 0 ? (
            <p>Nenhum histórico encontrado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Diferença em dinheiro</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => {
                  const isNegative = item.difference < 0;
                  const isPositive = item.difference > 0;
                  const color = isNegative ? 'red' : isPositive ? '#007bff' : 'inherit'; // #007bff is blue

                  // formatar diferença em dinheiro
                  const absValue = Math.abs(item.difference);
                  const formattedValue = `R$ ${absValue.toFixed(2).replace('.', ',')}`;
                  const prefix = isNegative ? '- ' : isPositive ? '+ ' : '';

                  return (
                    <tr key={item.fullId}>
                      <td style={{ fontWeight: 'bold' }}>{item.id}</td>
                      <td>{item.date}</td>
                      <td style={{ color: color, fontWeight: 'bold' }}>
                        {prefix}{formattedValue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={styleEdit.btnRow} style={{ justifyContent: 'center', marginTop: '20px' }}>
           <button 
             className={styleEdit.closeBtn} 
             style={{ position: 'relative', top: 0, right: 0 }} 
             type="button" 
             onClick={onClose}
           >
             Fechar
           </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryHistoryPopup;
