import {
  collection,
  addDoc,
} from 'firebase/firestore';
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
      total_value: finalPrice,
      ref: ref,
      active: false,
    };

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

/**
 * Emite NFC-e automaticamente para um pedido
 * @param {Object} order - Objeto do pedido (do Firestore)
 */
export const issueAutoNfce = async (order) => {
  const nfce = {
    data_emissao: isoDate(),
    cnpj_emitente: '19337953000178',
    indicador_inscricao_estadual_destinatario: '9',
    cpf_destinatario: order.cpfForInvoice
      ? order.cpfForInvoice.replace(/\D/g, '')
      : '',
    modalidade_frete: 9,
    local_destino: 1,
    presenca_comprador: 1,
    natureza_operacao: 'VENDA AO CONSUMIDOR',
    items: [],
    formas_pagamento: [],
  };

  // Mapeia formas de pagamento usando paymentDetails se disponível
  const paymentMethod = order.paymentMethod;
  const paymentDetails = order.paymentDetails;
  const pgWay = paymentMethodWay(paymentMethod);

  const pg = {
    indicador_pagamento: '0', // 0: Pagamento à Vista
    forma_pagamento: pgWay,
    valor_pagamento: parseFloat(order.finalPriceRequest || 0),
  };

  // Se for cartão de crédito ou débito, envia a bandeira. Se não houver, usa '99' (Outros) como fallback.
  if (pgWay === '03' || pgWay === '04') {
    pg.bandeira_operadora = (paymentDetails && paymentDetails.cardBrandCode) || '99';
  }

  nfce.formas_pagamento.push(pg);

  // Itens do pedido
  if (order.request && Array.isArray(order.request)) {
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

    adjustedItems.forEach((item, index) => {
      nfce.items.push({
        numero_item: index + 1,
        codigo_ncm: fillingNcmCode(item.category),
        quantidade_comercial: 1.0,
        quantidade_tributavel: 1.0,
        descricao: item.name,
        cfop: '5102',
        codigo_produto: item.id || generationUniqueRandomString(8),
        valor_unitario_tributavel: item.finalPrice,
        valor_unitario_comercial: item.finalPrice,
        valor_desconto: 0,
        icms_origem: '0',
        icms_situacao_tributaria: '102',
        unidade_comercial: 'un',
        unidade_tributavel: 'un',
        valor_total_tributos: '0.00',
      });
    });
  }

  const cleanName = (order.name || 'CLIENTE').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '-').substring(0, 15).toUpperCase();
  const orderId = order.countRequest || 'SN';
  const uniquePart = generationUniqueRandomString(8);
  const ref = `REQ--${orderId}--${cleanName}--${uniquePart}`;
  // URL do backend (ajustar se necessário para produção)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://focusrender.onrender.com';
  const url = `${backendUrl}/api/send-nfce?ref=${ref}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref, nfceData: nfce }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Resposta NFC-e:', result);

      // Salva no Firestore se for autorizado ou se for erro/rejeitado retornado pela API
      await saveToFirestore(result, order.finalPriceRequest, ref);

      // Retorna o resultado + ref para que o chamador (triggerFiscal) faça o updateDoc
      // IMPORTANTE: NÃO fazemos updateDoc aqui para evitar onSnapshot intermediário
      // que causava race condition e notas duplicadas.
      return { ...result, ref };
    } else {
      console.error('Erro ao enviar NFC-e:', response.statusText);
      const errResult = {
        status: 'erro',
        mensagem_sefaz: `Erro na rede ou Focus API: ${response.statusText}`,
      };
      try {
        await saveToFirestore(errResult, order.finalPriceRequest, ref);
      } catch (saveErr) {
        console.error('Erro ao salvar erro fiscal no Firestore:', saveErr);
      }
      throw new Error(`Erro na rede: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro na emissão automática de NFC-e:', error);
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
