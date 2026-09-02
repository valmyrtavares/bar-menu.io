import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { addDoc, updateDoc } from '../api/FirestoreInterceptor';
import { db } from '../config-firebase/firebase';

const isoDate = () => {
  return new Date().toISOString();
};

const generationUniqueRandomString = (length = 34) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomChar = characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
    result += randomChar;
  }
  return result;
};

const fillingNcmCode = (category) => {
  let op = {
    agua: 20011000,
    refrigerante: 22021000,
  };
  if (!op[category]) {
    return '08119000';
  } else {
    return op[category];
  }
};

export const paymentMethodWay = (method) => {
  let op = {
    DEBIT: '04',
    CREDIT: '03',
    PIX: '17', // Atualizado de 99 para 17 (PIX Dinamico) conforme SEFAZ
    CASH: '01',
    // Fallback for old cases or different naming
    debit: '04',
    credite: '03',
    vr: '11', // Atualizado de 03 para 11 (Vale Refeicao) conforme SEFAZ
    cash: '01',
    pix: '17', // Atualizado de 99 para 17 (PIX Dinamico) conforme SEFAZ
  };
  return op[method] || '99';
};

const saveToFirestore = async (result, finalPrice, ref) => {
  try {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(
      2,
      '0',
    )}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(
      currentDate.getHours(),
    ).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

    const resultWithDateAndPrice = {
      ...result,
      date_issued: formattedDate,
      timestamp: currentDate.getTime(),
      total_value: finalPrice,
      ref: ref,
      active: false,
    };

    // Prevenção de duplicidade: se já existir documento com essa ref em taxDocuments, atualiza em vez de duplicar
    const taxQuery = query(collection(db, 'taxDocuments'), where('ref', '==', ref));
    const querySnap = await getDocs(taxQuery);

    if (querySnap && !querySnap.empty && querySnap.docs && querySnap.docs.length > 0) {
      const existingDoc = querySnap.docs[0];
      await updateDoc(doc(db, 'taxDocuments', existingDoc.id), resultWithDateAndPrice);
      console.log('NFC-e atualizada no Firestore para ref:', ref);
      return existingDoc.id;
    }

    const docRef = await addDoc(
      collection(db, 'taxDocuments'),
      resultWithDateAndPrice,
    );

    console.log('NFC-e salva no Firestore com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar NFC-e no Firestore:', error);
    throw error;
  }
};

// Disjuntor de Emergência Anti-Flood em nível de sistema
if (typeof window !== 'undefined') {
  window.fiscalCircuitBreaker = window.fiscalCircuitBreaker || {
    timestamps: [],
    isTripped: false,
    reason: null,
  };
} else if (typeof global !== 'undefined') {
  global.fiscalCircuitBreaker = global.fiscalCircuitBreaker || {
    timestamps: [],
    isTripped: false,
    reason: null,
  };
}

// Mapa de requisições ativas em memória JS para dedup de in-flight requests
const inFlightEmissions = new Map();

export const getCircuitBreakerState = () => {
  if (typeof window !== 'undefined' && window.fiscalCircuitBreaker) return window.fiscalCircuitBreaker;
  if (typeof global !== 'undefined' && global.fiscalCircuitBreaker) return global.fiscalCircuitBreaker;
  return { timestamps: [], isTripped: false, reason: null };
};

export const resetFiscalCircuitBreaker = () => {
  const state = getCircuitBreakerState();
  state.timestamps = [];
  state.isTripped = false;
  state.reason = null;
  inFlightEmissions.clear();
};

/**
 * Emite NFC-e automaticamente para um pedido com travas de segurança máximas anti-duplicidade e anti-flood
 * @param {Object} order - Objeto do pedido (do Firestore)
 */
export const issueAutoNfce = async (order) => {
  // Trava de Isolamento de Marca / Multi-tenant
  const currentProjectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
  const isTestEnv = process.env.NODE_ENV === 'test';
  const fiscalCnpj = (process.env.REACT_APP_FISCAL_CNPJ || (currentProjectId === 'react-bar-67f33' ? '19337953000178' : '')).replace(/\D/g, '');
  const crtCode = parseInt(process.env.REACT_APP_FISCAL_CRT || '1', 10);

  if (!fiscalCnpj && !isTestEnv) {
    console.warn(`[FISCAL GUARD] Emissão de NFC-e desativada para o projeto '${currentProjectId}'. Nenhuma configuração fiscal (REACT_APP_FISCAL_CNPJ) encontrada.`);
    return { status: 'ignorado', reason: 'Emissão fiscal desativada para esta marca/instância' };
  }

  const cleanName = (order.name || 'CLIENTE').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-').substring(0, 15).toUpperCase();
  const orderId = order.countRequest || order.id || 'SN';
  const ref = order.nfceRef || `REQ--${orderId}--${cleanName}`;
  const lockKey = order.id || ref;

  // 0. DEDUPLICAÇÃO DE REQUISIÇÃO EM ANDAMENTO (IN-FLIGHT LOCK):
  if (inFlightEmissions.has(lockKey)) {
    console.warn(`[IN-FLIGHT GUARD] Emissão para pedido ${orderId} (${lockKey}) já está em andamento. Aguardando promessa existente.`);
    return inFlightEmissions.get(lockKey);
  }

  const runEmissao = async () => {
    // 1. DISJUNTOR DE EMERGÊNCIA ANTI-FLOOD: Se disparou mais de 5 vezes em 60 segundos, bloqueia tudo
    const cbState = getCircuitBreakerState();
    if (cbState.isTripped) {
      const errorMsg = `⛔ BLOQUEIO DE EMERGÊNCIA ANTI-FLOOD: ${cbState.reason}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const now = Date.now();
    cbState.timestamps = (cbState.timestamps || []).filter(t => now - t < 60000);
    if (cbState.timestamps.length >= 5) {
      cbState.isTripped = true;
      cbState.reason = `Disparo em massa bloqueado: ${cbState.timestamps.length + 1} emissões tentadas em menos de 60 segundos!`;
      const errorMsg = `⛔ DISJUNTOR DE EMERGÊNCIA DISPARADO: ${cbState.reason}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    cbState.timestamps.push(now);

    // 2. PRE-FLIGHT GUARD DE DUPLICIDADE: Consulta taxDocuments ANTES de tocar qualquer API externa
    try {
      const checkQuery = query(collection(db, 'taxDocuments'), where('ref', '==', ref));
      const checkSnap = await getDocs(checkQuery);
      if (checkSnap && !checkSnap.empty && checkSnap.docs.length > 0) {
        const existingDocData = checkSnap.docs[0].data();
        if (existingDocData.status === 'autorizado' || existingDocData.caminho_danfe) {
          console.warn(`[PRE-FLIGHT GUARD] Pedido ${orderId} já possui nota AUTORIZADA (${existingDocData.numero || 'N/A'}). Abortando chamada para API.`);
          return { ...existingDocData, ref, duplicateBlocked: true };
        }
      }
    } catch (checkErr) {
      console.warn('[PRE-FLIGHT GUARD] Aviso ao verificar duplicidade pre-flight:', checkErr);
    }

  const cleanCpf = order.cpfForInvoice ? String(order.cpfForInvoice).replace(/\D/g, '') : '';
  const nfce = {
    data_emissao: isoDate(),
    cnpj_emitente: fiscalCnpj || '19337953000178',
    regime_tributario_emitente: crtCode, // 1: Simples Nacional (Evita Rejeição 1115 de IBS/CBS)
    codigo_regime_tributario: crtCode,   // Fallback
    crt: crtCode,                        // Fallback
    indicador_inscricao_estadual_destinatario: '9',
    modalidade_frete: 9,
    local_destino: 1,
    presenca_comprador: 1,
    natureza_operacao: 'VENDA AO CONSUMIDOR',
    items: [],
    formas_pagamento: [],
  };

  if (cleanCpf && cleanCpf.length === 11) {
    nfce.cpf_destinatario = cleanCpf;
  }

  // Mapeia formas de pagamento usando paymentDetails se disponível
  const paymentMethod = order.paymentMethod;
  const paymentDetails = order.paymentDetails;
  const pgWay = paymentMethodWay(paymentMethod);

  const pg = {
    indicador_pagamento: '0', // 0: Pagamento à Vista
    forma_pagamento: pgWay,
    valor_pagamento: parseFloat(order.finalPriceRequest || 0),
  };

  // Se for cartão de crédito ou débito, envia a bandeira e tipo de integração (2: Não Integrado / POS)
  if (pgWay === '03' || pgWay === '04') {
    pg.bandeira_operadora = (paymentDetails && paymentDetails.cardBrandCode) || '99';
    pg.tipo_integracao = 2; // 2: Pagamento não integrado (POS autônomo / maquininha manual) conforme SEFAZ
  }

  nfce.formas_pagamento.push(pg);

  // Itens do pedido
  if (order.request && Array.isArray(order.request) && order.request.length > 0) {
    const totalPayment = parseFloat(order.finalPriceRequest || 0);
    const totalItemsSum = order.request.reduce((acc, item) => acc + parseFloat(item.finalPrice || 0), 0);

    let adjustedItems = [];
    if (totalItemsSum > 0 && totalPayment > 0 && Math.abs(totalItemsSum - totalPayment) > 0.005) {
      // Distribui o valor total do pagamento proporcionalmente entre os itens
      let accumulatedSum = 0;
      
      order.request.forEach((item, index) => {
        const originalPrice = parseFloat(item.finalPrice || 0);
        let adjustedPrice;
        
        if (index === order.request.length - 1) {
          // Último item absorve qualquer diferença de arredondamento de centavos
          adjustedPrice = parseFloat((totalPayment - accumulatedSum).toFixed(2));
        } else {
          // Calcula a proporção e arredonda para 2 casas decimais
          adjustedPrice = parseFloat((originalPrice * (totalPayment / totalItemsSum)).toFixed(2));
          accumulatedSum += adjustedPrice;
        }
        
        // Evita que o preço ajustado seja menor ou igual a zero (caso do último item ou arredondamento estranho)
        if (adjustedPrice <= 0) {
          adjustedPrice = 0.01;
        }
        
        adjustedItems.push({
          ...item,
          finalPrice: adjustedPrice
        });
      });
      
      // Ajuste final secundário de segurança para garantir que a soma dos itens seja exatamente igual a totalPayment
      const newSum = adjustedItems.reduce((acc, item) => acc + item.finalPrice, 0);
      if (Math.abs(newSum - totalPayment) > 0.005 && adjustedItems.length > 0) {
        const diff = parseFloat((totalPayment - newSum).toFixed(2));
        // Adiciona a diferença ao último item
        adjustedItems[adjustedItems.length - 1].finalPrice = parseFloat((adjustedItems[adjustedItems.length - 1].finalPrice + diff).toFixed(2));
      }
    } else {
      // Sem alteração (ou valores zerados/iguais)
      adjustedItems = order.request.map(item => ({
        ...item,
        finalPrice: parseFloat(item.finalPrice || 0)
      }));
    }

    const safeRound = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    adjustedItems.forEach((item, index) => {
      const itemPrice = parseFloat(item.finalPrice || 0);
      const vIbsVal = safeRound(itemPrice * 0.001);
      const vCbsVal = safeRound(itemPrice * 0.009);

      nfce.items.push({
        numero_item: index + 1,
        codigo_ncm: fillingNcmCode(item.category),
        quantidade_comercial: 1.0,
        quantidade_tributavel: 1.0,
        descricao: item.name,
        cfop: '5102',
        codigo_produto: item.id || generationUniqueRandomString(8),
        valor_unitario_tributavel: itemPrice,
        valor_unitario_comercial: itemPrice,
        valor_desconto: 0,
        icms_origem: '0',
        icms_situacao_tributaria: '102',
        unidade_comercial: 'un',
        unidade_tributavel: 'un',
        valor_total_tributos: '0.00',
        ibs_cbs_situacao_tributaria: '000',
        ibs_cbs_classificacao_tributaria: '000001',
        ibs_cbs_base_calculo: itemPrice,
        cbs_aliquota: '0.9',
        cbs_valor: vCbsVal,
        ibs_uf_aliquota: '0.1',
        ibs_uf_valor: vIbsVal,
        ibs_mun_aliquota: '0',
        ibs_mun_valor: 0,
        ibs_valor_total: vIbsVal,
      });
    });
  } else {
    // Fallback para pedidos sem lista de itens (ex: cobrança direta ou consumo avulso)
    const fallbackPrice = parseFloat(order.finalPriceRequest || 0);
    const itemPrice = fallbackPrice > 0 ? fallbackPrice : 1.0;
    const safeRound = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    const vIbsVal = safeRound(itemPrice * 0.001);
    const vCbsVal = safeRound(itemPrice * 0.009);

    nfce.items.push({
      numero_item: 1,
      codigo_ncm: '08119000',
      quantidade_comercial: 1.0,
      quantidade_tributavel: 1.0,
      descricao: `CONSUMO / PEDIDO #${order.countRequest || 'SN'}`,
      cfop: '5102',
      codigo_produto: generationUniqueRandomString(8),
      valor_unitario_tributavel: itemPrice,
      valor_unitario_comercial: itemPrice,
      valor_desconto: 0,
      icms_origem: '0',
      icms_situacao_tributaria: '102',
      unidade_comercial: 'un',
      unidade_tributavel: 'un',
      valor_total_tributos: '0.00',
      ibs_cbs_situacao_tributaria: '000',
      ibs_cbs_classificacao_tributaria: '000001',
      ibs_cbs_base_calculo: itemPrice,
      cbs_aliquota: '0.9',
      cbs_valor: vCbsVal,
      ibs_uf_aliquota: '0.1',
      ibs_uf_valor: vIbsVal,
      ibs_mun_aliquota: '0',
      ibs_mun_valor: 0,
      ibs_valor_total: vIbsVal,
    });
  }

  // Calcular totais IBS/CBS de forma segura e anexar ao root da nfce
  let totalIbsCbsBase = 0;
  let totalCbsVal = 0;
  let totalIbsUfVal = 0;

  nfce.items.forEach(item => {
    totalIbsCbsBase += item.ibs_cbs_base_calculo || 0;
    totalCbsVal += item.cbs_valor || 0;
    totalIbsUfVal += item.ibs_valor_total || 0;
  });

  nfce.ibs_cbs_base_calculo = parseFloat(totalIbsCbsBase.toFixed(2));
  nfce.cbs_valor_total = parseFloat(totalCbsVal.toFixed(2));
  nfce.ibs_uf_valor_total = parseFloat(totalIbsUfVal.toFixed(2));
  nfce.ibs_valor_total = parseFloat(totalIbsUfVal.toFixed(2));
  nfce.ibs_cbs_is_valor_total = parseFloat((totalCbsVal + totalIbsUfVal).toFixed(2));

  // URL do backend (ajustar se necessário para produção)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://focusrender.onrender.com';
  const url = `${backendUrl}/api/send-nfce?ref=${ref}`;
  const focusToken = process.env.REACT_APP_FISCAL_TOKEN;
  const focusEnvironment = process.env.REACT_APP_FISCAL_ENVIRONMENT || 'homologacao';

  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  if (focusToken) {
    requestHeaders['Authorization'] = `Bearer ${focusToken}`;
  }

  const requestPayload = {
    ref,
    nfceData: nfce,
    token: focusToken,
    environment: focusEnvironment,
  };

  console.log(`[FISCAL API REQUEST] Enviando NFC-e para ref=${ref}. Payload completo:`, JSON.stringify(requestPayload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestPayload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Resposta NFC-e:', result);

      // Salva no Firestore se for autorizado ou se for erro/rejeitado retornado pela API
      await saveToFirestore(result, order.finalPriceRequest, ref);
      return { ...result, ref };
    } else {
      const errorBody = await response.text().catch(() => '');
      console.error(`[FISCAL API ERROR] HTTP Status: ${response.status} ${response.statusText}. Resposta do servidor:`, errorBody);
      console.error(`[FISCAL API ERROR PAYLOAD] Payload rejeitado para ref=${ref}:`, JSON.stringify({ ref, nfceData: nfce }));
      
      const errResult = {
        status: 'erro',
        mensagem_sefaz: `Erro na rede ou Focus API: ${response.statusText}. Detalhes: ${errorBody.substring(0, 150)}`,
      };
      try {
        await saveToFirestore(errResult, order.finalPriceRequest, ref);
      } catch (saveErr) {
        console.error('Erro ao salvar erro fiscal no Firestore:', saveErr);
      }
      throw new Error(`Erro na rede: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`[FISCAL EXCEPTION] Erro na emissão automática para ref=${ref}:`, error);
    console.error(`[FISCAL EXCEPTION PAYLOAD] Payload da falha para ref=${ref}:`, JSON.stringify({ ref, nfceData: nfce }));
    
    if (!error.message || !error.message.startsWith('Erro na rede:')) {
      const errResult = {
        status: 'erro',
        mensagem_sefaz: error.message || 'Erro de rede ou conexão com o servidor',
      };
      try {
        await saveToFirestore(errResult, order.finalPriceRequest, ref);
      } catch (saveErr) {
        console.error('Erro ao salvar erro de exceção fiscal no Firestore:', saveErr);
      }
    }
    throw error;
  }
  };

  const executionPromise = runEmissao();
  inFlightEmissions.set(lockKey, executionPromise);

  try {
    const res = await executionPromise;
    return res;
  } finally {
    inFlightEmissions.delete(lockKey);
  }
};
