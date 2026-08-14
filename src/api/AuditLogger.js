import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../config-firebase/firebase';

/**
 * Registra uma ação realizada no sistema na coleção audit_logs do Firestore.
 * @param {string} action Nome amigável da ação executada (ex: "Editar Estoque", "Finalizar Venda")
 * @param {string|object} details Detalhes adicionais sobre a movimentação
 */
export const logAction = async (action, details = '') => {
  if (!db) {
    console.warn('[AuditLogger] Firestore não inicializado.');
    return;
  }

  try {
    const email = localStorage.getItem('currentUserEmail') || 'Desconhecido';
    const name = localStorage.getItem('currentUserName') || email.split('@')[0];
    const role = localStorage.getItem('currentUserRole') || 'custom';

    const logEntry = {
      timestamp: Timestamp.now(),
      email,
      name,
      role,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
    };

    await addDoc(collection(db, 'audit_logs'), logEntry);
    console.log(`[AuditLogger] Ação "${action}" registrada por ${name} (${role}).`);
  } catch (error) {
    console.error('[AuditLogger] Erro ao gravar log de auditoria:', error);
  }
};
