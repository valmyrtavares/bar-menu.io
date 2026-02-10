import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
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

const paymentMethodWay = (method) => {
  let op = {
    DEBIT: '04',
    CREDIT: '03',
    PIX: '99',
    CASH: '01',
    // Fallback for old cases or different naming
    debit: '04',
    credite: '03',
    vr: '03',
    cash: '01',
    pix: '99',
  };
  return op[method] || '99';
};

const saveToFirestore = async (result, finalPrice, ref) => {
  try {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(
      2,
      '0'
    )}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(
      2,
      '0'
    )}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

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

  nfce.formas_pagamento.push({
    forma_pagamento: paymentMethodWay(paymentMethod),
    valor_pagamento: order.finalPriceRequest,
    bandeira_operadora: paymentDetails ? paymentDetails.cardBrandCode : '',
  });

  // Itens do pedido
  if (order.request && Array.isArray(order.request)) {
    order.request.forEach((item, index) => {
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

  const ref = generationUniqueRandomString();
  // URL do backend (ajustar se necessário para produção)
  const url = `http://localhost:4000/api/send-nfce?ref=${ref}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nfce),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Resposta NFC-e:', result);

      await saveToFirestore(result, order.finalPriceRequest, ref);

      // Atualiza o pedido original para marcar que a nota foi emitida
      const orderRef = doc(db, 'requests', order.id);
      await updateDoc(orderRef, {
        nfceIssued: true,
        nfceRef: ref,
        nfceStatus: result.status,
        caminho_danfe: result.caminho_danfe,
      });

      return result;
    } else {
      console.error('Erro ao enviar NFC-e:', response.statusText);
      throw new Error(`Erro na rede: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro na emissão automática de NFC-e:', error);
    throw error;
  }
};
