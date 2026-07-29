import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { issueAutoNfce, getCircuitBreakerState, resetFiscalCircuitBreaker } from '../../services/fiscalService';

const FiscalAlertBanner = () => {
  const [failedOrders, setFailedOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reemittingId, setReemittingId] = useState(null);
  const [discardingId, setDiscardingId] = useState(null);
  const [isDiscardingAll, setIsDiscardingAll] = useState(false);
  const [circuitBreaker, setCircuitBreaker] = useState({ isTripped: false, reason: null });

  useEffect(() => {
    // Monitora o estado do Disjuntor de Emergência a cada 1.5s
    const cbInterval = setInterval(() => {
      const state = getCircuitBreakerState();
      setCircuitBreaker({ isTripped: !!state.isTripped, reason: state.reason });
    }, 1500);

    // Monitora em tempo real qualquer pedido pago que tenha erro ou rejeição fiscal
    const q = query(
      collection(db, 'requests'),
      where('paymentDone', '==', true),
      where('nfceStatus', 'in', ['erro', 'rejeitado'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const failed = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setFailedOrders(failed);
    }, (error) => {
      console.error("Erro ao observar erros fiscais:", error);
    });

    return () => {
      clearInterval(cbInterval);
      unsubscribe();
    };
  }, []);

  const handleReemit = async (order) => {
    try {
      setReemittingId(order.id);

      // Gera uma referência única para o reenvio (evita que a API da Focus retorne o erro em cache do envio anterior)
      const cleanName = (order.name || 'CLIENTE').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-').substring(0, 15).toUpperCase();
      const orderId = order.countRequest || order.id || 'SN';
      const retryRef = `REQ--${orderId}--${cleanName}--R${Date.now().toString(36)}`;

      const retryOrder = {
        ...order,
        nfceRef: retryRef
      };

      const result = await issueAutoNfce(retryOrder);

      const orderRef = doc(db, 'requests', order.id);
      if (result && (result.status === 'autorizado' || result.duplicateBlocked) && (result.caminho_danfe || result.duplicateBlocked)) {
        await updateDoc(orderRef, {
          nfceIssued: true,
          sendingNfce: false,
          nfcePrinted: false,
          caminho_danfe: result.caminho_danfe || order.caminho_danfe,
          nfceStatus: 'autorizado',
          nfceRef: result.ref || retryRef,
          nfceErrorDetail: null
        });
        alert(`Sucesso! Nota fiscal do pedido ${order.countRequest || order.id} autorizada.`);
      } else {
        await updateDoc(orderRef, {
          sendingNfce: false,
          nfceStatus: (result?.status === 'rejeitado') ? 'rejeitado' : 'erro',
          nfceErrorDetail: result?.mensagem_sefaz || result?.erro || 'Erro na resposta da API'
        });
        alert(`Ainda com erro: ${result?.mensagem_sefaz || 'Verifique os dados'}`);
      }
    } catch (err) {
      console.error('Erro na re-emissão:', err);
      alert(`Falha ao re-emitir: ${err.message}`);
    } finally {
      setReemittingId(null);
    }
  };

  const handleDiscard = async (order) => {
    const confirmDiscard = window.confirm(
      `Tem certeza que deseja descartar e remover o alerta fiscal do pedido #${order.countRequest || order.id}? Esta nota não será re-emitida.`
    );
    if (!confirmDiscard) return;

    try {
      setDiscardingId(order.id);
      const orderRef = doc(db, 'requests', order.id);
      await updateDoc(orderRef, {
        nfceStatus: 'descartado',
        nfceErrorDetail: null,
        sendingNfce: false,
        nfceDiscardedAt: new Date().toISOString()
      });
      alert(`Alerta fiscal do pedido #${order.countRequest || order.id} descartado com sucesso.`);
    } catch (err) {
      console.error('Erro ao descartar alerta fiscal:', err);
      alert(`Falha ao descartar alerta: ${err.message}`);
    } finally {
      setDiscardingId(null);
    }
  };

  const handleDiscardAll = async () => {
    if (failedOrders.length === 0) return;
    const confirmDiscardAll = window.confirm(
      `Tem certeza que deseja descartar e remover O ALERTA FISCAL DE TODOS os ${failedOrders.length} pedido(s)? Nenhuma dessas notas será re-emitida.`
    );
    if (!confirmDiscardAll) return;

    try {
      setIsDiscardingAll(true);
      const promises = failedOrders.map((order) => {
        const orderRef = doc(db, 'requests', order.id);
        return updateDoc(orderRef, {
          nfceStatus: 'descartado',
          nfceErrorDetail: null,
          sendingNfce: false,
          nfceDiscardedAt: new Date().toISOString()
        });
      });
      await Promise.all(promises);
      alert(`Todos os ${failedOrders.length} alertas fiscais foram descartados.`);
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao descartar todos os alertas fiscais:', err);
      alert(`Falha ao descartar alertas: ${err.message}`);
    } finally {
      setIsDiscardingAll(false);
    }
  };

  const handleResetCircuitBreaker = () => {
    resetFiscalCircuitBreaker();
    setCircuitBreaker({ isTripped: false, reason: null });
    alert("Disjuntor de segurança fiscal re-armado com sucesso!");
  };

  if (!circuitBreaker.isTripped && failedOrders.length === 0) return null;

  return (
    <>
      {/* 1. ALERTA DE EMERGÊNCIA CRÍTICA: Disjuntor Anti-Flood Disparado */}
      {circuitBreaker.isTripped && (
        <div style={{
          backgroundColor: '#8b0000',
          color: '#ffffff',
          padding: '12px 16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10001,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontSize: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⛔</span>
            <span>
              <strong>DISJUNTOR DE EMERGÊNCIA ATIVADO (ANTI-FLOOD):</strong> Emissão automática suspensa por segurança! ({circuitBreaker.reason})
            </span>
          </div>
          <button
            onClick={handleResetCircuitBreaker}
            style={{
              backgroundColor: '#ffc107',
              color: '#000000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔓 Re-armar Trava de Segurança
          </button>
        </div>
      )}

      {/* 2. Banner Superior de Erros Fiscais Pendentes */}
      {failedOrders.length > 0 && !circuitBreaker.isTripped && (
        <div style={{
          backgroundColor: '#dc3545',
          color: '#ffffff',
          padding: '10px 16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 9999,
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          fontSize: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <span>
              <strong>ALERTA FISCAL:</strong> Existe(m) {failedOrders.length} pedido(s) com erro/falha na emissão da NFC-e!
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#dc3545',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Ver Detalhes e Re-emitir ({failedOrders.length})
          </button>
        </div>
      )}

      {/* Modal de Detalhes dos Erros */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            color: '#333333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #eeeeee', paddingBottom: '8px' }}>
              <h2 style={{ margin: 0, color: '#dc3545', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Diagnóstico de Notas Fiscais Pendentes/Com Erro
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666666' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#666666', marginBottom: '16px' }}>
              As notas abaixo falharam durante o envio automático. Nenhuma re-tentativa em loop será feita sem a sua intervenção.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {failedOrders.map((order) => (
                <div key={order.id} style={{
                  border: '1px solid #ffc107',
                  backgroundColor: '#fff9e6',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Pedido #{order.countRequest || order.id} ({order.name || 'Cliente'})</span>
                    <span style={{ color: '#007bff' }}>R$ {parseFloat(order.finalPriceRequest || 0).toFixed(2)}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#555555' }}>
                    <strong>Data/Hora:</strong> {order.dateTime || 'Sem data'}
                  </div>

                  <div style={{ fontSize: '13px', backgroundColor: '#f8d7da', color: '#721c24', padding: '8px', borderRadius: '4px' }}>
                    <strong>Motivo da Falha:</strong> {order.nfceErrorDetail || 'Erro genérico de rede ou transmissão SEFAZ.'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleDiscard(order)}
                      disabled={discardingId === order.id || reemittingId === order.id || isDiscardingAll}
                      style={{
                        backgroundColor: (discardingId === order.id || isDiscardingAll) ? '#6c757d' : '#dc3545',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: (discardingId === order.id || reemittingId === order.id || isDiscardingAll) ? 'not-allowed' : 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {discardingId === order.id ? 'Descartando...' : '🗑️ Descartar e Remover Alerta'}
                    </button>
                    <button
                      onClick={() => handleReemit(order)}
                      disabled={reemittingId === order.id || discardingId === order.id || isDiscardingAll}
                      style={{
                        backgroundColor: (reemittingId === order.id || isDiscardingAll) ? '#6c757d' : '#28a745',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: (reemittingId === order.id || discardingId === order.id || isDiscardingAll) ? 'not-allowed' : 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {reemittingId === order.id ? 'Re-emitindo...' : '🔄 Tentar Re-emitir Agora'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              {failedOrders.length > 1 && (
                <button
                  onClick={handleDiscardAll}
                  disabled={isDiscardingAll || !!reemittingId || !!discardingId}
                  style={{
                    backgroundColor: isDiscardingAll ? '#6c757d' : '#8b0000',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    cursor: (isDiscardingAll || !!reemittingId || !!discardingId) ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  {isDiscardingAll ? 'Descartando Todos...' : `🗑️ Descartar Todos os Alertas (${failedOrders.length})`}
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FiscalAlertBanner;
