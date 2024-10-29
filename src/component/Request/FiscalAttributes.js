import React from 'react';
import { GlobalContext } from '../../GlobalContext';
import Input from '../../component/Input.js';
import '../../assets/styles/FiscalAttributes.css';
import useFormValidation from '../../Hooks/useFormValidation.js';
import { cardClasses } from '@mui/material';

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
  }, []);

  const nfce = {
    cnpj_emitente: '19337953000178',
    data_emissao: '',
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
      nome_credenciadora:
        paymentMethodWay(paymentMethod) === '01' ? '' : 'Cielo',
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
        valor_total_tributos: 'un',
      });
    }

    console.log('Com item alterado    ', nfce);
    const ref = generationUniqueRandomStrig();

    // URL atualizada para o seu servidor
    const url = `http://localhost:4000/v2/nfce?ref=${ref}`;

    // Transformar nfce em JSON
    const nfceJson = JSON.stringify(nfce);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: nfceJson,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resposta da API CEFAZ:', result);
      } else {
        console.error('Erro ao enviar NFC-e:', response.statusText);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const paymentMethodWay = (method) => {
    let op = {
      debit: '05',
      credite: '04',
      cash: '01',
      pix: '99',
    };
    return op[method];
  };

  const cpfAndCardFlagValidation = () => {
    const typePayment = paymentMethodWay(paymentMethod);

    if (typePayment === '04' || typePayment === '05') {
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
    const ref = 'bvjc47rYtPSb9oJltF4RzUDpH9flOZw2wz'; // Exemplo de referência
    const url = `http://localhost:4000/v2/nfce/consultar/${ref}`; // URL da consulta

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

  const fillingNcmCode = (category) => {
    let op = {
      agua: 20011000,
      refrigerante: 22021000,
    };
    if (!op[category]) {
      console.log('outros');
      return '8119000';
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
    const now = new Date();
    const maxDifference = 5 * 60 * 1000; // 5 minutos em milissegundos
    const randomTime = new Date(
      now.getTime() - Math.floor(Math.random() * maxDifference)
    );

    // const timezoneOffset = randomTime.getTimezoneOffset();
    // const offsetHours = String(
    //   Math.floor(Math.abs(timezoneOffset) / 60)
    // ).padStart(2, "0");
    // const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(
    //   2,
    //   "0"
    // );
    // const offsetSign = timezoneOffset > 0 ? "-" : "+";

    // const formattedTime = randomTime.toISOString().slice(0, -5);
    // const isoString = `${formattedTime}${offsetSign}${offsetHours}:${offsetMinutes}`;
    console.log(randomTime);
    return randomTime;
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
            autocomplete="off"
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
      <div>
        <button onClick={handleConsulta}>Consultar NFC-e</button>
      </div>
    </div>
  );
};
export default FiscalAttributes;
