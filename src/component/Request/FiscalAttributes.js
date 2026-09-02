import React from 'react';
import { GlobalContext } from '../../GlobalContext';
import Input from '../Input.js';
import '../../assets/styles/FiscalAttributes.css';
import useFormValidation from '../../Hooks/useFormValidation.js';
import { getFirestore, collection, query, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { addDoc, updateDoc, setDoc, deleteDoc } from '../../api/FirestoreInterceptor';
import { db } from '../../config-firebase/firebase.js';
import { getBtnData, getPaginatedData } from '../../api/Api.js';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
import { issueAutoNfce, paymentMethodWay } from '../../services/fiscalService';

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
  const [firstDoc, setFirstDoc] = React.useState(null);
  const [lastDoc, setLastDoc] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const PAGE_SIZE = 40;

  const fetchTaxDocuments = async (cursorDoc = null, direction = 'init') => {
    try {
      setLoading(true);
      const response = await getPaginatedData(
        'taxDocuments',
        'timestamp',
        'desc',
        PAGE_SIZE,
        cursorDoc,
        direction
      );
      const sortedData = sortByDateIssued(response.data);
      setTaxDocument(sortedData);
      setFirstDoc(response.firstVisible);
      setLastDoc(response.lastVisible);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais paginadas:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('Estou no emissor de NFCe     ', global.userNewRequest);
    cpfAndCardFlagValidation();
    fetchTaxDocuments(null, 'init');
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
      const parts = str.split(' ');
      if (parts.length < 2) return new Date(0);

      const [datePart, timePart] = parts;
      const dateComponents = datePart.split('/');

      if (dateComponents.length < 3) return new Date(0);

      const [day, month, year] = dateComponents;

      // Ensure padding for components to handle legacy data
      const pad = (s) => (s ? s.padStart(2, '0') : '00');

      const isoString = `${year}-${pad(month)}-${pad(day)}T${timePart}`;
      const date = new Date(isoString);

      return isNaN(date.getTime()) ? new Date(0) : date;
    };

    return documents.sort((a, b) => {
      const dateA = parseDate(a.date_issued);
      const dateB = parseDate(b.date_issued);
      return dateB - dateA;
    });
  }

  const currentCnpj = (process.env.REACT_APP_FISCAL_CNPJ || '19337953000178').replace(/\D/g, '');

  const nfce = {
    data_emissao: '',
    cnpj_emitente: currentCnpj,
    indicador_inscricao_estadual_destinatario: '9',
    cpf_destinatario: form.cpf,
    modalidade_frete: 9,
    local_destino: 1,
    presenca_comprador: 1,
    natureza_operacao: 'VENDA AO CONSUMIDOR',
  };

  const sendNfceToSefaz = async () => {
    // Agora usamos o serviço centralizado
    // Criamos um objeto de pedido compatível com o serviço
    const manualOrder = {
      ...global.userNewRequest,
      cpfForInvoice: form.cpf,
      paymentMethod: paymentMethod, // Usa o que está no global
      // Se for cartão, passamos a bandeira selecionada manualmente no paymentDetails
      paymentDetails:
        paymentMethod === 'CREDIT' || paymentMethod === 'DEBIT'
          ? {
              cardBrandCode: card,
            }
          : null,
    };

    try {
      console.log('Iniciando emissão manual de NFC-e...', manualOrder);
      const result = await issueAutoNfce(manualOrder);

      if (result.status === 'autorizado' && result.caminho_danfe) {
        // Abre o PDF para visualização
        const danfeUrl = `https://api.focusnfe.com.br${result.caminho_danfe}`;
        window.open(danfeUrl, '_blank');
      }

      // Atualiza lista local de notas
      setPageNumber(1);
      await fetchTaxDocuments(null, 'init');
    } catch (error) {
      console.error('Erro na emissão manual:', error);
      alert('Erro ao emitir nota fiscal. Verifique os logs.');
    }
  };

  const handleCleanupRejectedDocs = async () => {
    const confirmCleanup = window.confirm("Deseja deletar todas as notas fiscais rejeitadas (com erro ou sem PDF) da coleção taxDocuments? Isso liberará espaço e otimizará as leituras.");
    if (!confirmCleanup) return;
    
    try {
      setBtnValidation(true);
      const qSnap = await getDocs(collection(db, 'taxDocuments'));
      let deleteCount = 0;
      
      for (const docSnap of qSnap.docs) {
        const data = docSnap.data();
        if (!data.caminho_danfe || data.status !== 'autorizado') {
          const docRef = doc(db, 'taxDocuments', docSnap.id);
          await deleteDoc(docRef);
          deleteCount++;
        }
      }
      alert(`Limpeza concluída com sucesso! ${deleteCount} documentos rejeitados/inúteis foram removidos.`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erro ao realizar limpeza: " + e.message);
    } finally {
      setBtnValidation(false);
    }
  };

  const saveToFirestore = async (result, finalPrice, ref) => {
    try {
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
      const resultWithDateAndPrice = {
        ...result,
        date_issued: formattedDate,
        timestamp: currentDate.getTime(),
        total_value: finalPrice,
        ref: ref,
        active: false,
      };

      const taxQuery = query(collection(db, 'taxDocuments'), where('ref', '==', ref));
      const querySnap = await getDocs(taxQuery);

      if (querySnap && !querySnap.empty && querySnap.docs && querySnap.docs.length > 0) {
        const existingDoc = querySnap.docs[0];
        await updateDoc(doc(db, 'taxDocuments', existingDoc.id), resultWithDateAndPrice);
        console.log('Documento atualizado com ID:', existingDoc.id);
      } else {
        const docRef = await addDoc(
          collection(db, 'taxDocuments'),
          resultWithDateAndPrice,
        );
        console.log('Documento adicionado com ID:', docRef.id);
      }

      setPageNumber(1);
      await fetchTaxDocuments(null, 'init');
    } catch (error) {
      console.error('Erro ao salvar o documento no Firestore:', error);
    }
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
    const url = `https://focusrender.onrender.com/api/check-nfses/${cnpj}`; // URL do backend

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
          response.statusText,
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
      const url = `https://focusrender.onrender.com/api/cancel-nfce/${ref.ref}`; // URL do backend
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
            doc.ref === ref.ref ? { ...doc, activate: true } : doc,
          ),
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
        Math.floor(Math.random() * characters.length),
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
            label="CPF"
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
      <button
        onClick={handleCleanupRejectedDocs}
        className="btn btn-danger"
        style={{ marginLeft: '10px', backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#fff' }}
      >
        Limpar Notas Rejeitadas
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
            <th>Status</th>
            <th>Imprimir</th>
            <th>Cancelar Nota</th>
          </tr>
        </thead>
        <tbody>
          {taxDocument &&
            taxDocument.map((item, index) => {
              const isSuccess = item.status === 'autorizado';
              const statusLabel = isSuccess ? 'Autorizado' : (item.status === 'rejeitado' ? 'Rejeitado' : 'Erro');
              const statusColor = isSuccess ? 'green' : 'red';
              let errorMessage = null;
              if (item.mensagem_sefaz) {
                errorMessage = typeof item.mensagem_sefaz === 'object' ? JSON.stringify(item.mensagem_sefaz) : item.mensagem_sefaz;
              } else if (item.erro) {
                errorMessage = typeof item.erro === 'object' ? (item.erro.mensagem || item.erro.message || JSON.stringify(item.erro)) : item.erro;
              } else if (item.mensagem) {
                errorMessage = typeof item.mensagem === 'object' ? JSON.stringify(item.mensagem) : item.mensagem;
              }

              return (
                <tr key={index}>
                  <td>
                    {item.caminho_danfe ? (
                      <a
                        href={`https://api.focusnfe.com.br${item.caminho_danfe}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.ref}
                      </a>
                    ) : (
                      <span>{item.ref}</span>
                    )}
                  </td>
                  <td>{item.date_issued}</td>
                  <td>
                    {item.total_value !== undefined && item.total_value !== null ? (
                      `R$ ${parseFloat(item.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    ) : (
                      'R$ 0,00'
                    )}
                  </td>
                  <td>
                    <span style={{ color: statusColor, fontWeight: 'bold' }}>
                      {statusLabel}
                    </span>
                    {errorMessage && (
                      <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px', maxWidth: '300px', wordBreak: 'break-word' }}>
                        {errorMessage}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-link"
                      disabled={!item.caminho_danfe}
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://focusrender.onrender.com';
                          await fetch(
                            `${backendUrl}/api/print-nfce`,
                            {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                caminho_danfe: item.caminho_danfe,
                                nfceRef: item.nfceRef || item.ref, // Passa a referência
                              }),
                            },
                          );
                        } catch (err) {
                          console.error('Erro ao reimprimir:', err);
                          alert('Erro ao conectar com o serviço de impressão.');
                        }
                      }}
                    >
                      imprimir
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setOpenpopCancelTax(item);
                      }}
                      disabled={!isSuccess || item.activate}
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
              );
            })}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button
          className="btn btn-pagination"
          disabled={pageNumber === 1 || loading}
          onClick={() => {
            setPageNumber((prev) => prev - 1);
            fetchTaxDocuments(firstDoc, 'prev');
          }}
        >
          Anteriores
        </button>
        <span className="page-info">Página {pageNumber}</span>
        <button
          className="btn btn-pagination"
          disabled={!lastDoc || (taxDocument && taxDocument.length < PAGE_SIZE) || loading}
          onClick={() => {
            setPageNumber((prev) => prev + 1);
            fetchTaxDocuments(lastDoc, 'next');
          }}
        >
          Próximos {PAGE_SIZE}
        </button>
      </div>
    </div>
  );
};
export default FiscalAttributes;
//1Jb8Op4U7Wz6afwJe1w3mjNQlqBdkOMAvF
