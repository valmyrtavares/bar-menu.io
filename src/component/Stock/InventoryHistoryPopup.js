import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';

const InventoryHistoryPopup = ({ onClose }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);

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
            difference: difference,
            items: docData.items || []
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
          <h2>{selectedInventory ? `Detalhes do Inventário ${selectedInventory.id}` : 'Histórico de Inventários'}</h2>
          <p style={{ marginTop: '10px' }}>
            {selectedInventory ? `Data: ${selectedInventory.date}` : 'Consulta de inventários salvos anteriormente. Clique na linha para detalhes.'}
          </p>
        </div>

        <div className={styleTrack.tableStockContainer} style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <p>Carregando histórico...</p>
          ) : historyItems.length === 0 ? (
            <p>Nenhum histórico encontrado.</p>
          ) : selectedInventory ? (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Antes</th>
                  <th>Depois</th>
                  <th>Dif. Volume</th>
                  <th>Dif. Dinheiro</th>
                </tr>
              </thead>
              <tbody>
                {selectedInventory.items.length === 0 && (
                   <tr><td colSpan="5" style={{textAlign: 'center'}}>Sem detalhes de itens para este inventário.</td></tr>
                )}
                {selectedInventory.items.map((prod, idx) => {
                  const difVol = Number(prod.currentVolume) - Number(prod.previousVolume);
                  const difCost = Number(prod.currentCost) - Number(prod.previousCost);
                  
                  const isNegative = difCost < 0;
                  const isPositive = difCost > 0;
                  const color = isNegative ? 'red' : isPositive ? '#007bff' : 'inherit';
                  
                  return (
                    <tr key={idx}>
                      <td>{prod.product}</td>
                      <td>{Number(prod.previousVolume).toFixed(2)} {prod.unit}</td>
                      <td>{Number(prod.currentVolume).toFixed(2)} {prod.unit}</td>
                      <td>{difVol > 0 ? '+' : ''}{difVol.toFixed(2)} {prod.unit}</td>
                      <td style={{ color: color, fontWeight: 'bold' }}>
                        {difCost > 0 ? '+' : ''}R$ {difCost.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                    <tr 
                      key={item.fullId}
                      onClick={() => setSelectedInventory(item)}
                      style={{ cursor: 'pointer' }}
                      title="Clique para ver detalhes"
                    >
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

        <div className={styleEdit.btnRow} style={{ justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
           {selectedInventory && (
             <button 
               className={styleEdit.closeBtn} 
               style={{ position: 'relative', top: 0, right: 0, backgroundColor: '#6c757d', color: '#fff' }} 
               type="button" 
               onClick={() => setSelectedInventory(null)}
             >
               Voltar
             </button>
           )}
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
