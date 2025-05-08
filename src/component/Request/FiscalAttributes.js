import React from 'react';
import { GlobalContext } from '../../GlobalContext';
import Input from '../../component/Input.js';
import '../../assets/styles/FiscalAttributes.css';
import useFormValidation from '../../Hooks/useFormValidation.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { getBtnData } from '../../api/Api.js';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';

const FiscalAttributes = () => {
  const { form, setForm, error, handleChange, handleBlur, clientFinded } =
    useFormValidation({
      name: '',
      phone: '',
      cpf: '',
      birthday: '',
      email: '',
    });
  const [btnValidation, setBtnValidation] = React.useState(false);
  const [taxDocument, setTaxDocument] = React.useState(false);
  const [openpopCancelTax, setOpenpopCancelTax] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);
  const global = React.useContext(GlobalContext);
  const {
    name,
    finalPriceRequest,
    dateTime,
    countRequest,
    request,
    category,
    paymentMethod,
  } = global.userNewRequest;
  const [card, setCard] = React.useState('');

  React.useEffect(() => {
    console.log('Estou no emissor de NFCe     ', global.userNewRequest);
    cpfAndCardFlagValidation();
    const fetchData = async () => {
      const data = await getBtnData('taxDocuments');
      const sortedData = sortByDateIssued(data);
      setTaxDocument(sortedData);
    };
    fetchData();
  }, []);

  /**
   * Ordena um array de documentos fiscais pela data de emissão (mais recentes primeiro)
   * @param {Array} documents - Array de objetos que possuem a propriedade 'date_issued'
   * @returns {Array} - Novo array ordenado
   */
  function sortByDateIssued(documents, keyData) {
    if (!Array.isArray(documents)) return [];

    const parseDate = (str) => {
      if (!str) return new Date(0); // Data muito antiga caso falhe
      const [datePart, timePart] = str.split(' ');
      const [day, month, year] = datePart.split('/');
      return new Date(
        `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`
      );
    };

    return documents.sort((a, b) => {
      const dateA = parseDate(a.date_issued);
      const dateB = parseDate(b.date_issued);
      return dateB - dateA;
    });
  }

  const nfce = {
    data_emissao: '',
    cnpj_emitente: '19337953000178',
    indicador_inscricao_estadual_destinatario: '9',
    cpf_destinatario: form.cpf,
    modalidade_frete: 9,
    local_destino: 1,
    presenca_comprador: 1,
    natureza_operacao: 'VENDA AO CONSUMIDOR',
  };

  const sendNfceToSefaz = async () => {
    nfce.data_emissao = isoDate();
    nfce.items = [];
    nfce.formas_pagamento = [];
    nfce.formas_pagamento.push({
      forma_pagamento: paymentMethodWay(paymentMethod),
      valor_pagamento: finalPriceRequest,
      bandeira_operadora: card,
    });
    for (let i = 0; i < request.length; i++) {
      nfce.items.push({
        numero_item: i + 1,
        codigo_ncm: fillingNcmCode(request[i].category),
        quantidade_comercial: 1.0,
        quantidade_tributavel: 1.0,
        descricao: request[i].name,
        cfop: '5102',
        codigo_produto: request[i].id,
        valor_unitario_tributavel: request[i].finalPrice,
        valor_unitario_comercial: request[i].finalPrice,
        valor_desconto: 0,
        icms_origem: '0',
        icms_situacao_tributaria: '102',
        unidade_comercial: 'un',
        unidade_tributavel: 'un',
        valor_total_tributos: '0.00',
      });
    }

    console.log('Com item alterado    ', nfce);
    const ref = generationUniqueRandomStrig();

    // URL atualizada para o seu servidor
    const url = `http://localhost:4000/api/send-nfce?ref=${ref}`;

    // Transformar nfce em JSON
    // const nfceJson = JSON.stringify(nfce);

    // const payload = {
    //   ref: ref,
    //   nfceData: nfce,
    // };
    const payload = nfce; // <-- aqui, só o conteúdo da NFC-e

    // console.log('Payload enviado:', payload);
    // console.log('URL da requisição:', url);

    console.log('Esse é o payload   ', payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resposta da API CEFAZ:', result);

        await saveToFirestore(result, finalPriceRequest, ref);

        if (result.status === 'autorizado' && result.caminho_danfe) {
          const danfeUrl = `https://api.focusnfe.com.br${result.caminho_danfe}`;

          // Abre o link do DANFE em uma nova aba e dispara o comando de impressão
          const printWindow = window.open(danfeUrl, '_blank');
          printWindow.onload = () => {
            printWindow.print(); // Inicia a impressão assim que a página carrega
          };
        }
      } else {
        console.error('Erro ao enviar NFC-e:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const saveToFirestore = async (result, finalPrice, ref) => {
    try {
      const db = getFirestore(); // Inicializa o Firestore
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}`;
      const resultWithDateAndPrice = {
        ...result,
        date_issued: formattedDate,
        total_value: finalPrice,
        ref: ref,
        active: false,
      };
      const docRef = await addDoc(
        collection(db, 'taxDocuments'),
        resultWithDateAndPrice
      ); // Adiciona o documento à coleção taxDocuments

      console.log('Documento adicionado com ID:', docRef.id);
      const data = await getBtnData('taxDocuments');
      setTaxDocument(data);
    } catch (error) {
      console.error('Erro ao salvar o documento no Firestore:', error);
    }
  };

  const paymentMethodWay = (method) => {
    let op = {
      debit: '04',
      credite: '03',
      vr: '03',
      cash: '01',
      pix: '99',
    };
    return op[method];
  };

  const cpfAndCardFlagValidation = () => {
    const typePayment = paymentMethodWay(paymentMethod);

    if (typePayment === '04' || typePayment === '03') {
      if (card) {
        setBtnValidation(false);
      } else {
        setBtnValidation(true);
        return;
      }
    } else {
      console.log('Não precisa');
      setBtnValidation(false);
    }

    if (error.cpf && form.cpf != '') {
      setBtnValidation(true);
      console.log('Tem erro');
    } else {
      setBtnValidation(false);
      console.log('Não tem erro');
    }
  };
  React.useEffect(() => {
    cpfAndCardFlagValidation();
  }, [card]);

  const handleChanges = (e) => {
    const { value } = e.target;
    setCard(value);
    cpfAndCardFlagValidation();
  };

  const handleConsulta = async () => {
    const ref = '1Jb8Op4U7Wz6afwJe1w3mjNQlqBdkOMAvF'; // Exemplo de referência
    const url = `http://localhost:4000/api/check-nfce/${ref}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resultado da consulta:', result);
        // Aqui você pode adicionar lógica para exibir o resultado na interface
      } else {
        console.error('Erro ao consultar NFC-e:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  // Função para checar todas as NFS-e recebidas de um CNPJ específico
  const handleCheckNfses = async () => {
    const cnpj = '19337953000178'; // Substitua pelo CNPJ específico
    const url = `http://localhost:4000/api/check-nfses/${cnpj}`; // URL do backend

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notas Fiscais Recebidas:', result);
        // Exibir o resultado na interface se necessário
      } else {
        console.error(
          'Erro ao consultar NFS-e recebidas:',
          response.statusText
        );
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  async function cancelarNfce(ref, confirm) {
    if (!confirm) {
      setOpenpopCancelTax(ref); // Defina o item específico para abrir a confirmação
      return;
    }

    if (confirm) {
      setOpenpopCancelTax(null);
      const url = `http://localhost:4000/api/cancel-nfce/${ref.ref}`; // URL do backend
      console.log('Chamando backend com URL:', url);

      const body = {
        justificativa:
          'O cliente desistiu da compra no momento do pagamento por motivos pessoais.', // Justificativa para o cancelamento
      };
      console.log('Enviando corpo da requisição:', body);
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body), // Enviando a justificativa como corpo da requisição
        });
        const data = await response.json(); // Obtendo a resposta da API
        console.log('Resposta do backend:', data);
        if (response.ok) {
          console.log('Cancelamento realizado com sucesso:', data); // Sucesso
          updateCollection(ref);
        } else {
          console.error('Erro ao cancelar NFC-e:', data); // Erro na requisição
        }
      } catch (error) {
        console.error('Erro ao fazer a requisição:', error); // Tratamento de erro
      }
    }
  }

  const updateCollection = async (ref) => {
    const db = getFirestore();
    const docRef = doc(db, 'taxDocuments', ref.id);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          activate: true,
        });
        console.log('Documento atualizado com sucesso.');

        setTaxDocument((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc.ref === ref.ref ? { ...doc, activate: true } : doc
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar o documento no Firestore:', error);
    }
  };

  const fillingNcmCode = (category) => {
    let op = {
      agua: 20011000,
      refrigerante: 22021000,
    };
    if (!op[category]) {
      console.log('outros');
      return '08119000';
    } else {
      console.log(op[category]);
      return op[category];
    }
  };

  const generationUniqueRandomStrig = (length = 34) => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      result += randomChar;
    }

    return result;
  };

  const isoDate = () => {
    return new Date().toISOString();
  };

  //const isoDate = () => {
  //   const now = new Date();
  //   const maxDifference = 5 * 60 * 1000; // 5 minutos em milissegundos
  //   const randomTime = new Date(
  //     now.getTime() - Math.floor(Math.random() * maxDifference)
  //   );
  //   console.log(randomTime);
  //   return randomTime;
  // };

  const onConfirm = (ref, fonfirm) => {
    setConfirm(true);
    cancelarNfce(ref);
  };

  return (
    <div className="fiscal-attributes-container">
      <h1>Aqui começa a emissão de NFCe</h1>
      <div className="input-container">
        <div>
          <label className="form-label"></label>
          <select
            id="card"
            className="form-select custom-select"
            value={card}
            required
            onChange={handleChanges}
          >
            <option value="" disabled hidden>
              Selecione a bandeira do cartão
            </option>
            <option value="01">Master Card</option>
            <option value="02"> Visa</option>
            <option value="03">American Express</option>
            <option value="04">Sorocred</option>
            <option value="05">Outros</option>
          </select>
        </div>
        <div>
          <Input
            id="cpf"
            autoComplete="off"
            placeholder="CPF"
            value={form.cpf}
            type="text"
            onChange={handleChange}
            onBlur={cpfAndCardFlagValidation}
          />
          {error.cpf && <div className="error-form">{error.cpf}</div>}
        </div>
      </div>
      <button
        disabled={btnValidation}
        onClick={sendNfceToSefaz}
        className="btn btn-success"
      >
        Gerar Nota fiscal
      </button>
      {/* <div>
        <button onClick={handleConsulta}>Consultar NFC-e</button>
      </div> */}

      <table>
        <thead>
          <tr>
            <th>Nota</th>
            <th>Data</th>
            <th>valor total</th>
            <th>Imprimir</th>
            <th>Cancelar Nota</th>
          </tr>
        </thead>
        <tbody>
          {taxDocument &&
            taxDocument.map((item, index) => (
              <tr key={index}>
                <td>{item.ref}</td>
                <td>{item.date_issued}</td>
                <td>{item.total_value}</td>
                <td>
                  <a
                    href={`https://api.focusnfe.com.br${item.caminho_danfe}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    nota
                  </a>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setOpenpopCancelTax(item);
                    }}
                    disabled={item.activate}
                  >
                    Cancelar
                  </button>
                  {openpopCancelTax?.ref === item.ref && (
                    <DefaultComumMessage
                      msg="Tem certeza que deseja cancelar essa nota"
                      onClose={() => {
                        setOpenpopCancelTax(null);
                      }}
                      onConfirm={cancelarNfce}
                      item={item}
                    />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
export default FiscalAttributes;
//1Jb8Op4U7Wz6afwJe1w3mjNQlqBdkOMAvF
