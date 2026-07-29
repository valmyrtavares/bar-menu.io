# Walkthrough: Reforma Tributária e Integração de NFC-e (Focus NFe)

Este documento resume o diagnóstico do problema de emissão de NFC-e com a Reforma Tributária (IBS/CBS), as correções realizadas e as instruções detalhadas de teste e verificação.

---

## 1. O Problema Diagnosticado (Ponto de Partida)

* **O Erro:** As notas fiscais emitidas no dia 27/07/2026 no ambiente de **Homologação** falhavam com a **Rejeição 1115: IBS/CBS não informado [nItem: 1]**.
* **A Causa:** O código antigo utilizava o grupo aninhado `"gIBSCBS": { ... }` ou chaves que a API da Focus NFe não reconhece. Por não reconhecer os campos, a API os ignorava e gerava o XML da nota sem os grupos `<IBS>` e `<CBS>`. Desde abril de 2026, a Receita Federal / SEFAZ passou a exigir ativamente esses campos (e rejeitar as notas sem eles), sendo que o ambiente de Homologação aplica essa regra de forma estrita em 2026.
* **Nota de Modelo do Dia 24/07/2026:** A nota que funcionou na sexta-feira (`REQ--9505--VALMYR-TAVARES--WYW1wCTW`) foi emitida no ambiente de **Produção**. Na produção, em 2026, as regras da reforma são opcionais para empresas do Simples Nacional (`CRT = 1`), permitindo que a nota passasse mesmo sem as tags. Na Homologação, contudo, a validação já barra.

---

## 2. O que foi Proposto e Implementado

No arquivo `src/services/fiscalService.js`, foram feitas as seguintes correções contidas na proposta:

1. **Definição de Regime Tributário Explicitado:**
   Adicionamos o campo `regime_tributario_emitente: 1` no objeto raiz da nota para identificar a empresa formalmente como Simples Nacional perante a Focus NFe.
2. **Uso dos Campos Planos do Layout da Focus NFe:**
   Remoção do objeto `"gIBSCBS"` e mapeamento das alíquotas/valores de IBS/CBS de forma plana em cada item:
   * `ibs_cbs_situacao_tributaria: "000"` (Tributação integral do IBS/CBS)
   * `ibs_cbs_classificacao_tributaria: "000001"` (Classificação padrão de tributos sob bens e serviços)
   * `ibs_cbs_base_calculo`: Valor do item (float)
   * `cbs_aliquota: "0.9"` (Alíquota de teste federal)
   * `cbs_valor`: Calculado dinamicamente (`parseFloat((price * 0.009).toFixed(2))`)
   * `ibs_uf_aliquota: "0.1"` (Alíquota de teste estadual)
   * `ibs_uf_valor`: Calculado dinamicamente (`parseFloat((price * 0.001).toFixed(2))`)
   * `ibs_mun_aliquota: "0"`
   * `ibs_mun_valor: "0"`
   * `ibs_valor_total`: Igual ao `ibs_uf_valor` (soma estadual + municipal)
3. **Cálculo de Totais no Nível Raiz do Payload:**
   Adicionamos um somatório no final da construção do objeto que acumula a base e os valores de impostos de todos os itens e injeta na raiz do JSON:
   * `ibs_cbs_base_calculo`
   * `cbs_valor_total`
   * `ibs_uf_valor_total`
   * `ibs_valor_total`
   * `ibs_cbs_is_valor_total` (IBS Total + CBS Total)
4. **Log de Auditoria e Rastreamento:**
   Adicionamos logs completos no terminal. Sempre que houver uma requisição de NFC-e, você verá no console:
   * O payload JSON completo antes do envio (`[FISCAL API REQUEST]`).
   * Caso a API da Focus rejeite ou ocorra erro HTTP, será printada a resposta completa detalhada da SEFAZ (`[FISCAL API ERROR]`) e o payload envolvido (`[FISCAL API ERROR PAYLOAD]`).

*Nota: Todos os 7 testes unitários do sistema de travamento de concorrência e circuit breaker foram executados localmente e passaram com sucesso.*

---

## 3. Instruções do Teste Local (O que fazer)

Para testar localmente o fluxo completo de ponta a ponta e garantir que a nota seja emitida corretamente sem rebaixar a segurança:

1. **Abra o sistema localmente:** O comando `npm run start:tropicalx` já está rodando. Abra a interface do sistema no seu navegador (normalmente em `http://localhost:3000`).
2. **Habilite a Emissão Automática (PDV):** Certifique-se de que o sistema está em modo PDV (o `localStorage.getItem('pdv')` deve estar setado como `true` ou a configuração de emissão automática ativa).
3. **Realize uma compra fictícia:**
   * Faça um pedido no cardápio de valor baixo (ex: R$ 8,00 ou R$ 19,00).
   * Prossiga até o checkout e selecione um método de pagamento (ex: Crédito, Débito ou Pix).
   * Conclua o pagamento.
4. **O Gatilho:** Assim que o pedido for marcado como pago (no banco Firestore), a trava atômica do frontend é acionada (`RequestListToBePrepared.js`), mudando o estado temporariamente para `sendingNfce: true` e chamando a função `issueAutoNfce(order)`.

---

## 4. Resultados Esperados (O que colher)

Durante e após o teste, você deve monitorar e colher os seguintes resultados no seu terminal e banco de dados:

### A. No Terminal (Logs):
Procure pela saída estruturada nos logs do terminal da sua aplicação:
1. **Requisição de Envio:** O log deve mostrar o payload montado de forma idêntica à proposta da reforma (com `regime_tributario_emitente: 1` e campos planos populados).
2. **Resposta de Autorização:** A saída da chamada deve printar a resposta da Focus NFe com:
   * `status: "autorizado"`
   * `status_sefaz: "100"`
   * `mensagem_sefaz: "Autorizado o uso da NF-e"`
   * A chave de acesso `chave_nfe` e os links da nota (DANFE e XML).

### B. No Banco de Dados Firestore:
Acesse a coleção `taxDocuments` do Firestore e verifique a inserção/atualização do documento fiscal referente ao pedido:
* O campo `status` no documento deve constar como `"autorizado"`.
* O campo `caminho_danfe` deve conter o link do PDF/HTML da nota fiscal autorizada.
* O campo `mensagem_sefaz` deve conter `"Autorizado o uso da NF-e"`.

### C. Segurança Anti-Flood (Caso Ocorra Algum Erro):
Se o teste falhar por qualquer fator externo (ex: instabilidade na API ou certificado):
* O sistema irá gravar `nfceStatus: "erro"` no documento do pedido no Firestore.
* **Resultado Esperado:** A trava de concorrência impedirá que o sistema realize novas tentativas automáticas (ou seja, **não haverá looping ou emissões repetidas**). A nota ficará com erro gravado e aguardará que o usuário decida clicar em "Re-emitir" de forma manual pelo banner ou pela administração de notas.
