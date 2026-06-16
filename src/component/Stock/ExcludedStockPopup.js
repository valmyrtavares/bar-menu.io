import React, { useState, useEffect } from 'react';
import { getBtnData, fetchStockUsageLogs } from '../../api/Api';
import AdjustmentRecords from './AdjustmentRecords';
import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';

const ExcludedStockPopup = ({ onClose }) => {
  const [deletedStock, setDeletedStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentRecords, setShowAdjustmentRecords] = useState(false);
  const [eventLogData, setEventLogData] = useState(null);
  const [logTitle, setLogTitle] = useState('');

  useEffect(() => {
    const fetchDeletedStock = async () => {
      try {
        const data = await getBtnData('deletedStock');
        const sorted = (data || []).sort((a, b) => a.product.localeCompare(b.product));
        // Only raw materials (operationSupplies === false)
        const filtered = sorted.filter(item => item.operationSupplies === false);
        setDeletedStock(filtered);
      } catch (err) {
        console.error("Erro ao carregar matérias-primas excluídas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeletedStock();
  }, []);

  const viewLogs = async (item) => {
    setLogTitle(item.product);
    const logs = await fetchStockUsageLogs(item.id);
    let mergedLogs = [...(logs || [])];
    if (item.UsageHistory && item.UsageHistory.length > 0) {
      mergedLogs = [...mergedLogs, ...item.UsageHistory];
    }
    setEventLogData(mergedLogs);
    setShowAdjustmentRecords(true);
  };

  return (
    <div className={styleEdit.popupOverlay} style={{ zIndex: 9999 }}>
      <div className={styleEdit.containerEditStock} style={{ maxWidth: '1000px', width: '95%' }}>
        <div className={styleEdit.closeBtnRow}>
          <button className={styleEdit.closeBtn} type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className={styleEdit.titleRow}>
          <h2>Matérias-Primas Excluídas</h2>
          <p>Consulta histórica de matérias-primas que foram desativadas e excluídas permanentemente do estoque ativo.</p>
        </div>

        <div className={styleTrack.tableStockContainer} style={{ maxHeight: '450px', overflowY: 'auto', marginTop: '20px' }}>
          {loading ? (
            <p>Carregando dados...</p>
          ) : deletedStock.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma matéria-prima excluída registrada.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Custo Final</th>
                  <th>Volume Final</th>
                  <th>Data de Exclusão</th>
                  <th>Histórico/Logs</th>
                </tr>
              </thead>
              <tbody>
                {deletedStock.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.product} ({item.unitOfMeasurement})</td>
                    <td>R$ {Number(item.totalCost || 0).toFixed(2)}</td>
                    <td>{Number(item.totalVolume || 0).toFixed(2)} {item.unitOfMeasurement}</td>
                    <td>{item.deletedAt ? new Date(item.deletedAt).toLocaleDateString('pt-BR') : 'Sem data'}</td>
                    <td>
                      <button 
                        onClick={() => viewLogs(item)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#3498db',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Ver Logs 🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styleTrack.containerAdjustmentScreen}>
          {showAdjustmentRecords && (
            <AdjustmentRecords
              eventLogData={eventLogData}
              setShowAdjustmentRecords={setShowAdjustmentRecords}
              title={logTitle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcludedStockPopup;
