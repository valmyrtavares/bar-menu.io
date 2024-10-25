import React from "react";
import { GlobalContext } from "../../GlobalContext";
import { cardClasses } from "@mui/material";

const FiscalAttributes = () => {
  const global = React.useContext(GlobalContext);
  const {
    name,
    finalPriceRequest,
    dateTime,
    countRequest,
    request,
    paymentMethod,
  } = global.userNewRequest;

  const nfce = {
    cnpj_emitente: "19337953000178",
    data_emissao: "",
    //indicador_inscricao_estadual_destinatario: "9",
    modalidade_frete: 9,
    local_destino: 1,
    presenca_comprador: 1,
    natureza_operacao: "VENDA AO CONSUMIDOR",
    // items: [
    //   {
    //     numero_item: "1",
    //     codigo_ncm: "62044200",
    //     quantidade_comercial: "1.00",
    //     quantidade_tributavel: "1.00",
    //     cfop: "5102",
    //     valor_unitario_tributavel: "79.00",
    //     valor_unitario_comercial: "79.00",
    //     valor_desconto: "0.00",
    //     descricao:
    //       "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
    //     codigo_produto: "251887",
    //     icms_origem: "0",
    //     icms_situacao_tributaria: "102",
    //     unidade_comercial: "un",
    //     unidade_tributavel: "un",
    //     valor_total_tributos: "24.29",
    //   },
    // ],
    formas_pagamento: [
      {
        forma_pagamento: "03",
        valor_pagamento: "79.00",
        nome_credenciadora: "Cielo",
        bandeira_operadora: "02",
        numero_autorizacao: "R07242",
      },
    ],
  };

  const testando = () => {
    nfce.data_emissao = isoDate();
    console.log(nfce);
    console.log("global.userNewRequest   ", global.userNewRequest);
    console.log("request   ", request);
    console.log("Forma de pagamento   ", paymentMethodWay(paymentMethod));
    nfce.items = [];
    nfce.formas_pagamento = [];
    nfce.formas_pagamento.push({
      forma_pagamento: paymentMethodWay(paymentMethod),
      valor_pagamento: finalPriceRequest,
      nome_credenciadora: "Cielo",
      bandeira_operadora: "02",
      numero_autorizacao: "R07242",
    });
    for (let i = 0; i < request.length; i++) {
      nfce.items.push({
        numero_item: i + 1,
        codigo_ncm: "84713012",
        quantidade_comercial: 1.0,
        quantidade_tributavel: 1.0,
        descricao: request[i].name,
        cfop: "5102",
        codigo_produto: request[i].id,
        valor_unitario_tributavel: request[i].finalPrice,
        valor_unitario_comercial: request[i].finalPrice,
        valor_desconto: 0,
        icms_origem: "0",
        icms_situacao_tributaria: "102",
        unidade_comercial: "un",
        unidade_tributavel: "un",
        valor_total_tributos: "un",
      });
    }
    console.log("Com item alterado    ", nfce);
  };

  const paymentMethodWay = (method) => {
    let op = {
      debit: "05",
      credite: "04",
      cash: "01",
      pix: "99",
    };
    return op[method];
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

  React.useState(() => {
    console.log("Estou no emissor de NFCe     ", global.userNewRequest);
  }, []);

  return (
    <div>
      <h1>Aqui começa a emissão de NFCe</h1>
      <button onClick={testando} className="btn btn-success">
        Nota fiscal
      </button>
    </div>
  );
};
export default FiscalAttributes;
