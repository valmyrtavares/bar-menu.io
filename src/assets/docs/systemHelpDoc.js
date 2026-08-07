/**
 * System Knowledge Base (Documento do Sistema para Consulta da IA)
 * Este documento contém todas as instruções operacionais, manuais de tela
 * e regras de negócio do sistema bar-menu.io.
 */

// Mapeamento das telas administrativas e suas funções
export const SCREEN_DOCUMENTATION_MAP = {
  '/admin/request': {
    title: 'Módulo de Vendas (Relatório e Faturamento)',
    description: `A tela de **VENDAS** permite visualizar, filtrar e analisar o faturamento por período.
- **Data Inicial e Data Final:** Filtre as vendas selecionando um intervalo de datas.
- **Tabela de Vendas:** Exibe o nome do produto, quantidade vendida, valor total arrecadado, taxa de cartão de crédito/débito, custo dos insumos, lucro líquido e descontos aplicados.
- **Totais:** A linha de total mostra a soma geral de vendas, custos e lucros no período selecionado.
- **Detalhamento:** Clicar em um item da tabela permite ver os detalhes contábeis e financeiros da venda.`,
    faq: [
      'Para que serve a tela de Vendas?',
      'Como filtrar vendas por período?',
      'Como ver o lucro líquido das vendas?',
    ]
  },
  '/admin/sell-flow': {
    title: 'Fechamento e Fluxo de Caixa',
    description: `A tela de **FECHAMENTO DE CAIXA** é usada para conferir e encerrar o turno ou dia de vendas.
- Exibe o resumo de recebimentos por meio de pagamento (Dinheiro, PIX, Cartão de Crédito, Cartão de Débito, Voucher).
- Permite conferir o saldo inicial de caixa (sangrias e reforços).
- Gera o relatório de fechamento para conferência financeira.`,
    faq: [
      'Como fazer o fechamento de caixa?',
      'Como conferir os totais por forma de pagamento?',
    ]
  },
  '/admin/stock': {
    title: 'Gestão de Estoque e Matéria-Prima',
    description: `A tela de **ESTOQUE** gerencia o inventário de insumos e matérias-primas do restaurante/bar.
- **Entrada de Estoque:** Registre compras de insumos informando quantidade, unidade (kg, g, un, ml, L) e valor de compra.
- **Ajuste de Estoque:** Faça correções de saldo por motivo de perda, validade ou contagem física.
- **Histórico de Movimentações:** Acompanhe entradas e saídas detalhadas de cada item.`,
    faq: [
      'Como dar entrada no estoque?',
      'Como ajustar a quantidade de um insumo?',
      'Como ver o histórico de movimentações?',
    ]
  },
  '/admin/item': {
    title: 'Cadastro de Produtos e Pratos',
    description: `A tela de **CADASTRO DE PRATOS** permite incluir novos itens no cardápio digital e totem.
- Preencha o Nome do produto, Descrição, Categoria e Preço principal.
- Faça o envio da imagem ilustrativa do prato.
- Configure opções de disponibilidade (ativo/inativo).`,
    faq: [
      'Como cadastrar um produto no cardápio?',
      'Como colocar foto em um prato?',
    ]
  },
  '/admin/editButton/dishes': {
    title: 'Edição e Exclusão de Pratos',
    description: `A tela de **EDIÇÃO DE PRATOS** permite alterar preços, nomes, fotos ou remover produtos existentes do cardápio.
- Clique no ícone de lápis para editar um prato.
- Clique na lixeira para excluir um item do cardápio.`,
    faq: [
      'Como editar o preço de um prato?',
      'Como excluir um produto do cardápio?',
    ]
  },
  '/admin/category': {
    title: 'Adicionar Categoria',
    description: `A tela de **CATEGORIAS** permite criar novas seções no cardápio (ex: Bebidas, Lanches, Sobremesas, Porções).
- Digite o nome da categoria e defina a ordem de exibição no menu.`,
    faq: [
      'Como criar uma nova categoria no cardápio?',
    ]
  },
  '/admin/sidedishes': {
    title: 'Adicionar Acompanhamento (Adicionais)',
    description: `A tela de **ACOMPANHAMENTOS** permite cadastrar extras que os clientes podem adicionar aos pratos (ex: Baco extra, Molho especial, Queijo duplo).
- Informe o nome do acompanhamento, valor adicional e insumos associados.`,
    faq: [
      'Como cadastrar um acompanhamento ou adicional?',
    ]
  },
  '/admin/customer': {
    title: 'Lista e Gestão de Clientes',
    description: `A tela de **CLIENTES** permite gerenciar a base de clientes cadastrados no sistema.
- Visualize o histórico de compras, contatos, CPF e pontos de fidelidade dos clientes.`,
    faq: [
      'Como visualizar a lista de clientes?',
      'Como pesquisar um cliente por CPF?',
    ]
  },
  '/admin/promotions': {
    title: 'Promoções e Cupons de Desconto',
    description: `A tela de **PROMOÇÕES** permite criar ofertas especiais no cardápio.
- Escolha os produtos em promoção, o valor do desconto (% ou R$) e a validade.`,
    faq: [
      'Como criar uma promoção no cardápio?',
    ]
  },
  '/admin/managementRecipes': {
    title: 'Gestão de Receitas (Ficha Técnica)',
    description: `A tela de **RECEITAS (FICHA TÉCNICA)** vincula insumos do estoque aos pratos do cardápio.
- Exemplo: Vincule 200g de Carne e 1 Pão ao Hambúrguer. Ao vender o hambúrguer, o sistema baixa os insumos automaticamente.`,
    faq: [
      'Como criar a ficha técnica de um prato?',
      'Como vincular o estoque aos produtos do cardápio?',
    ]
  },
  '/admin/expenses': {
    title: 'Gestão de Despesas e Fornecedores',
    description: `A tela de **DESPESAS** é usada para controlar os custos operacionais da empresa (Contas a Pagar).
- Cadastre fornecedores e lance despesas com data de vencimento e categoria.`,
    faq: [
      'Como cadastrar uma despesa ou conta a pagar?',
      'Como cadastrar um fornecedor?',
    ]
  },
  '/admin/excel-management': {
    title: 'Carga em Massa via Excel',
    description: `A tela de **CARGA EM MASSA (EXCEL)** permite importar ou exportar listas de produtos, preços e estoques em lote via planilhas.`,
    faq: [
      'Como importar produtos via planilha Excel?',
    ]
  },
  '/admin/frontimage': {
    title: 'Configurações do Terminal Totem',
    description: `A tela de **CONFIGURAÇÕES DO TERMINAL** gerencia imagens de capa, descanso de tela e exibição no totem de autoatendimento.`,
    faq: [
      'Como alterar as imagens do totem de autoatendimento?',
    ]
  },
  '/admin/requestlist': {
    title: 'PDV - Ponto de Venda',
    description: `A tela de **PDV** permite registrar novos pedidos presencialmente no balcão ou caixa.`,
    faq: [
      'Como lançar um pedido no PDV?',
    ]
  },
  '/admin/kitchen': {
    title: 'Monitor da Cozinha / Bar (KDS)',
    description: `A tela da **COZINHA** exibe a fila de preparo de pedidos em tempo real.
- Permite alterar o status do pedido para "Em Preparo" ou "Pronto".`,
    faq: [
      'Como funciona a fila de pedidos da cozinha?',
    ]
  }
};

export const SYSTEM_HELP_DOCUMENT = `
# MANUAL COMPLETO DO SISTEMA BAR-MENU.IO

## 1. TELA DE VENDAS E RELATÓRIO FINANCEIRO (/admin/request)
A tela de Vendas fornece a visão completa sobre o faturamento da loja.
- Para consultar vendas: Selecione a **Data Inicial** e **Data Final** nos campos de busca.
- A tabela calcula automaticamente o valor bruto das vendas, descontos de taxas de cartão, custo estimado de insumos e o **lucro líquido**.

## 2. PREÇOS POR TAMANHO E PERSONALIZAÇÃO (/admin/customize-price)
- Para cadastrar tamanhos (P, M, G ou 300ml, 500ml): Vá em "Preço Customizado".
- Selecione o produto e adicione os preços para cada tamanho/porção.

## 3. GESTÃO DE ESTOQUE E MATÉRIA-PRIMA (/admin/stock)
- Entrada de estoque: Vá em "Estoque" > "Entrada de Estoque". Preencha insumo, quantidade e valor.
- Ajustes por perda/validade: Use a opção de "Ajuste de Estoque".

## 4. ATRIBUTOS FISCAIS E IMPOSTOS (/admin/fiscal)
- Configuração de NCM e CEST: Acesse a tela de Atributos Fiscais para corrigir pendências de emissão de cupom fiscal (NFC-e / SAT).

## 5. CADASTRO E EDIÇÃO DE PRATOS (/admin/item)
- Para incluir um novo prato no cardápio: Acesse "Adicione um prato", insira o título, categoria, foto e valor.
- Para alterar ou excluir: Acesse "Edite seus pratos".

## 6. FICHA TÉCNICA E RECEITAS (/admin/managementRecipes)
- Para dar baixa automática no estoque: Cadastre a ficha técnica vinculando os insumos a cada prato.

## 7. DESPESAS E FORNECEDORES (/admin/expenses)
- Lance contas a pagar e controle o fluxo financeiro de fornecedores em "Despesas".
`;

export default SYSTEM_HELP_DOCUMENT;
