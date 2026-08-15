import {
  addDoc as originalAddDoc,
  setDoc as originalSetDoc,
  updateDoc as originalUpdateDoc,
  deleteDoc as originalDeleteDoc
} from 'firebase/firestore';
import { logAction } from './AuditLogger';

const collectionTranslations = {
  'user': 'Clientes',
  'requests': 'Pedidos/Vendas',
  'outgoing': 'Despesas',
  'stock': 'Estoque',
  'dailyStockSnapshot': 'Fechamento Diário de Estoque',
  'sideDishes': 'Acompanhamentos',
  'item': 'Pratos',
  'button': 'Categorias',
  'PictureMode': 'Configuração Visual',
  'taxDocuments': 'Notas Fiscais',
  'recipes': 'Receitas',
  'supplies': 'Insumos',
  'admins': 'Administradores',
  'audit_logs': 'Logs de Auditoria',
  'promotions': 'Promoções'
};

const recentLogs = {};
const DEBOUNCE_TIME_MS = 2000;

/**
 * Traduz o nome da coleção para PT-BR
 */
const translateCollection = (collName) => {
  return collectionTranslations[collName] || collName;
};

/**
 * Traduz os dados do objeto modificado em uma frase humana curta.
 */
const summarizeData = (actionVerb, collNameTranslated, data) => {
  if (!data) return `${actionVerb} um registro na área de ${collNameTranslated}.`;
  
  // Farejador de Identidade Avançado
  const identifier = data.name || data.title || data.nome || data.titulo || data.descricao || 
                     data.productName || data.product || data.expenseName || data.supplierName || 
                     data.clientName || data.customerName || data.categoryName || data.ItemName || data.itemName;

  if (identifier) {
    return `${actionVerb} '${identifier}' na área de ${collNameTranslated}.`;
  }
  
  // Se não achou um nome humano legível (ex: atualizou apenas {quantidade: 5}), 
  // ignora IDs encriptados para manter o log limpo.
  return `${actionVerb} um registro na área de ${collNameTranslated}.`;
};

/**
 * Extrai o nome real da coleção.
 */
const extractCollectionName = (ref) => {
  if (!ref) return 'desconhecida';
  if (ref.parent && ref.parent.path) {
    return ref.parent.path.split('/')[0] || ref.path.split('/')[0];
  }
  if (ref.path) {
    return ref.path.split('/')[0];
  }
  return 'desconhecida';
};

/**
 * Escudo Anti-Flood: Evita gravar dezenas de logs repetidos no mesmo segundo.
 */
const shouldLog = (actionVerb, collName) => {
  const cacheKey = `${actionVerb}_${collName}`;
  const now = Date.now();
  if (recentLogs[cacheKey] && (now - recentLogs[cacheKey] < DEBOUNCE_TIME_MS)) {
    // É uma operação em massa (mesma ação na mesma coleção em < 2 segundos)
    return false;
  }
  recentLogs[cacheKey] = now;
  return true;
};

const processAuditLog = async (actionVerb, ref, data = null) => {
  const collName = extractCollectionName(ref);
  
  // Exceções
  if (collName === 'audit_logs' || collName === 'admins') return;
  
  if (!shouldLog(actionVerb, collName)) return;

  const collNameTranslated = translateCollection(collName);
  const summary = summarizeData(actionVerb, collNameTranslated, data);
  
  await logAction(summary, '').catch(console.error);
};

export const addDoc = async (collRef, data) => {
  await processAuditLog('Criou', collRef, data);
  return originalAddDoc(collRef, data);
};

export const setDoc = async (docRef, data, options) => {
  const verb = (options && options.merge) ? 'Atualizou' : 'Definiu';
  await processAuditLog(verb, docRef, data);
  return originalSetDoc(docRef, data, options);
};

export const updateDoc = async (docRef, data) => {
  await processAuditLog('Atualizou', docRef, data);
  return originalUpdateDoc(docRef, data);
};

export const deleteDoc = async (docRef) => {
  await processAuditLog('Excluiu', docRef, null);
  return originalDeleteDoc(docRef);
};
