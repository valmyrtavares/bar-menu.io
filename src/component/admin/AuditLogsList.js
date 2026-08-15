import React from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, where, Timestamp } from 'firebase/firestore';
import { deleteDoc } from '../../api/FirestoreInterceptor';
import { db } from '../../config-firebase/firebase';
import styles from './AuditLogsList.module.scss';

export default function AuditLogsList() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  // Controle de Paginação
  const [pageSize] = React.useState(90);
  const [page, setPage] = React.useState(1);
  const [cursors, setCursors] = React.useState([null]); // Guarda o document cursor de início de cada página
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [cleanupMessage, setCleanupMessage] = React.useState('');

  // Limpeza automática de logs antigos (mais de 60 dias) ao abrir a tela
  React.useEffect(() => {
    if (!db) return;
    const runOldLogsCleanup = async () => {
      try {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const cutoffTimestamp = Timestamp.fromDate(sixtyDaysAgo);

        const q = query(
          collection(db, 'audit_logs'),
          where('timestamp', '<', cutoffTimestamp)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const deletePromises = [];
          snapshot.forEach((document) => {
            deletePromises.push(deleteDoc(doc(db, 'audit_logs', document.id)));
          });
          await Promise.all(deletePromises);
          setCleanupMessage(`Limpeza concluída: ${snapshot.size} logs antigos deletados.`);
          console.log(`[RBAC] Limpeza automática: deletados ${snapshot.size} logs anteriores a ${sixtyDaysAgo.toLocaleDateString()}`);
        } else {
          setCleanupMessage('Banco de logs otimizado (nenhum log com mais de 60 dias encontrado).');
        }
      } catch (err) {
        console.error('[RBAC] Falha na limpeza automática de logs antigos:', err);
      }
    };

    runOldLogsCleanup();
  }, []);

  const fetchLogs = async (pageIndex, currentCursors) => {
    if (!db) return;
    try {
      setLoading(true);
      const cursor = currentCursors[pageIndex - 1]; // cursor da página anterior para startAfter

      // Consulta de 91 itens para saber se existe um próximo item (indicando próxima página)
      let q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc')
      );

      if (cursor) {
        q = query(q, startAfter(cursor));
      }

      q = query(q, limit(pageSize + 1));

      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      // Se retornou size > pageSize, quer dizer que há uma próxima página
      if (items.length > pageSize) {
        setHasNextPage(true);
        items.pop(); // Remove o 91º elemento que usamos apenas para a verificação
      } else {
        setHasNextPage(false);
      }

      // Se temos itens, guarda o último item da página atual como cursor para a próxima página
      if (items.length > 0) {
        const lastDoc = snapshot.docs[items.length - 1];
        setCursors(prev => {
          const next = [...prev];
          next[pageIndex] = lastDoc; // salva para a página index
          return next;
        });
      }

      setLogs(items);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs(page, cursors);
  }, [page]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '-';
    let date = null;
    if (typeof ts.toDate === 'function') {
      date = ts.toDate();
    } else if (ts.seconds) {
      date = new Date(ts.seconds * 1000);
    } else {
      date = new Date(ts);
    }

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetails = (details) => {
    if (!details) return '';
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return details;
      }
    }
    return JSON.stringify(details, null, 2);
  };

  if (loading && page === 1 && logs.length === 0) {
    return <div className={styles.centered}>Carregando histórico de logs...</div>;
  }

  return (
    <div className={styles.container}>
      <Link to="/admin/admin" className={styles.btnBack} title="Sair do Módulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <div className={styles.titleContainer}>
        <div>
          <h2 className={styles.title}>Histórico de Movimentações</h2>
          <p className={styles.subtitle}>Abaixo estão registrados todos os eventos ocorridos no sistema nos últimos 60 dias.</p>
        </div>
        {cleanupMessage && (
          <span className={styles.cleanupStatus}>
            🧹 {cleanupMessage}
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <div className={styles.noLogs}>Nenhum registro de log encontrado.</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data e Hora</th>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Ação</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.timestamp}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{log.name || 'Desconhecido'}</span>
                      <span className={styles.userEmail}>{log.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${log.role === 'admin_TOTAL' ? styles.badgeTotal : styles.badgeCustom}`}>
                      {log.role === 'admin_TOTAL' ? 'Super Admin' : 'Comum'}
                    </span>
                  </td>
                  <td className={styles.action}>
                    {log.action}
                  </td>
                  <td>
                    {log.details && (
                      <pre className={styles.details}>
                        {formatDetails(log.details)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
            >
              ← Anterior
            </button>
            <span className={styles.pageNumber}>
              Página {page}
            </span>
            <button
              className={styles.paginationBtn}
              onClick={handleNextPage}
              disabled={!hasNextPage || loading}
            >
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
