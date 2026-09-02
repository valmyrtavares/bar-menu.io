# MANUAL OFICIAL DE INTEGRAÇÃO FISCAL MULTI-TENANT (FOCUS NFE)

**Documento Operacional do ERP**  
**Versão:** 2.0  
**Objetivo:** Guia definitivo e simplificado para cadastrar, configurar e ativar a emissão de Notas Fiscais (NFC-e) para qualquer novo cliente/empresa.

---

## 1. INTRODUÇÃO E ARQUITETURA

O sistema opera com uma arquitetura **Multi-Tenant Totalmente Desacoplada**.  
Isso significa que:
* Cada cliente possui seu próprio banco de dados isolado no Firebase.
* O servidor intermediário na Hostinger é **universal e sem estado (stateless)**: ele não precisa ser modificado a cada novo cliente.
* O frontend do ERP envia os dados fiscais e o token seguro da empresa em tempo de execução.

---

## 2. CHECKLIST RÁPIDO: ONDE MODIFICAR PARA CADA NOVO CLIENTE

Para ativar um novo cliente, você só precisará executar **4 etapas simples**:

1. **Focus NFe:** Criar a conta da empresa e pegar os tokens.
2. **Arquivo de Ambiente (`.env`):** Criar o arquivo `.env.<nome_cliente>` na raiz do projeto.
3. **Scripts (`package.json`):** Adicionar os comandos de `start` e `build` do cliente.
4. **Validar:** Rodar o comando e fazer um pedido de teste.

---

## 3. PASSO A PASSO DETALHADO

### ETAPA 1: Configuração no Painel da Focus NFe

1. Acesse o painel da Focus NFe ([https://app.focusnfe.com.br](https://app.focusnfe.com.br)).
2. Clique em **Empresas** e adicione a nova empresa com o **CNPJ**.
3. Faça o upload do **Certificado Digital A1** (arquivo `.pfx` ou `.p12`) e digite a senha.
4. Preencha o **CSC (Código de Segurança do Contribuinte)** e o **ID do CSC** gerados no portal da SEFAZ estadual do cliente.
5. Copie os dois tokens gerados:
   * **Token de Homologação** (para testes sem valor fiscal).
   * **Token de Produção** (para emissão real com valor fiscal).

---

### ETAPA 2: Criar o Arquivo de Ambiente no Projeto

Na pasta raiz do projeto `bar-menu.io`, crie um novo arquivo chamado:  
`.env.<nome_cliente>` *(Exemplo: `.env.pizzaria`)*

Copie e preencha a estrutura abaixo com os dados do cliente:

```ini
# Identificação do Firebase do Cliente
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=pizzaria-menu.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pizzaria-menu
REACT_APP_FIREBASE_STORAGE_BUCKET=pizzaria-menu.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000
REACT_APP_FIREBASE_APP_ID=1:000000000000:web:00000000000000

# Backend Fiscal Universal
REACT_APP_BACKEND_URL=https://nfe.tropicalx.com.br

# Configurações Fiscais da Empresa
REACT_APP_FISCAL_CNPJ=00000000000100
REACT_APP_FISCAL_TOKEN=COLE_AQUI_O_TOKEN_DA_FOCUS
REACT_APP_FISCAL_ENVIRONMENT=producao
REACT_APP_FISCAL_CRT=1
```

#### Tabela de Referência do Regime Tributário (`REACT_APP_FISCAL_CRT`):
* **Digite `1`:** Para empresas do **Simples Nacional** (ME, EPP, MEI, Bares e Restaurantes).
* **Digite `3`:** Para empresas do **Regime Normal** (Lucro Presumido ou Lucro Real).

#### Tabela de Referência do Ambiente (`REACT_APP_FISCAL_ENVIRONMENT`):
* **`producao`:** Emite nota fiscal oficial com valor jurídico e tributário.
* **`homologacao`:** Emite nota de teste (sem valor fiscal).

---

### ETAPA 3: Adicionar os Comandos no `package.json`

Abra o arquivo `package.json` na raiz do projeto e localize a seção `"scripts"`.  
Adicione as duas linhas correspondentes ao novo cliente:

```json
"scripts": {
  "start:pizzaria": "dotenv -e .env.pizzaria react-scripts start",
  "build:pizzaria": "dotenv -e .env.pizzaria react-scripts build && node deploy-copy.js"
}
```

---

### ETAPA 4: Teste e Validação

1. **Iniciar o Sistema do Cliente:**  
   No terminal, execute o comando de inicialização do cliente:
   ```bash
   npm run start:pizzaria
   ```

2. **Lançar um Pedido de Teste:**
   * Abra o sistema no navegador.
   * Lance um pedido no caixa ou totem com qualquer produto (ex: R$ 1,00 ou um item real).
   * Conclua o pagamento.

3. **Verificar a Nota:**
   * A nota será processada e autorizada automaticamente.
   * O cupom fiscal (DANFE) será gerado para impressão.
   * *(Opcional)* Se precisar cancelar o teste em produção, clique no botão **Cancelar** na aba fiscal em até 30 minutos.

---

## 4. ARMAZENAMENTO E SEGURANÇA DE DADOS SENSÍVEIS

Para garantir total conformidade com a LGPD e segurança das empresas clientes:

### 1. Token da Focus NFe
* **Onde fica:** Exclusivamente no arquivo `.env.<cliente>` daquela unidade.
* **Segurança:** Fica restrito ao ambiente do computador do cliente ou servidor de build. Nunca sobe para repositórios públicos (protegido pelo `.gitignore`).

### 2. Certificado Digital A1 e Senha
* **Onde fica:** Armazenado exclusivamente no cofre criptografado da **Focus NFe**.
* **Segurança:** O ERP e a Hostinger **nunca** guardam o arquivo nem a senha do certificado do cliente.

### 3. Servidor Proxy (Hostinger)
* **Onde fica:** Apenas em trânsito (Memória RAM transitória).
* **Segurança:** A API é **Stateless** (não possui banco de dados de tokens). Ela recebe a requisição criptografada via HTTPS, assina a nota na Focus e descarta o token imediatamente após o retorno.

---

## 5. TRAVAS DE SEGURANÇA CONTRA DUPLICIDADE E LOOPINGS

O ERP possui 5 camadas de segurança ativas para que nenhuma nota seja emitida em duplicidade:

* **Camada 1 (Trava Atômica Firestore):** Usa transações atômicas (`runTransaction`). Se duas pessoas clicarem juntas em dois caixas, apenas uma nota é enviada.
* **Camada 2 (In-Flight Dedup JS):** Impede que múltiplos cliques rápidos no botão gerem mais de uma requisição simultânea.
* **Camada 3 (Disjuntor Anti-Flood):** Se houver mais de 5 disparos em menos de 60 segundos por erro de operador, o sistema bloqueia preventivamente.
* **Camada 4 (Pre-Flight Tax Check):** Antes de gastar chamada na API, consulta o banco local `taxDocuments` pela referência do pedido. Se já foi emitida, aborta o envio.
* **Camada 5 (Referência Única na Focus):** Cada pedido tem uma chave única (ex: `REQ--1045--CLIENTE`). A Focus NFe rejeita qualquer nota duplicada com a mesma referência.
