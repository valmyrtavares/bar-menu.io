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
- **Linha em Vermelho (Alerta de Estoque Mínimo):** Linhas destacadas em vermelho indicam que a quantidade da matéria-prima no estoque está **igual ou abaixo do Estoque Mínimo** cadastrado. É um alerta automático para que seja feita a reposição ou nova compra do insumo.
- **Histórico de Movimentações:** Acompanhe entradas e saídas detalhadas de cada item.`,
    faq: [
      'O que significa uma linha estar vermelha no estoque?',
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

export const SYSTEM_HELP_DOCUMENT = `\nMenu Principal
Guia do Menu Principal do Administrador
Este guia oferece um resumo de todos os módulos disponíveis no Menu do Administrador. Para retornar a esta tela principal a qualquer momento, basta clicar no título do módulo que você está visualizando no topo da página.


  

________________




1. Gestão de Cardápio e Produtos
* Adicione / Edite seus pratos: Central de controle do que você vende. Aqui você define o nome do prato, preço, descrição e foto. É o coração do que o cliente verá no menu.
* Adicione / Edite suas categorias: Organiza seu cardápio por grupos (ex: Entradas, Burgers, Bebidas). Uma boa categorização ajuda o cliente a encontrar o que deseja mais rápido.
* Adicione / Edite seus acompanhamentos: Gerencia itens que complementam o prato principal, como molhos extras ou upgrades, permitindo que o cliente personalize o pedido.


	  

	________________






2. Operações e Estoque
* Estoque: Monitoramento em tempo real dos seus insumos. Quando um item fica com o nome em vermelho, o sistema está avisando que o volume atingiu o limite crítico definido no cadastro.
* Receitas (Fichas Técnicas): Onde a mágica financeira acontece. Aqui você vincula os itens do estoque aos pratos do cardápio, permitindo que o sistema baixe o estoque automaticamente a cada venda.
* PDV (Ponto de Venda): Interface agilizada para o atendente lançar pedidos feitos no balcão ou nas mesas de forma rápida e intuitiva.
* Cozinha: Espelho de pedidos em tempo real. A equipe de produção visualiza o que precisa ser feito, garantindo um fluxo de entrega organizado e sem esquecimentos.


	  

	

________________






3. Financeiro e Vendas
* Vendas: Histórico completo de todos os pedidos que já foram finalizados e pagos. Essencial para entender quais dias e horários seu estabelecimento vende mais.
* Despesas: Registro detalhado de toda saída de dinheiro, desde compras de insumos até custos fixos como luz e aluguel. (Veja o guia específico deste módulo para mais detalhes).
* Fechamento de Caixa: Módulo de conferência diária para bater os valores físicos e digitais recebidos no dia, garantindo que não haja furos financeiros.
* Custo de Operações: Cadastro técnico de gastos fixos/variáveis que auxilia o sistema a calcular sua real margem de lucro por prato vendido.
	  

	

________________




4. Clientes e Relacionamento
* Lista de Clientes: Cadastro com informações e histórico de cada pessoa que já comprou no seu estabelecimento, permitindo ações de fidelização.
* Saudação inicial: Personalize a frase que recebe seu cliente no menu digital. É o seu primeiro ponto de contato e hospitalidade digital.
* Promoções: Crie ofertas temporárias ou descontos em pratos específicos para incentivar as vendas em horários ou dias de menor movimento.


	  

	________________




5. Configurações e Estilo
* Adicione sua marca: Onde você faz o upload do seu logotipo para que a marca do seu negócio esteja sempre visível no menu digital.
* Gerenciando Estilos: Permite mudar as cores e o visual do sistema para que ele combine perfeitamente com a identidade visual do seu estabelecimento.
* Lista de Pedidos: Visão geral de todas as ordens que estão abertas no momento, permitindo acompanhar o status de cada mesa ou entrega em tempo real.


	  

	* ________________


TIP
Use o link "Sair do Administrador" no topo do menu lateral para retornar à visualização do cliente ou para trocar de usuário com segurança.


Adicione um prato
Guia do Administrador: Como Cadastrar e Gerenciar Seus Pratos
Bem-vindo ao coração do seu cardápio digital! Esta tela foi desenhada para que você tenha total controle sobre o que vende, como apresenta seus produtos e, principalmente, quanto está ganhando com cada um deles.
________________


1. Visão Geral
Nesta tela, você cria a "alma" do seu cardápio. Aqui você define o nome do prato, escolhe a foto que vai dar água na boca nos seus clientes e organiza tudo para que seja fácil de encontrar. Se você tiver um plano avançado, esta tela também será sua maior aliada na gestão financeira, calculando automaticamente se o preço que você está cobrando cobre seus custos e gera o lucro desejado.
________________


2. Passo a Passo dos Campos
2.1 Título
É o nome do seu prato. Seja claro e atraente! Ex: "Hambúrguer Gourmet Tropical".
2.2 Categoria (ou Botões do Menu)
Pense nas categorias como os botões de navegação que o seu cliente clica no celular.
* Organização: Você organiza seus pratos dentro desses grupos (ex: Bebidas, Lanches, Sobremesas).
* Onde o prato aparece: Um detalhe importante: o prato só pode ser colocado em grupos "finais". Ou seja, se você tem uma categoria "Bebidas" e dentro dela tem "Sucos" e "Refrigerantes", você vai cadastrar o prato diretamente em "Sucos" ou "Refrigerantes".
* Dica: No sistema, chamamos Categoria e Botão da mesma forma, pois cada categoria se torna um botão prático no seu cardápio.
* Hierarquia: Lembre-se que pratos não podem ser colocados em "grupos de grupos", apenas no destino final de cada categoria.
2.3 Comentário
Aqui vai aquele resumo caprichado! Diga o que vem no prato de forma breve (ex: "Carne 180g, queijo cheddar, bacon crocante e molho da casa"). Isso ajuda o cliente a decidir rápido sem precisar abrir muitos detalhes.
2.4 Preços, Custos e Lucro
O sistema trabalha para você aqui:
* Preço de Venda: É o quanto o cliente paga.
* Custo e Porcentagem: Se o seu plano permite, você verá o campo de custo. O mais incrível é que esse custo é calculado sozinho pelo sistema baseado nas compras de ingredientes que você registrou. Assim, você sabe exatamente qual é a sua margem de lucro real.
* Preços por Tamanho: Se você vende uma Pizza P, M e G, pode definir valores diferentes para cada tamanho com facilidade.
2.5 Imagem (O cartão de visitas)
Você tem duas formas simples de colocar a foto do seu prato:
1. Link da Internet: Se você já tem a foto em algum site, basta colar o endereço (URL).
2. Foto do Celular: Você pode tirar uma foto na hora, direto da cozinha, ou escolher uma da sua galeria. O sistema cuida de subir a foto para o lugar certo.
2.6 Destaque no Carrossel
Quer que um prato apareça logo de cara assim que o cliente abre o cardápio? Basta marcar a opção de "Adicionar ao carrossel". Ele ficará em destaque no topo da página, girando como uma vitrine de destaques!
________________


3. Botões Especiais de Gestão
3.1 Acompanhamentos
Aqui você define o que o cliente pode adicionar ao pedido (ex: queijo extra, borda recheada, batata frita).
* No plano básico: Eles servem principalmente para informar o cliente sobre as opções extras disponíveis e quando adicionados, aumentam automaticamente o valor do prato.
* Nos planos superiores: Eles ganham uma função financeira, somando o custo de cada item extra ao custo total da operação, garantindo que seu lucro esteja sempre correto.
3.2 Receita (Seu Segredo de Sucesso)
Este botão é fundamental para quem quer controle total e profissional do negócio.
* O que ele faz: Ao configurar a Receita, você diz ao sistema exatamente o que gasta para fazer aquele prato (ex: 150g de carne, 1 pão, 20g de queijo).
* Controle de Estoque: Isso controla a emissão e o custo dos produtos. Quando você vende um prato, o sistema já sabe quanto "saiu" do estoque de cada ingrediente.
* Custo Real: A receita alimenta diretamente o preço de custo que você vê na tela, permitindo que você ajuste seus preços se o valor dos ingredientes subir.
* Para detalhes técnicos de como montar cada receita passo a passo, clique no botão e veja as explicações no popup que abrirá.
________________


TIP
Dica Pro: Mantenha seus comentários curtos e suas fotos sempre atualizadas. Um cardápio visualmente bonito e com lucros bem calculados é o segredo para um negócio próspero!


Preços
Guia de Precificação: Inteligência e Customização
Este guia explica como funcionam as ferramentas de precificação do seu sistema, ajudando você a ter controle total sobre seus custos e lucros.
________________


1. Construtor de Preços e Despesas (Price Builder)
O Construtor de Preços é a inteligência por trás do valor que seu cliente vê. Ele não apenas define um preço, mas ajuda você a entender se esse preço é saudável para o seu negócio.
Como funciona:
* Margem de Lucro Automática: Ao informar o Custo e o Preço de venda, o sistema calcula automaticamente a sua Porcentagem de lucro.
* Definição por Porcentagem: Se você já sabe que quer ganhar 200% sobre um item, basta informar o custo e a porcentagem desejada; o sistema calculará o preço final para você.
* Integração com Receitas: Esta é a ferramenta mais poderosa. Se você cadastrou os ingredientes (receita) de um prato, pode clicar em "Calcular Custo". O sistema percorrerá sua lista de compras e ingredientes para dizer exatamente quanto aquele prato custa hoje, baseado nos preços reais que você pagou aos fornecedores.
NOTE
O cálculo automático de custo é um recurso avançado e essencial para manter sua tabela de preços sempre atualizada com a inflação e variações de mercado.
________________


2. Preço Customizado (Tamanhos e Variações)
Muitas vezes, um mesmo prato pode ter valores diferentes (ex: Pizza P, M e G ou Marmitex Padrão e Especial). O Preço Customizado permite que você gerencie essas variações em um só lugar.
Como funciona:
* Múltiplos Builders: Dentro deste formulário, você encontrará vários "Construtores" de preço. Cada um funciona de forma independente.
* Descrição (Rótulo): Para cada preço, você define uma etiqueta (ex: "Tamanho Família").
* Custo por Variação: O sistema permite que você defina custos diferentes para cada tamanho. Se você usa o cálculo automático de receita, o sistema saberá separar os custos se a receita estiver organizada por tamanhos.
________________


3. Disponibilidade por Pacotes
As ferramentas de Cálculo Automático de Custo e Gestão por Porcentagem de lucro são serviços inteligentes que dependem do pacote contratado.
* Controle Financeiro: Estes recursos são voltados para administradores que buscam um controle rigoroso de estoque e fluxo de caixa.
* Custos de Compras: Lembre-se que os custos exibidos aqui são gerados a partir do histórico de compras registrado no sistema. Sem o registro de compras/estoque, o cálculo automático não terá dados para processar.
________________


TIP
Mantenha suas Matérias Primas (estoque) sempre atualizadas. Quanto melhor for a informação que você dá ao sistema, mais precisa será a sugestão de preço que ele dará a você!


Gestão de acompanhamentos
Guia: Vinculando Acompanhamentos ao Prato
Este guia explica como você pode oferecer itens extras (acompanhamentos) para seus clientes quando eles selecionam um prato específico no cardápio.
1. O que é este formulário?
Este formulário serve para associar os acompanhamentos que você já tem no sistema a um prato. Exemplo: Se você vende um "Prato Feito", aqui você escolhe que o cliente pode adicionar "Ovo Frito", "Batata Palha" ou "Salada".
________________


2. Como selecionar os itens
Para incluir um acompanhamento, basta clicar no campo de seleção:
* Escolha na Lista: Clique no menu e selecione o acompanhamento desejado.
* Lista de Selecionados: Assim que você escolhe, o item aparece logo abaixo. Você pode remover um item clicando no "X" ao lado dele.
________________


3. Limite de Escolha (Obrigatório ou Opcional)
No campo "Quantidade máxima de acompanhamentos", você define quantos itens o cliente pode marcar:
* Se você colocar 1, o cliente só poderá escolher um item.
* Se você colocar 0, não haverá limite (o cliente pode marcar todos).
________________


4. Regra Importante para o Comerciante
Atenção: Este formulário mostra apenas os acompanhamentos que já foram cadastrados no menu principal de "Acompanhamentos".


Se você deseja criar um acompanhamento NOVO ou alterar o PREÇO dele, você deve primeiro ir ao módulo "Cadastro de Acompanhamentos".


Lá, se você usar o "Modo Básico", poderá escrever o nome manualmente. Se usar o "Modo Estoque", selecionará o produto direto da sua despensa. Só depois de cadastrado lá é que ele aparecerá aqui para ser vinculado ao prato.
________________


Dicas Rápidas
• Use nomes claros para que o cliente saiba exatamente o que está pedindo.
• Revise sempre o limite máximo para evitar pedidos que você não consiga atender.


Cadastro de Pratos e Receitas
Guia: Cadastro de Pratos e Receitas
Este formulário é a base do seu cardápio. Ele permite cadastrar seus produtos e, se você possuir o pacote de Gestão de Matéria Prima, detalhar exatamente como cada item é preparado para controlar seus custos e estoque.
________________


1. Integração com sua Despensa (Estoque)
Ao montar a sua receita, o sistema facilita o seu trabalho:
* Itens Automáticos: Nos campos de seleção de ingredientes, você verá exatamente o que já cadastrou no seu Estoque.
* Sempre Atualizado: Se você adicionar um item novo na sua despensa, ele aparecerá automaticamente aqui para ser usado em novos pratos.
________________


2. Cálculo de Custos em Tempo Real
Não precisa de calculadora externa!
* À medida que você adiciona cada ingrediente e define a quantidade usada, o sistema soma os custos instantaneamente.
* Isso permite que você veja o custo total de produção antes mesmo de terminar de cadastrar o prato.
________________


3. Preço Único vs. Preço Customizado
* Preço Único: Use quando o prato tem apenas um tamanho e um valor fixo (ex: Almoço Executivo).
* Preço Customizado: Use quando você oferece variações, como "Pequeno", "Médio" e "Grande", cada um com seu preço e sua própria receita.
________________


4. O Segredo da "Receita Tripla" (IMPORTANTE)
Se você quer que o sistema mostre três campos de receita diferentes (uma para cada tamanho), você precisa seguir esta regra:
CAUTION
OBSERVAÇÃO CRÍTICA: Ao preencher os Preços Customizados, você deve obrigatoriamente preencher o campo "Descrição" (Rótulo/Label) de cada preço (ex: Escrever "Família", "Individual", etc).

Se você preencher apenas o valor (R\$) e esquecer de dar um nome/descrição para aquele preço, o sistema NÃO habilitará a visão de receitas múltiplas. Isso fará com que as quantidades de ingredientes não fiquem separadas por tamanho, prejudicando o cálculo correto do seu lucro.
________________


Dicas para o Comerciante
• Mantenha seu estoque sempre atualizado para que os custos nas receitas reflitam a realidade do seu negócio.
• Revise os rótulos dos preços antes de salvar; eles são o que organizam sua produção na cozinha.
Categorias
Guia de Organização: Categorias e a Experiência do seu Cliente
Organizar o seu cardápio não é apenas listar produtos; é desenhar o caminho que o seu cliente percorre até o pedido. No nosso sistema, as Categorias são ferramentas poderosas para tornar essa jornada fluida, simples e profissional.
O Rastro do Desejo: Navegação por Níveis
Imagine que seu cliente quer um drink específico. Ele pode seguir um rastro lógico: Bebidas > Alcoólicos > Drinks
Ou se ele quer algo leve: Bebidas > Não Alcoólicos > Refrigerantes
Essa estrutura "aninhada" (uma categoria dentro da outra) ajuda a organizar grandes variedades sem sobrecarregar a visão do cliente.
Quando usar Subcategorias?
* Poucos Itens: Se você tem apenas 7 ou 8 tipos de bebidas (ex: 3 cervejas, 2 águas e 3 refrigerantes), o ideal é colocar tudo direto no botão "Bebidas". Menos cliques, mais rapidez!
* Cardápios Sofisticados: Estabelecimentos com mix de produtos maiores podem (e devem) trabalhar categorias mais profundas. Isso transmite sofisticação e organização.
________________


Regras de Ouro da Organização
Para garantir que o sistema funcione perfeitamente e o visual seja impecável, seguimos duas regrinhas simples:
1. Exclusividade: Uma categoria ou contém outras categorias ou contém produtos. Nunca os dois ao mesmo tempo. Isso evita confusão: se o cliente clica em "Cervejas", ele espera ver a lista de cervejas, não outra pasta (e vice-versa).
2. Hierarquia Visual: Para que o cliente entenda o que está dentro de quê, as subcategorias aparecem automaticamente um pouco menores e levemente mais suaves que a categoria pai. É um "degrau" visual que facilita a leitura.
________________


Como Criar sua Estrutura (O Formulário)
Ao adicionar ou editar uma categoria, você encontrará estes campos:
* Título: O nome que aparecerá no botão (ex: "Vinhos Tintos", "Sobremesas").
* Categoria (Pai): Aqui você define onde esse botão vai morar.
   * Se for uma categoria principal (que fica na tela inicial), escolha "main".
   * Se quiser que ela fique dentro de outra, escolha o nome da categoria pai.
   * Dica Inteligente: O sistema é esperto! Se uma categoria já tiver produtos cadastrados dentro dela, ela nem aparecerá nessa lista. Isso acontece para respeitar a "Regra de Exclusividade" mencionada acima.
* Imagem:
   * Essencial para Toten: Se você usa o modo Toten (telas grandes com fotos), a imagem da categoria é o que atrai o clique do cliente. Use fotos bonitas e nítidas!
   * Opcional para Celular: Se o seu foco é apenas o atendimento via celular ou botões, a imagem não é obrigatória, poupando espaço na tela.
________________


Dica Profissional
O sucesso do seu cardápio digital depende da facilidade. Pense como seu cliente: "O quão rápido eu consigo achar o que eu quero se eu estiver com fome/sede?". Teste sua estrutura e ajuste-a conforme seu negócio cresce!


Acompanhamentos dos pratos
Guia: Cadastro de Acompanhamentos
Este módulo é o seu inventário de extras. É aqui que você cria todos os itens que poderão ser adicionados aos seus pratos mais tarde (como batata frita, ovo, salada, etc.).
________________


1. O que este módulo faz?
Ele serve para criar a "lista mestra" de acompanhamentos. Uma vez que um item é cadastrado aqui, ele fica disponível para ser vinculado a qualquer prato do seu cardápio através do formulário de vinculação.
________________


2. Diferenças entre os Pacotes de Gestão
O sistema se adapta à forma como você trabalha:
modo Básico (Sem controle de estoque)
No modo básico, você tem total liberdade:
* Criação Livre: Você simplesmente digita o nome do acompanhamento (ex: "Molho Especial") e define o preço de venda para o cliente.
* Rapidez: Ideal para itens que você não precisa controlar o custo detalhado ingrediente por ingrediente.
Modo Gestão de Matéria Prima (Com controle de estoque)
Aqui o sistema trabalha de forma inteligente para proteger seu lucro:
* Vínculo com o Estoque: Em vez de digitar o nome, você seleciona o item diretamente da sua Despensa.
* Volume da Porção: Você define exatamente quanto daquele item vai na porção (ex: 150g).
* Cálculo de Custo: O sistema buscará o valor que você pagou no estoque e dirá exatamente quanto esse acompanhamento custa para você, garantindo que o preço de venda seja lucrativo.
________________


3. Sincronização e Atualização
Ao terminar de editar ou criar seus acompanhamentos, você verá o botão "Atualizar Pratos".
IMPORTANT
Por que clicar em Atualizar? Se você alterou o preço de um acompanhamento que já está em uso em vários pratos, clicar neste botão garante que todos esses pratos recebam a informação nova instantaneamente, sem que você precise editar cada prato um por um.
________________




Cadastro em Massa (Dica de Produtividade)
* Mantenha clicado se não quiser mudar de tela: Esta opção foi criada para facilitar a sua vida quando você tem vários acompanhamentos para cadastrar de uma só vez.
   * Se estiver desmarcada: Após você clicar em "Enviar", o sistema entende que você terminou e te levará de volta para a lista geral de acompanhamentos.
   * Se estiver marcada: O sistema salva o item atual, mas mantém você na mesma tela com os campos limpos. Isso é ideal para quando você está com a sua lista de produtos em mãos e quer cadastrar "Arroz", "Feijão" e "Farofa" um atrás do outro, sem precisar abrir o formulário várias vezes.


Dica para o Comerciante
• No modo de Matéria Prima, verifique sempre se o "Volume da porção" está correto. Uma porção maior do que o planejado pode consumir todo o seu lucro ao final do mês.
Receitas
Documentação: Gerenciamento de Receitas
O módulo de Gerenciamento de Receitas é uma ferramenta poderosa para o administrador manter o controle sobre o uso de matérias-primas (ingredientes) em todo o cardápio. Ele permite visualizar rapidamente quais pratos utilizam um determinado ingrediente e realizar alterações em massa, economizando tempo e evitando erros manuais.


  

Visão Geral do Módulo


Este módulo resolve o desafio de atualizar receitas quando um ingrediente sai de linha ou precisa ser substituído por outro em diversos pratos simultaneamente. Suas principais funções são:


1. Rastreamento: Identificar todos os pratos que contêm uma matéria-prima específica.
2. Exclusão em Massa: Remover um ingrediente de várias receitas de uma só vez.
3. Substituição em Massa: Trocar um ingrediente por outro em múltiplos pratos, mantendo as quantidades e unidades de medida originais.
________________


Passo a Passo das Funcionalidades
1. Como localizar onde uma matéria-prima é usada
Antes de qualquer ação, o sistema ajuda você a mapear o uso de um item:
1. No campo de seleção (Excluir ou Substituir), escolha o ingrediente desejado.
2. O sistema listará automaticamente logo abaixo todos os pratos que possuem esse item em sua receita.
  

2. Retirando uma matéria-prima do prato
Use esta função quando um ingrediente não fará mais parte das receitas selecionadas:
1. No módulo de exclusão, selecione o ingrediente que deseja remover.
2. Na lista de pratos que aparecerá, marque a caixa de seleção (checkbox) ao lado de cada prato do qual deseja retirar o item.
3. Clique no botão "Excluir ingredientes".
4. Uma mensagem de confirmação aparecerá listando os pratos afetados. Clique em confirmar na mensagem para concluir a ação.
  

3. Substituindo uma matéria-prima
Use esta função quando quiser trocar um item por outro (ex: trocar 'Marca A' por 'Marca B' ou 'Limão Siciliano' por 'Limão Taiti'):
1. No módulo de substituição, selecione no primeiro campo o "Produto que vai sair".
2. No segundo campo, selecione o "Produto que vai entrar".
3. Na lista de pratos, marque os pratos onde a troca deve ocorrer.
4. Clique em "Substituir ingredientes".
5. Atenção: O sistema exibirá um aviso lembrando que as porções e unidades de medida não mudam. Por exemplo, se a receita pedia 100g do item antigo, ela passará a pedir 100g do novo item automaticamente.
6. Confirme a ação na mensagem de aviso para finalizar.
  

________________


TIP
Dica de Segurança: Sempre que você remove ou substitui um ingrediente, o sistema reavalia automaticamente se os pratos afetados devem continuar disponíveis no cardápio com base no estoque atual da nova matéria-prima.


Estoque
📦 Visão Geral do Controle de Estoque
O módulo de estoque é o coração da sua operação. Ele permite que você saiba exatamente o que tem disponível, o custo do seu inventário e o histórico de uso de cada item.
📝 Editando Itens (Alinhamento com a Realidade)
O botão Editar é sua ferramenta para garantir que o sistema reflita o que realmente está na sua prateleira.
* Por que usar? Use-o para fazer ajustes rápidos. Por exemplo, se uma caixa de frutas estragou ou se houve um vazamento de algum produto, você pode entrar em "Editar" e ajustar o volume atual para alinhar o sistema com a realidade física.
* Dentro da tela de edição, você encontrará campos detalhados para refinar essas informações.
🗑️ O Botão "Excluir" (Segurança de Dados)
Diferente de outros sistemas, o botão Excluir aqui não apaga os dados permanentemente.
* Ele desativa a matéria-prima, movendo-a para uma categoria oculta. Isso evita que você perca o histórico financeiro e de movimentação de um item que você apenas parou de usar temporariamente.
📂 Itens Excluídos
Abaixo da tabela principal, você encontrará o botão Itens Excluídos.
* Ao clicar nele, você verá todos os produtos que foram "excluídos".
* Se decidir voltar a trabalhar com um produto, basta clicar em Restaurar para que ele volte à sua lista ativa de estoque.
🔄 MP Direta vs. MP Indireta
No topo direito, há um botão que alterna entre MP Direta e MP Indireta.
* Matéria-Prima (MP) Direta: São os ingredientes principais que compõem seus pratos e bebidas (carne, legumes, bebidas).
* MP Indireta (Insumos Operacionais): São itens necessários para a operação, mas que não vão diretamente no prato (materiais de limpeza, embalagens, guardanapos).
* Alternar essa visão ajuda a organizar melhor suas compras e conferências.
📜 Log de Movimentação (Histórico Completo)
Quer saber para onde foi o seu estoque? Clique no nome do produto na tabela.
* Isso abrirá um registro detalhado com todas as entradas e saídas daquela matéria-prima, permitindo rastrear exatamente quando e por que o volume mudou.


GUIA PRATICO DE GESTAO DE ESTOQUE E CARDAPIO: EXCLUIR VS. OCULTAR ITENS


Este manual pratico auxilia a equipe de gestao do estabelecimento a manter a organizacao do estoque ativo, garantir o controle financeiro dos insumos e preservar a experiencia do cliente final no cardapio digital.


Aqui, voce entendera a diferenca entre excluir definitivamente um ingrediente e apenas esconder temporariamente um produto em falta.


CENARIO 1: QUERO RETIRAR UM INGREDIENTE PARA SEMPRE (EXCLUSAO DEFINITIVA)


Use a exclusão apenas para insumos ou matérias-primas que sairam de linha e que você não pretende voltar a comprar ou produzir no estabelecimento.


Validação de segurança para receitas ativas:


Para evitar que o cardapio quebre ou que um prato seja vendido sem receita associada, o sistema realiza uma verificação automática:
- Ao clicar em excluir, o sistema verifica se o ingrediente faz parte de alguma receita ativa.
- Caso esteja em uso, a exclusão é interrompida e o sistema exibe um aviso informando em quais pratos o ingrediente ainda esta cadastrado.
- Para prosseguir, acesse a receita dos pratos indicados, remova o ingrediente da receita e volte a tela de estoque para concluir a exclusão.


O que acontece com as informações apos excluir?
O produto saira da lista ativa do painel e as informações históricas serão guardadas na area de "Materias Primas Excluidas" (acessivel atraves do menu de Ações de Estoque).


Nesta area de histórico, os registros de custos e compras passadas ficam disponíveis apenas para consulta e auditoria, em modo de leitura.


Não existe um botão para restaurar o item. Se voce decidir trabalhar novamente com esta matéria-prima no futuro, deverá cadastrá-la novamente atraves da opção "Nova Entrada", iniciando um novo histórico do zero.




CENARIO 2: FIQUEI SEM ESTOQUE DE UM PRODUTO TEMPORARIAMENTE


Se um refrigerante, cerveja ou ingrediente sazonal acabou temporariamente, voce nao deve excluir o produto do estoque. Fazer isso apagara todo o historico de compras e custos medios acumulados, o que prejudica seu fechamento financeiro e balanco patrimonial.


Em vez disso, aplique a ocultacao temporaria seguindo os tres passos abaixo:


Passo 1: Desligue os alertas de reposicao no painel
No formulario de edicao do produto no estoque, mude as configuracoes de aviso:
- Altere o campo "Volume Minimo" para 0.
- Altere o campo "Volume de Indisponibilidade" para 0.
Configurar esses limites como zero indica ao painel que o volume zerado e planejado, impedindo que a linha do produto fique destacada em vermelho no painel do administrador.


Passo 2: Zerar os volumes e valores investidos
- Altere o "Volume em Estoque" para 0.
- Altere o "Custo/Valor Investido" para 0.
Isso impede que o custo antigo do produto interfira no custo do estoque atual.


Passo 3: Esconder o prato do cardapio digital
Para bebidas e produtos de venda direta cuja receita e o proprio produto, evite deixa-los expostos com o aviso "Indisponivel" no menu do cliente.
- Acesse o cadastro do prato e mude a categoria dele para "hide" (ocultar).
- O produto sumira temporariamente do cardapio eletronico visualizado pelos clientes, evitando a sensacao de falta de produtos, mas sua ficha tecnica, historico e registros continuarao guardados no painel de administracao para quando o item for reabastecido.




GUIA RAPIDO DE DECISAO: QUAL CAMINHO SEGUIR?


Quando usar a Exclusao Definitiva?
- O item foi descontinuado do cardapio e nao ha previsao de compra futura.
- E obrigatorio que ele nao esteja em nenhuma receita ativa.
- O historico e movido apenas para consulta na area de itens excluidos.


Quando usar a Ocultacao Temporaria (Categoria "hide")?
- Falta temporaria de estoque de bebidas ou insumos sazonais.
- O produto deve continuar ativo no painel de administracao.
- O historico de custos e compras anteriores e mantido ativo e intacto.
- O produto retorna ao cardapio bastando atualizar o estoque e redefinir a categoria correta.


Lista de ocorrências
Registro de Ocorrências: O Histórico de Vida da sua Matéria-Prima


O popup de Registro de Ocorrências é, na prática, o "diário de bordo" de cada produto no seu estoque. Sempre que você clica no nome de uma matéria-prima na tela principal de estoque, esta janela se abre para mostrar exatamente o que aconteceu com aquele item desde que ele entrou no sistema.
Esta tela não é apenas uma lista de números; é a ferramenta que permite auditar sua operação, entender desperdícios e validar se o seu lucro está sendo protegido.
________________


🛡️ A Importância da Rastreabilidade (O Passo a Passo)
Ter um registro detalhado de cada entrada e saída é vital para qualquer comércio de alimentos e bebidas. Sem isso, o estoque se torna um "buraco negro". A rastreabilidade permite:
1. Identificar Perdas: Entender se um produto está saindo mais por "ajustes manuais" (perdas/desperdícios) do que por vendas reais.
2. Auditoria Financeira: Conferir se o valor investido bate com o volume que entrou.
3. Segurança Operacional: Saber quem alterou o estoque e por qual motivo, garantindo que o sistema reflita sempre a prateleira real.
4. Histórico de Preços: Acompanhar como o custo de um insumo variou ao longo do tempo através das entradas.
________________


🔍 Guia Detalhado das Colunas
Para facilitar a leitura, cada coluna desta tabela traz uma informação específica sobre a movimentação:
* 📅 Data: O registro exato (dia e hora) de quando a movimentação ocorreu. Isso ajuda a identificar turnos ou dias específicos de maior consumo ou movimentação.
* 📥 Entrada do produto: Informa a quantidade física que foi adicionada ao sistema naquela operação (ex: uma nova compra chegando).
* 📤 Saída: Indica quanto do produto foi removido. Isso pode ser automático (através de uma venda no PDV) ou manual (um ajuste de estoque).
* 🏷️ Categoria: Classifica a natureza da operação.
   * Entrada: Compra de novos itens.
   * Venda: Saída automática via pedido.
   * Editado/Ajuste: Quando você alinha o estoque manualmente por algum motivo específico.
* 📊 Vol Anterior: O saldo que você possuía antes dessa ação. É o ponto de partida para a conta fechar.
* 💰 Investimento Anterior: O valor total em Reais (R\$) que você tinha "parado" em estoque daquele item antes da movimentação.
* 📈 Volume Atual: O saldo final que restou em estoque após a operação ser concluída. É o número que aparece na sua prateleira virtual agora.
* 💵 Investimento Atual: O novo valor total investido no seu estoque. Ele é recalculado automaticamente para refletir o novo saldo e os custos de entrada.
* 📝 Anotações ou Embalagens: O campo de observações. Se foi uma edição manual, aqui aparecerá o motivo (ex: "garrafa quebrada"). Se foi uma entrada, pode mostrar a quantidade de fardos ou embalagens originais.
________________


💡 Dica de Ouro
Sempre que notar uma divergência no seu inventário físico, consulte este histórico antes de fazer qualquer ajuste. Muitas vezes, uma saída que parece erro pode ter sido uma venda registrada corretamente ou uma nota de desperdício já lançada por outro colaborador.
________________


Este documento visa auxiliar o comerciante na gestão eficiente de seus recursos e na manutenção de uma operação saudável e lucrativa.


Edição de matéria prima
🎯 Introdução ao Formulário de Edição
Este formulário é a sua principal ferramenta de ajuste fino. Ele permite alinhar a "balança virtual" do sistema com a realidade física das suas prateleiras. Use-o para corrigir quantidades após uma contagem de inventário ou para registrar perdas inesperadas.
________________


📋 Descrição dos Campos e sua Importância
* 📏 Volume Total
   * O que é: A quantidade exata que você tem fisicamente no estoque agora.
   * Importância: É a base para todo o controle. Se este número estiver errado, o sistema não conseguirá prever quando o produto vai acabar.
* 💰 Custo Total
   * O que é: O valor total pago pelo volume que está guardado.
   * Importância: Essencial para o cálculo do seu lucro. O sistema usa este valor para saber quanto custa cada porção servida no prato do cliente.
* ⚠️ Volume Mínimo
   * O que é: O seu "nível de alerta".
   * Importância: Quando o estoque atinge este número, o sistema emitirá avisos de reposição, dando tempo para você comprar mais antes que o item acabe.
* 🚫 Indisponível a partir
   * O que é: O volume crítico de segurança.
   * Importância: É uma trava de segurança. Quando o estoque chega neste nível, o sistema desativa automaticamente no cardápio todos os pratos que dependem deste produto, evitando que você venda algo que não tem como entregar.
* ✍️ Nota sobre a edição
   * O que é: Um campo de texto para registrar o "porquê" da mudança.
   * Importância: Crucial para auditoria. Ao escrever "Descarte por validade" ou "Ajuste após inventário", você e sua equipe saberão no futuro exatamente por que o estoque mudou naquele dia.
________________


✅ Conclusão
Manter estas informações atualizadas garante que sua gestão financeira seja precisa e, acima de tudo, que você nunca seja pego de surpresa pela falta de um ingrediente no meio do serviço.


Despesas
Guia do Módulo de Gerenciamento de Despesas
Bem-vindo ao módulo de Gerenciamento de Despesas. Esta tela centraliza o controle financeiro de saídas do seu negócio, permitindo registrar, filtrar e analisar gastos de forma organizada e adicionar novas despesas.


  

________________


1. Visão Geral (Interface do Usuário)
Ao entrar neste módulo, você encontrará três seções principais:
1. Filtros de Busca: Localizados no topo, envoltos em uma área delimitada para facilitar a identificação.
2. Ações de Cadastro: Botões e seletores para adicionar novas informações ao sistema.
3. Lista de Despesas: A tabela principal que exibe todos os registros financeiros.


Filtros de Busca
	Ações de Cadastro
	Lista de Despesas
	  

	  

	  

	

________________


2. Como Utilizar os Filtros
A área de filtros permite que você localize despesas específicas. Importante: Os filtros funcionam de forma combinada com as datas.
Campos Disponíveis:
* Data Inicial e Final: Essenciais para delimitar o período da consulta.
* Nome da Despesa: Busca pelo tipo de conta (Ex: Aluguel, Luz).
* Fornecedor: Filtra por empresas ou pessoas cadastradas.
* Nota Fiscal: Busca manual pelo número ou identificador da nota.
* Matéria-Prima: Busca específica por itens de estoque adquiridos.


  



IMPORTANTE
Regra de Busca: Para pesquisar por Nota Fiscal, Nome da Despesa ou Fornecedor, é obrigatório preencher o intervalo de datas (Início e Fim).
Exceção: O filtro de Matéria-Prima pode ser utilizado de forma independente do filtro de data em alguns contextos, mas recomenda-se o uso das datas para resultados mais precisos.
Botões de Filtro:
* Filtrar: Aplica os parâmetros selecionados.
* Limpar Filtro: Restaura a lista completa com todos os registros.


  

________________


3. Adicionando Informações
Abaixo dos filtros, você encontrará as ferramentas de entrada de dados:
* Botão "Adicione Despesa": Abre o formulário principal para registrar uma nova despesa financeira imediata.
* Seletor "Selecione uma opção de cadastro": Permite realizar cadastros auxiliares:
   * Cadastrar Produtos: Registra itens que compõem seu estoque.
   * Cadastrar Fornecedores: Registra as empresas de quem você compra.
   * Cadastrar Despesas: Define categorias globais de gastos.


Adicione Despesa
	Selecione uma opção de cadastro
	  

	  

	

________________


4. Entendendo a Lista de Despesas
A tabela principal organiza seus gastos de forma cronológica (do mais recente para o mais antigo).
Colunas Principais:
1. Tipo de Despesa: A categoria do gasto (ex: Insumos, Manutenção).
2. Valor: O montante financeiro do registro.
3. Data: O dia em que a despesa foi registrada ou venceu.
4. Fornecedor: Quem emitiu a cobrança ou forneceu o produto.
5. Nota Fiscal: O comprovante vinculado ao gasto.
6. Ver Itens: Botão para visualizar detalhadamente quais produtos compõem aquela despesa específica.


  

________________


5. Resumo de Totais
No rodapé da lista, o sistema apresenta automaticamente:
* Total Estimado: Soma de todos os valores previstos nos registros exibidos.
* Total Pago: Soma dos valores cuja confirmação de pagamento foi realizada.
________________


TIP
Use este módulo diariamente para manter a saúde financeira do seu bar ou restaurante sempre atualizada e transparente.


6. Configuração: Primeiros Passos
Ao utilizar o módulo pela primeira vez, é fundamental realizar três cadastros básicos. Isso garante que os dados estejam padronizados e evita erros de digitação ao registrar novas despesas.
6.1. Cadastrar Produtos (Insumos e Matérias-Primas)
Acesse através do seletor de cadastro, opção "Cadastrar Produtos". Um popup será exibido com um formulário e a lista de itens já existentes.


  



Campos do Formulário:
* Nome: Identificação clara do item (ex: Arroz, Detergente).
* Volume Mínimo: Quantidade abaixo da qual o sistema deve emitir um alerta de estoque baixo.
* Unidade de Medida: Seleção do padrão (un, L, ml, kg, g).
* Material de Suporte (Checkbox):
   * Marcado: Define o item como um insumo de operação que não compõe diretamente o produto final vendido (ex: papel higiênico, materiais de limpeza).
   * Desmarcado: Define o item como Matéria-Prima, ou seja, algo que faz parte da composição dos seus pratos ou bebidas.
Lista de Itens: Abaixo do formulário, você pode visualizar todos os produtos. No canto direito de cada linha, existem as opções para Editar (ajustar nomes ou volumes) e Excluir (remover do sistema).


  

________________


6.2. Cadastrar Fornecedores
Acesse a opção "Cadastrar Fornecedores". Manter esta lista atualizada é crucial para saber de quem você está comprando e facilitar a organização das notas fiscais.


  



Campos do Formulário:
* Nome: Nome fantasia ou razão social da empresa.
* CNPJ: Cadastro Nacional da Pessoa Jurídica (o sistema formata automaticamente enquanto você digita).


  

________________


6.3. Cadastrar Despesas (Categorias de Gasto)
  



Acesse a opção "Cadastrar Despesas". Aqui você define as categorias recorrentes que aparecerão na hora de lançar um gasto.
Tipos de Despesa:
* Simples: Aquela que possui um único valor fixo ou total por registro (ex: Aluguel).
* Composta: Despesas que são formadas por uma soma de vários sub-itens. Ao selecionar esta opção no cadastro de despesa, você habilita o formulário detalhado de itens no momento do lançamento.
Outros Parâmetros:
* Regularidade: Define se a conta é Mensal (uma vez por mês) ou Recorrente (ocorre várias vezes no mesmo período, como reposição de feira).
* Parcelas: Quantidade de vezes que essa despesa costuma ser paga.
* Descrição: Espaço para explicar a finalidade deste tipo de despesa para futuros administradores.


  

________________




Realizar estes cadastros com atenção no início poupará muito tempo e evitará relatórios inconsistentes no futuro.


7. Lançamento: O Botão Adicione Despesa
Esta é a ferramenta de uso diário onde você registra o dinheiro que sai do caixa. Este formulário é inteligente e se adapta conforme a categoria selecionada.


  

7.1. Comportamento Dinâmico: Simples vs. Composto
A principal característica deste botão é como ele trata o valor total da despesa:
Despesa Simples (ex: Aluguel, IPTU): Ao selecionar uma categoria simples, o formulário exibirá apenas os campos básicos. Você deve digitar manualmente o valor total da conta no campo "Valor".
Despesa Composta (ex: Feira, Supermercado): Ao selecionar uma categoria composta, um novo painel chamado "Adicionar Item" surgirá na parte inferior.
IMPORTANT
Em despesas compostas, você não preenche o campo "Valor" manualmente. O sistema somará automaticamente o custo de cada item que você adicionar à lista, gerando o total final.


Despesa Simples
	Despesa Composta
	  

	  

	

________________


7.2. Detalhamento dos Campos Principais
Ao clicar em "Adicione Despesa", preencha:
1. Selecione uma despesa: Escolha a categoria (já cadastrada no passo de configuração).
2. Valor: O montante financeiro (preenchimento manual apenas para despesas simples).
3. Vencimento: Data limite para pagamento.
4. Data Pagamento: Dia em que o dinheiro saiu efetivamente.
5. Confirmação: Valor que foi de fato pago (útil para conferência posterior).
6. Selecione um fornecedor: Quem está recebendo o pagamento.
7. Nota Fiscal: Identificador do documento fiscal.
8. Selecione o tipo de custo: Informe se é um custo Fixo ou Variável.
  

________________


7.3. Painel "Adicionar Item" (Apenas para Compostas)
Se a despesa for composta, utilize este painel para listar cada produto comprado:
* Selecione um produto: Escolha entre os produtos cadastrados anteriormente.
* Qtd de volumes: Quantos pacotes ou caixas foram adquiridos (ex: 2 fardos).
* Custo por vol: Qual o preço pago por cada um desses pacotes.
* Custo Total: Campo calculado automaticamente (Qtd de volumes × Custo por vol).
* Qtd por volume: Detalhe quanto vem dentro de cada fardo (ex: se comprou 2 fardos e cada um vem 12 latas, coloque 12). Isso atualizará seu estoque com precisão.
Após preencher os dados do item, clique no botão "Adicionar". O item aparecerá na tabela logo abaixo e o valor total da despesa será atualizado no topo.


  

________________


TIP
Lembre-se: O sucesso do controle financeiro depende da precisão dos lançamentos. Use as despesas compostas sempre que precisar detalhar uma compra de múltiplos insumos.




PDV
Manual do Operador - Sistema de PDV (Ponto de Venda)
Este documento descreve as funcionalidades do PDV, desde a criação do pedido no cardápio até a gestão final no painel administrativo.
________________


1. Criação de Pedidos (Lado do Cardápio)
O PDV permite iniciar um atendimento de duas formas principais, garantindo flexibilidade tanto para clientes rápidos quanto para clientes fidelizados.
A. Pedido Anônimo (Nome Fantasia)
Ideal para clientes que não desejam realizar um cadastro completo. Ao selecionar "Continuar sem meus dados", o sistema solicita um Nome Fantasia.
* Como funciona: O sistema cria um registro temporário. Esse nome será usado para identificar o pedido na fila da cozinha e no painel do PDV.
* Dica: Use nomes fáceis ou números de fichas para facilitar a entrega.
*   

B. Pedido via CPF (Cliente Registrado)
Utilizado para clientes já cadastrados no banco de dados.
* Como funciona: Ao digitar o CPF, o sistema busca automaticamente os dados do cliente. Se encontrado, o operador pode confirmar o login e prosseguir.
* Benefício: Permite acumular pontos em programas de fidelidade e promoções personalizadas.


  

________________


2. Painel de Gestão de Fila (PDV Admin)
Após o envio do pedido, ele aparece na Fila de Pedidos (/admin/requestlist). É aqui que a mágica acontece.
Diferença entre Pedido e Itens
* O Pedido (Request): É a "sacola" completa. Contém o nome do cliente, mesa (se houver), valor total e status de pagamento.
* Os Itens (Items): São os pratos ou bebidas individuais dentro do pedido. Cada item possui seu próprio fluxo de produção (cozinha) e status de entrega.


  

________________


3. Funcionalidades e Botões do PDV
Cada botão no painel tem uma função específica para o fluxo de atendimento:
Botão
	Funcionalidade
	Quando usar?
	Expandir / Recolher
	Alterna entre ver apenas o resumo do pedido ou todos os itens detalhados.
	Para organizar a visualização da tela.
	Editar Pedido
	Abre o cardápio com o contexto desse cliente e pedido.
	Quando o cliente quer adicionar ou remover algo de um pedido já enviado.
	Pago
	Altera a cor do pedido para amarelo (Pago), indicando que o acerto financeiro foi feito.
	Assim que o cliente efetua o pagamento no caixa.
	Pronto
	(Para pedidos de balcão) Altera a cor para verde, indicando que tudo está pronto para entrega.
	Quando a cozinha finaliza a produção e o cliente pode retirar.
	Nova Entrega / Pronto
	(Para mesas) Gerencia a entrega dos itens pelo garçom. O botão fica amarelo se houver itens prontos na cozinha aguardando entrega.
	Quando o garçom retira o prato na cozinha para levar à mesa.
	Finalizar
	Encerra o pedido, remove-o da fila ativa e abate os ingredientes do estoque.
	Quando o cliente sai do estabelecimento ou o pedido foi entregue/pago.
	Nota Fiscal
	Gera a visualização para impressão do cupom ou nota fiscal.
	Sempre que o cliente solicitar o comprovante.
	Cancelar Pedido
	Remove o pedido e os dados do usuário (se for anônimo).
	Em casos de desistência ou erro na criação.
	Receita
	(Dentro do item) Exibe os ingredientes e modo de preparo.
	Para tirar dúvidas do cliente sobre alergias ou conferir a montagem.
	Cancelar Item
	Solicita o cancelamento de apenas um prato específico para a cozinha.
	Quando um item individual foi pedido errado ou está em falta.
	TIP
Sugestão de Imagem: Captura detalhada de um card de pedido com todos os botões visíveis, com setas explicativas apontando para cada um.
________________


4. Edição de Pedidos
Uma das funções mais poderosas do PDV é a Edição. Ao clicar em "Editar Pedido", o operador é levado de volta ao cardápio, mas o sistema "lembra" qual pedido está sendo alterado.
* É possível adicionar novos itens, que serão agrupados ao pedido original.
* Ao finalizar a edição, o sistema sincroniza as coleções requests e user automaticamente.
TIP
Sugestão de Imagem: Captura de tela do cardápio em "Modo Edição", mostrando a barra laranja superior indicando o número do pedido que está sendo editado.


Promoções
Guia do Sistema de Promoções - bar-menu.io
Este documento detalha o funcionamento do módulo de promoções, como criá-las e as condições para que sejam aplicadas no PDV.
________________


1. Como Criar uma Promoção
Para criar uma promoção, acesse o painel de administração e preencha o formulário com os seguintes campos:
* Título: O nome que aparecerá no PDV (ex: "Happy Hour").
* Desconto: O valor fixo que será subtraído do total do pedido.
* Data Inicial e Final: Define o período de validade. Se hoje não estiver entre essas datas, a promoção não aparecerá no PDV.
* Reuso: Define se um cliente pode usar a promoção mais de uma vez (leia mais abaixo).
* Valor Mínimo: O valor que o cliente precisa atingir (em um pedido ou acumulado) para "desbloquear" o desconto.
* Regras: Texto descritivo das regras que o atendente verá ao aplicar a promoção.
TIP
Sugestão de Imagem: Um print da tela de criação de promoções destacando os campos principais e as datas.
________________


2. Gerenciando Promoções (Editar e Excluir)
Você pode gerenciar as promoções existentes no campo "Selecione uma promoção para editar".
Editar uma Promoção
* Por que editar?: Modificar as datas é a forma mais prática de fazer uma promoção "sumir" ou "reaparecer" no PDV sem precisar deletá-la.
* Parâmetros Sensíveis: O Valor do Desconto e as Datas são extremamente importantes. Verifique sempre se a data final não expirou caso a promoção não esteja aparecendo.
* Como fazer: Selecione a promoção no menu, altere os campos desejados e clique em "Editar Promoção".
Excluir uma Promoção
* Quando usar: Utilize a exclusão apenas se tiver certeza de que não usará mais aquela promoção ou se desejar limpar a lista de opções.
* Atenção: Esta ação é permanente. O sistema solicitará uma confirmação antes de apagar os dados definitivamente.
________________


3. Condições para a Promoção Aparecer no PDV
Para que uma promoção seja listada no campo de pedidos do PDV, as seguintes condições devem ser atendidas:
1. Pacote Atual: A promoção não aparece no Pacote Básico (Tier 1). Ela está disponível nos pacotes Completo (Tier 2) e Básico + Clientes (Tier 3).
2. Data: O dia atual deve estar dentro do intervalo de Data Inicial e Data Final.
3. Ativação: A promoção deve estar cadastrada corretamente na base de dados.
________________


4. O Campo "Reuso" (Reusable)
Este campo controla a fidelidade e o uso repetido:
* True (Sim): O cliente pode usar essa promoção em cada pedido que fizer, desde que as outras regras sejam cumpridas.
* False (Não): O sistema registra que o cliente já usou o benefício. Se ele tentar usar novamente, um aviso aparecerá informando que a promoção já foi resgatada anteriormente.
________________


5. Promoções para Clientes Cadastrados
As promoções funcionam melhor com clientes cadastrados (ou identificados pelo ID), pois o sistema utiliza o idUser para:
* Verificar se a promoção já foi usada (no caso de Reuso: False).
* Acumular o "score" (valor gasto) para atingir o Valor Mínimo.
Se um cliente for totalmente anônimo e seus dados forem apagados após o pedido, o histórico de promoções usadas será perdido. Em fluxos de mesa, o sistema mantém o vínculo durante a permanência do cliente.
NOTE
Sugestão de Imagem: Um diagrama simples mostrando o fluxo: Cliente faz pedido -> Sistema verifica idUser -> Aplica ou nega promoção baseado no histórico.
________________


6. Voucher de Cadastro (Novos Clientes)
O sistema possui uma promoção fixa para incentivar novos cadastros.
* Como funciona: Quando um cliente se cadastra, o nome dele no PDV torna-se clicável. Ao clicar, o atendente pode aplicar um desconto automático (voucher).
* Configuração: O valor desse desconto é definido no campo "Voucher para clientes que se cadatrarem" no módulo de promoções.
* Desativação: Se o valor for definido como 0, o nome do cliente no PDV deixará de ser clicável, desabilitando a promoção de boas-vindas.
* Regra de Uso: Esta promoção só pode ser usada uma vez por cliente cadastrado.
________________


7. Exemplos de Promoções
Exemplo A: Desconto de Boas-Vindas
* Título: Primeira Visita
* Desconto: 10
* Reuso: False (Para ser usado apenas uma vez)
* Valor Mínimo: 0 (Qualquer valor ganha o desconto)
* Datas: 01/01/2026 a 31/12/2026
Exemplo B: Fidelidade Acumulada
* Título: Cliente VIP \$200
* Desconto: 20
* Reuso: False
* Valor Mínimo: 200 (O cliente precisa ter gasto um total de \$200 para liberar esse desconto)
* Regras: "Ganhe \$20 de desconto após completar \$200 em consumação acumulada."
Exemplo C: Promoção de Verão (Uso recorrente)
* Título: Verão 5 Reais
* Desconto: 5
* Reuso: True
* Valor Mínimo: 50 (Em cada pedido de pelo menos \$50, ganha \$5)
* Datas: 01/12/2025 a 28/02/2026
________________


Dúvidas?
Clique no ícone ? no módulo de promoções para retornar a este guia.
IMPORTANT
Sugestão de Imagem Final: Uma captura de tela do PDV mostrando o seletor de promoções com uma delas selecionada, demonstrando o impacto no valor final.








Apresentação
Resumo de Pacotes de Implementação: Bar-Menu.io
Esta apresentação detalha os módulos disponíveis e a nova estrutura de acessos, projetada para otimizar a gestão, reduzir desperdícios e monitorar o desempenho da equipe em tempo real.
________________


📦 1. Níveis de Implementação (Tiers)
Nossa solução é modular, permitindo que o estabelecimento cresça e adicione funcionalidades conforme a necessidade.
🔹PRATA (Essencial) 3 LOGINS   DE 300,00 R\$ 250,00 
O coração do negócio. Focado na operação ágil do dia a dia.
* O que faz: Gestão de Cardápio Digital, Painel de Pedidos, Integração PDV e Cozinha.
* Identidade Visual: Mesmo no básico, o administrador tem controle total sobre a estilização, podendo aplicar sua logo e cores para que o cardápio reflita a marca da casa.
* Cardápio Modular: Flexibilidade para criar categorias dentro de categorias (ex: Bebidas > Vinhos > Por Nacionalidade > Produtos), além de gerenciar acompanhamentos específicos que podem ser habilitados ou desabilitados por prato.
* Fiscal Integrado: Emissão de NFC-e inclusa, com mecanismo inteligente para decidir quando emitir ou não as notas.
* Lista de Pedidos: Acesso administrativo completo a todos os pedidos realizados no dia e histórico de vendas de sempre.
* Preços: Um preço por produto (ajustável em tempo real). Preços customizados (P/M/G) são um aditivo especial ou brinde para fidelização.
* Objetivo: Agilidade operacional com identidade visual própria, gestão de pedidos histórica e conformidade fiscal.
* Acessos Incluídos: 3 acessos (Dono, PDV e Cozinha/Garçom).
🔹OURO + Gestão de Clientes  OU GESTÃO DE MATERIA PRIMA 6 LOGINS DE 500,00 POR 400,00
Focado em fidelização e inteligência de mercado.
* O que faz: Cadastro detalhado de clientes, histórico de consumo e sistema de promoções direcionadas.
* Módulo de Promoções: O administrador pode criar uma variedade de promoções com datas de início e fim programadas.
* Variedade e Regras: Inclui promoções por valor de desconto, regras de reutilização, valor mínimo para resgate e descritivo de regras personalizadas.
* Vantagem: Permite conhecer quem é o seu cliente frequente e criar estratégias para ele voltar mais vezes através de campanhas sazonais.
🔹 PLATINUM + Gestão de Matéria Prima MAIS GESTÃO DE CIENTES. 10 LOGINS 550,00 POR 450,00
Focado na saúde financeira e operacional do seu estoque.
* Módulo de Despesas & Insumos: Registro completo de matérias-primas e fornecedores. Suporte a despesas únicas ou vinculadas a itens específicos.
* Recalculação Automática: Ao adicionar uma matéria-prima no estoque, o sistema recalcula automaticamente todos os custos baseando-se no valor real pago, garantindo que sua margem de lucro esteja sempre atualizada.
* Receitas e Custo Real: O administrador tem a visão do custo real de cada prato, pois cada ingrediente da receita é computado individualmente. Isso permite entender exatamente o lucro e o gasto por produto.
* Gestão de Crise e Troca de Itens: Ferramenta para filtrar onde cada matéria-prima é usada. Se um item faltar, é possível remover ou trocar a matéria-prima de todos os pratos simultaneamente.
* Cardápio Inteligente: O sistema desabilita automaticamente no cardápio digital os pratos que não possuem matéria-prima em estoque. Isso torna a ferramenta de "troca rápida" essencial para manter as vendas ativas.
* Alertas de Escassez (Warnings): Quando um insumo se aproxima do fim, alertas automáticos são enviados para o PDV e para a Cozinha, garantindo que a equipe e o administrador ajam antes que o item acabe.
* Ajustes Reais de Estoque: Possibilidade de editar manualmente a matéria-prima para corrigir discrepâncias entre o sistema e o mundo real (desperdício, desvios na receita). Todas as edições geram logs com o responsável, garantindo transparência total.
* Vantagem: Controle total sobre o desperdício, lucro real milimetricamente calculado e automação de visibilidade no cardápio.
🔹 MASTER + Gestão de Matéria Prima + Controle Financeiro + GESTA DE CLIENTES E SEM LIMITES DE LOGINS 600,00
A gestão administrativa completa. Nota: Este módulo depende obrigatoriamente da Gestão de Matéria Prima.
* Visão em Tempo Real: O dono acompanha quanto vendeu no dia de qualquer lugar, na palma da mão.
* Detalhamento de Vendas: Relatórios detalhados por produto, acompanhamentos, quantidades e tipos de pagamento.
* Gestão de Taxas: Personalização das taxas de operadoras de cartão para cálculos precisos.
* Números de Gestão: Acesso instantâneo ao número bruto de itens, lucro bruto, lucro real e custo total.
* Vantagem: Visão clara de para onde o dinheiro está indo e qual a margem real de lucro.
🔹 Pacote Completo (Tudo Integrado)
A experiência máxima de gestão. Une a eficiência operacional, o controle rigoroso de estoque/financeiro e o poder da fidelização de clientes em um único ecossistema. Vale ressaltar que o Módulo de Clientes é o único totalmente autônomo, podendo entrar ou sair sem afetar as dependências técnicas dos outros pacotes.
________________


🔐 2. Sistema de Acessos e Permissões
A nova arquitetura de acessos garante que cada funcionário tenha as ferramentas exatas para o seu trabalho, protegendo os dados sensíveis do dono.
🛠️ Perfis de Acesso
Perfil
	Descrição
	Permissões Principais
	👑 Dono (Administrador)
	Acesso total ao sistema contratado.
	Editar pratos, ver financeiro, alterar configurações e gerenciar equipe.
	🖥️ PDV (Caixa)
	Operação de vendas e pagamentos.
	Abrir mesas, cobrar pedidos e visualizar fluxo de pedidos.
	👩‍🍳 Cozinha
	Focado na produção.
	Visualizar fila de pedidos, marcar como pronto e conferir ingredientes.
	📦 Gestão de Estoque
	Administrador de insumos.
	Entrada de nota fiscal, ajuste de estoque e criação de receitas.
	🤝 Gestão de Clientes
	Atendimento e Marketing.
	Cadastrar clientes e gerenciar promoções.
	🏆 Produtividade e Monetização
* Identificação por Login: Cada funcionário (Garçom, Cozinheiro, Caixa) possui seu próprio login e senha.
* Score de Desempenho: O sistema rastreia quem atendeu mais mesas ou quem fechou mais pedidos, permitindo premiações por produtividade.
* Custo por Acesso: O pacote básico inclui 3 acessos fundamentais. Acessos adicionais (ex: ter 5 garçons com logins individuais para separar o score de cada um) são cobrados unitariamente, permitindo escalabilidade justa para o cliente.
________________


💡 Por que este modelo?
1. Segurança: No nível básico, o PDV e a Cozinha não podem editar preços ou nomes de pratos. Somente o perfil de Dono tem esse poder.
2. Transparência: O dono sabe exatamente quem atendeu cada mesa e em quanto tempo.
3. Economia: O cliente paga apenas pelos módulos que realmente agregam valor ao seu momento de negócio.
________________


TIP
Dica para a Reunião: Destaque que o sistema de acessos individualizados não é apenas um "login", mas uma ferramenta de gestão de pessoas para identificar gargalos e premiar os melhores funcionários.




O pacote ideal que inclui o nosso totem e se encaixa nas condições operacionais básicas (agilidade e autossuficiência) é o PRATA (Essencial), que oferece o núcleo da funcionalidade de terminal de autoatendimento.🔹 PRATA (Essencial) com Módulo Totem


Descrição: Focado na operação ágil, o pacote PRATA ativa o sistema principal de cardápio e gestão de pedidos, permitindo configurar o terminal para o autoatendimento.
Módulo
	Funcionalidade e Condições do Totem
	Computador em Modo Totem
	Ativado. Transforma o dispositivo em um ponto de pedidos autônomo. Esta função depende do núcleo de Gestão de Cardápio Digital incluso no PRATA.
	Auto Pagamento (Integração)
	Opcional, mas recomendado. A ativação do Totem idealmente é combinada com o Auto Pagamento para liquidar toda a operação (pedido + pagamento) em um único fluxo. Isso é crucial para a estratégia de economia de mão de obra.
	Cardápio e Visualização
	O administrador tem controle total sobre a estilização e pode aplicar sua logo e cores. A imagem da categoria é essencial neste modo (telas grandes) para atrair o clique do cliente e facilitar a navegação.
	Contingência Operacional
	Em caso de falha no Auto Pagamento, o modo Totem permite que o terminal continue operando como um Cardápio de Pré-Venda, garantindo a autonomia de escolha do cliente até a finalização no caixa físico.
	Base Operacional
	Inclui os módulos de Gestão de Cardápio Digital, Painel de Pedidos, Integração PDV e Cozinha.
	Acessos
	3 LOGINS incluídos (Dono, PDV e Cozinha/Garçom).
	Preço
	ALUGUEL CONTRATO DE 12 MESES  R\$ 750,00 APOS ESSE PRAZO POSSIBILITAMOS A COMPRA POR 4500,00
	

Resumo Financeiro
📊 Guia do Módulo: Resumo Financeiro (Corrida do Lucro)
Olá, parceiro restaurador! Bem-vindo ao seu novo painel de controle financeiro. Este módulo foi desenhado para que você tenha uma visão clara de como seu negócio está "correndo" em direção ao lucro ao longo do mês.
________________


🏁 Visão Mensal vs. 📊 Visão Anual (O "Botão Mágico")
No topo do seu painel, você encontrará o botão "Resumo Anual". Ele é sua bússola para planejar o futuro:
* 📅 Visão Mensal (Padrão): Foco no operacional do dia a dia. Acompanhe se o seu lucro está vencendo o custo fixo hoje.
* 📊 Visão Anual (Projeção): Uma simulação técnica do seu próximo ano. O sistema usa o seu lucro e despesas de um mês de referência e os projeta por 12 meses, somando aos seus Custos Fixos Reais (considerando parcelas agendadas).
________________


📈 Entendendo o Gráfico Principal (Visão Mensal)
O gráfico de linhas é o coração do seu resumo. Ele mostra a evolução acumulativa do seu dinheiro. Imagine que cada dia é um passo em uma corrida:
* 🔴 Linha Vermelha (Vendas): É o seu faturamento bruto. Ela sobe à medida que os pedidos entram. É o fôlego do seu negócio!
* 🟡 Linha Amarela (Custo Fixo): Esta linha mostra o quanto você espera gastar no mês com contas fixas (aluguel, salários, luz, etc.). Ela serve como o seu "alvo" de custos.
* 🟢 Linha Verde (Lucro Real): Esta é a linha mais importante! Ela mostra o que sobra de verdade no seu bolso após descontar o custo dos produtos vendidos e as despesas que você já pagou. Se ela estiver subindo e acima das outras, você está vencendo a corrida!
________________


🧐 Detalhes no Dia a Dia (Tooltip)
Ao passar o mouse sobre qualquer dia do mês no gráfico, um balão de informações (tooltip) aparecerá. Nele você verá exatamente:
* Quanto faturou naquele dia específico.
* Quais contas foram pagas.
* Se houve algum vencimento importante.
________________


🟡 Nódulos Amarelos: Seus Alertas de Pagamento
Reparou em umas "bolinhas" amarelas sobre a linha amarela? Elas são seus Marcadores de Vencimento.
* Each Each bolinha representa um dia em que você tem uma ou mais contas fixas para pagar.
* Facilidade de Pagamento: Ao clicar em uma dessas bolinhas, o sistema abre automaticamente o formulário da despesa. Você pode preencher o valor pago, a data e pronto! O gráfico se atualiza na hora, mostrando que aquela pendência foi resolvida.
________________


📊 Projetando o Futuro (Visão Anual)
Ao ativar a visão anual, o gráfico mostra 12 colunas (uma para cada mês):
* 🟢 Verde (Lucro Estimado): Baseado na performance do seu mês referência.
* 🔴 Vermelho (Variáveis): Estimativa de insumos e taxas.
* 🟡 Amarelo (Fixo Real): O valor exato das contas que você já programou para vencer naquele mês. Se comprou em 3x, o custo aparece apenas nos meses da parcela!
________________


🍕 Analisando o Seu Cardápio e Gastos
No final da página (modo mensal), temos dois mapas fundamentais para sua estratégia:
1. 🍕 Produtos Mais Vendidos (%): Aqui você vê quem são as estrelas da sua cozinha.
   * Dica: Use isso para identificar pratos que vendem pouco (irrelevantes) e decidir se vale a pena mantê-los no menu ou investir em marketing para eles.
2. 💸 Distribuição de Gastos: Descubra para onde seu dinheiro está fugindo.
   * Dica: Veja quais categorias ou fornecedores mais pesam no seu orçamento e use essa informação para renegociar preços ou buscar alternativas.
________________


💡 Dica de Mestre
Use o Resumo Financeiro para antecipar problemas. Se a linha verde estiver demorando a subir, talvez seja hora de uma promoção relâmpago ou de conferir se não houve um gasto inesperado!
Boas vendas e muito lucro! 🚀


Delivery
Guia da Funcionalidade: Pedidos de Entrega (Delivery)
Este documento foi criado para orientar a gerência do estabelecimento sobre o funcionamento e as regras da nova funcionalidade de Entrega integrada ao sistema Bar-Menu.io.
1. Regras para o Aparecimento do Botão de Entrega
Para garantir a segurança da operação e evitar erros de pedido, o botão ENTREGA só fica visível para o cliente quando as seguintes condições são atendidas:
1. Acesso via Celular do Cliente: A funcionalidade é exclusiva para a interface que o cliente acessa. No computador do balcão (PDV), o botão não aparece para evitar que pedidos de entrega sejam registrados por engano no fluxo de consumo local.
2. Gestão de Clientes Ativa: É necessário que a opção de cadastro de clientes esteja habilitada nas configurações do seu estabelecimento.
3. Plano de Serviço Adequado: Esta funcionalidade faz parte dos planos de serviço avançados do sistema. Certifique-se de que seu plano suporte atendimentos via Delivery.
4. Cliente Fora de Mesa: O sistema é inteligente: se o cliente estiver sentado em uma mesa (tendo acessado via QR Code da mesa), a opção de Entrega é ocultada automaticamente. Entende-se que, se ele está na mesa, o pedido é para consumo imediato no local.
________________


2. Como Funciona a Validação do Endereço
Ao selecionar a opção ENTREGA, o sistema solicita os dados de destino de forma simplificada:
* Busca por CEP: Ao digitar o CEP, o sistema consulta instantaneamente as bases de dados e preenche automaticamente o nome da Rua e o Bairro. Isso evita erros de digitação e agiliza o pedido para o cliente.
* Dados Obrigatórios: O cliente deve obrigatoriamente informar o Número. Existe também um campo para Complemento (ex: "Apartamento 42", "Portão Azul"), que auxilia o motoboy na localização.
________________


3. Inteligência Geográfica e Raio de Entrega
O sistema possui uma ferramenta de cálculo de distância integrada para proteger sua logística:
1. Localização Precisa: O sistema identifica a posição exata (coordenadas) do endereço do cliente através de mapas integrados.
2. Cálculo de Distância: É feita uma comparação automática entre a localização do seu restaurante e o endereço do cliente.
3. Limite de Entrega (Raio de 2km): Atualmente, para manter a qualidade e o tempo de entrega, o sistema está configurado para aceitar pedidos em um raio de até 2km. Se o cliente estiver além dessa distância, o sistema o informará educadamente que o endereço está fora da área de cobertura atual.
________________


4. Fluxo de Informação: Da Cozinha ao Entregador
Assim que o pedido é confirmado, a informação flui para as áreas operacionais:
Na Cozinha e Preparo
O pedido de entrega ganha destaque visual imediato:
* Aparece com uma etiqueta amarela escrita 📍 ENTREGA.
* O endereço completo, bairro e número ficam visíveis logo abaixo dos dados do cliente.
* Botão "Abrir Rota no Maps": Esta é uma ferramenta poderosa para o seu entregador. Ao clicar, o sistema abre o Google Maps já com o trajeto traçado do restaurante até a porta do cliente, facilitando o trabalho da logística.
No Caixa (PDV)
O pedido entra na listagem geral identificado como "Entrega". Por padrão, ele entra como "Aguardando Pagamento", permitindo que o caixa finalize o recebimento no momento em que o entregador retornar ou conforme a política do estabelecimento.
________________


5. Histórico e Gestão de Clientes
Todas as entregas ficam registradas no Módulo de Gestão de Clientes:
* Histórico de Pedidos: Ao consultar um cliente específico na sua base de dados, você poderá ver todas as entregas já realizadas para ele.
* Dados Estratégicos: O banco de dados armazena o endereço de cada pedido, permitindo que você identifique quais bairros e regiões estão gerando mais vendas para o seu negócio através do Delivery.
* Suporte ao Cliente: Caso um cliente tenha dúvidas sobre como preencher os dados, o formulário de cadastro conta com um ícone de interrogação que serve como um guia rápido de suporte.


Cozinha
________________


👨‍🍳 Guia Operacional da Cozinha - Geração z
1. Gestão de Pedidos Recebidos
Todo prato solicitado por um cliente ou garçom aparecerá instantaneamente no seu painel. Organize sua produção baseando-se na ordem de chegada e na prioridade dos itens. Fique atento às cores e descrições!
2. O Cronômetro de Produção (Timer) ⏱️
Cada item possui um marcador de tempo individual. Ele mostra há quantos minutos o pedido foi registrado. Use isso para garantir que nenhum cliente espere além do tempo aceitável e para manter o padrão de qualidade da casa. Pedidos com tempo alto devem ser priorizados.
3. Fluxo de Despacho e Entrega
* Botão PRONTO: Deve ser clicado no exato momento em que o prato é finalizado e colocado na área de saída (pass). Isso notifica o salão e o PDV imediatamente de que o item está pronto para ser levado.
* Botão ENTREGUE: Deve ser clicado apenas após a confirmação de que o prato chegou à mesa. Esse clique remove o item da sua lista ativa, mantendo seu painel focado apenas no que ainda precisa ser feito.
4. Cancelamentos e Alertas Vermelhos 🛑
Caso um item apareça destacado em VERMELHO, ele foi cancelado pelo sistema ou pelo garçom. Interrompa o preparo imediatamente! O sistema faz esse bloqueio visual para evitar desperdício de insumos e perda de tempo.
5. Consulta de Receitas e Fichas Técnicas
Para manter o padrão de montagem e sabor, as receitas (ingredientes e modo de fazer) estão disponíveis exclusivamente no módulo de Gerenciamento de Matéria-Prima no menu do Administrador. Consulte essas fichas sempre que tiver dúvida sobre a montagem de um prato novo ou específico.
________________


Este guia foi pensado para manter a comunicação entre cozinha, salão e caixa 100% afinada. Bom trabalho!






Lista de Clientes
Documentação: Módulo de Gestão de Clientes
O Módulo de Gestão de Clientes é uma ferramenta estratégica projetada para transformar dados brutos em inteligência de negócio. Mais do que uma simples lista, ele permite um acompanhamento detalhado da jornada de cada cliente em seu estabelecimento.
Proposta e Benefícios
A lista centraliza informações essenciais como Nome, Telefone, CPF e Data de Nascimento. O grande diferencial, no entanto, é o acompanhamento do histórico de consumo ao longo do tempo.
Ao entender o que e quando seus clientes consomem, você ganha o poder de:
* Fidelizar: Identificar seus clientes mais fiéis e oferecer mimos ou tratamentos diferenciados.
* Marketing Direcionado: Usar o telefone para comunicações diretas e personalizadas.
* Previsibilidade: Entender padrões de consumo para preparar melhor seu estoque e equipe.
Funcionalidades
* Resumo do Cliente: Clique sobre o nome de qualquer cliente para abrir um resumo detalhado, incluindo seus dados cadastrais e todos os pedidos realizados.
* Origem dos Dados: Os clientes listados são frutos dos cadastros realizados em seu sistema, garantindo uma base de dados orgânica e valiosa.
Gestão de Dados: Botão "Excluir Anônimos"
Sua lista pode conter registros marcados como "anonimo". Entender a diferença entre eles e seus clientes cadastrados é fundamental para uma base limpa:
* O que são usuários anônimos? São perfis temporários criados automaticamente pelo sistema quando um pedido é feito sem um login formal (comum em pedidos rápidos ou via Totem). Eles servem apenas para processar a venda momentânea.
* Por que excluir? Como esses perfis não possuem dados reais de contato (email/telefone), eles não podem ser usados em campanhas de marketing ou fidelização.
* Ação: Utilize o botão "Excluir Anônimos" periodicamente para limpar esses registros "fantasmas". Isso garante que sua lista contenha apenas clientes reais e qualificados, facilitando a gestão estratégica e a análise de consumo.


Integração Estratégica
Este módulo atinge seu potencial máximo quando combinado com o Módulo de Promoções. Essa combinação é uma poderosa alavanca de vendas:
* Crie promoções exclusivas para aniversariantes do mês.
* Ofereça cupons de desconto para clientes que não compram há algum tempo.
* Recompense o volume de consumo com benefícios exclusivos.


TIP
Leitura Obrigatória: Para aproveitar essas alavancas de vendas, é fundamental ler a documentação do Módulo de Promoções. Lá você encontrará as regras de implementação para essas estratégias.
________________


Este documento serve como guia para o uso profissional e elegante da sua base de clientes.


Marca e Estilo
🎨 Guia de Identidade Visual (Documentação Completa)
✨ O Poder da Personalização Instantânea
É maravilhoso ter o poder de modificar o estilo do seu site sem complicações e com total facilidade! Você não precisa de conhecimentos técnicos para deixar o seu cardápio digital com a "cara" do seu negócio. Essa flexibilidade permite que sua marca evolua e se adapte a campanhas ou datas comemorativas em segundos.
________________


🎨 A Importância da Identidade Visual
A harmonia entre as cores do seu site e o seu logotipo é fundamental para criar uma Identidade de Marca forte.
* Identificação Imediata: Ao usar nos botões e títulos as mesmas cores que já estão no seu logotipo, você cria um ambiente profissional e familiar. O cliente sente que está no lugar certo, o que gera confiança.
* Consistência Profissional: Um site que respeita uma paleta de cores fixa transmite muito mais credibilidade do que um site com cores aleatórias.
________________


🔍 Guia dos Campos de Estilo
* 🖼️ Logotipo do Restaurante
   * É a sua assinatura. Certifique-se de que a imagem esteja nítida, pois ela será o ponto central de identificação visual no topo do site e no terminal.
* 🔘 Cor dos botões
   * Esta é a sua cor de "ação". Recomendamos usar a cor mais vibrante do seu logotipo aqui para destacar onde o cliente deve clicar para fazer o pedido.
* 🌑 Cor de Fundo (Geral e Secundário)
   * Define a atmosfera do site. Use cores que permitam uma boa leitura. O fundo secundário ajuda a separar visualmente as categorias e os pratos, criando uma navegação mais organizada.
* ✍️ Cores de Texto e Títulos
   * Garantem que a informação chegue clara ao cliente. Utilize cores que se destaquem bem sobre o fundo escolhido para evitar cansaço visual.
* 🔤 Fontes (Tipografia)
   * O estilo das letras comunica a personalidade do seu restaurante: fontes modernas, clássicas ou descontraídas. Escolha aquelas que melhor representam o seu atendimento.
________________


✅ Conclusão
Assuma o comando da sua marca! Use esta tela para experimentar e encontrar a combinação perfeita que fará seus clientes se apaixonarem pelo seu restaurante antes mesmo de provarem a comida.


Vendas
📈 Guia de Gestão de Vendas (Documentação Completa)


🚀 A Liberdade de Gerir de Qualquer Lugar
É uma maravilha poder acompanhar suas vendas passo a passo, de qualquer lugar que você esteja! Seja em casa, em uma viagem ou no próprio restaurante, você tem o pulso do seu negócio em tempo real. Essa mobilidade garante que você nunca perca o controle sobre o que está acontecendo na sua operação.
________________


🗓️ Filtros de Data: O Coração da sua Análise
Os filtros de data são as ferramentas mais importantes para entender os ciclos do seu negócio.
* 📅 Data Inicial e Final: Estes campos permitem que você isole períodos específicos para análise.
   * Por que é importante? Você pode comparar o movimento de um feriado com um dia útil, verificar se uma promoção de final de semana deu resultado ou extrair o fechamento exato do mês para contabilidade. O poder de filtrar permite que você veja o que os números gerais muitas vezes escondem.
________________


📊 Entendendo seu Relatório (Colunas)
Embora o relatório seja autoexplicativo, cada coluna traz um detalhe crucial para o seu lucro:
* 🍽️ Nome: Identifica qual produto está sendo analisado.
* 🔢 Quantidade: Mostra o volume de saída. Ajuda a identificar os seus "queridinhos" do público.
* 💰 Valor Total: O faturamento bruto (dinheiro que entrou em caixa).
* 💳 Cartão: Uma estimativa das taxas de transação descontadas, dando uma visão mais real do que sobra.
* 📉 Custo: O valor investido em matéria-prima para produzir aquelas vendas.
* 📈 Lucro: O saldo real que fica para o restaurante após descontar custos e taxas.
* 🎟️ Desconto: Mostra o impacto de vouchers e promoções no faturamento final.
________________


✅ Conclusão
Use esses dados para tomar decisões baseadas em fatos, não em palpites. Se um prato tem muita saída, mas pouco lucro, talvez seja hora de ajustar o preço. Se um item quase não vende, talvez seja hora de removê-lo ou promovê-lo melhor. O conhecimento é o seu maior aliado!


Fechamento de Caixa
💵 Guia de Fechamento de Caixa (Documentação Completa)


🎯 Introdução ao Fechamento de Caixa
O Fechamento de Caixa é a ferramenta indispensável para garantir que o dinheiro que entrou no seu restaurante bate exatamente com o que o sistema registrou. É a auditoria diária que protege a saúde financeira do seu negócio e garante que nada "se perca" entre o pedido e o recebimento.
________________


❓ Qual a diferença entre Gestão de Vendas e Fechamento de Caixa?
Embora usem dados parecidos, eles servem a propósitos bem diferentes:
1. Gestão de Vendas (O que foi vendido?):
   * Foca no desempenho dos produtos. Ele agrupa as vendas por prato (ex: "vendi 50 burgers hoje").
   * É perfeito para análise de cardápio, custos de matéria-prima e para saber quais receitas dão mais lucro.
2. Fechamento de Caixa (Como o dinheiro entrou?):
   * Foca no fluxo financeiro e nos métodos de pagamento. Ele detalha cada transação individualmente (venda por venda), mostrando o horário e o valor exato.
   * A principal função aqui é o conferência de caixa: saber exatamente quanto entrou em Pix, Cartão de Crédito, Débito ou Dinheiro. É a ferramenta que você usa no final do expediente para conferir se o valor na gaveta e na maquininha bate com o sistema.
________________


🗓️ A Importância dos Filtros de Data
Sem os filtros, o fechamento seria impossível de gerir.
* Data Inicial e Final: Permitem realizar fechamentos diários, semanais ou mensais. Você pode auditar turnos específicos ou consolidar o faturamento de um período contábil completo com precisão absoluta.
________________


📊 Resumo por Modalidade
O quadro de totais no topo desta tela consolida os valores por método de pagamento. Isso elimina a necessidade de somar manualmente os comprovantes de cartão ou as transferências Pix, economizando tempo e evitando erros humanos no final do seu dia.
________________


✅ Conclusão
Utilize o Fechamento de Caixa como sua segurança financeira diária. Um caixa bem fechado é o primeiro passo para um negócio lucrativo e sem sustos no final do mês.


Configuação de Terminal
⚙️ Guia de Configurações do Terminal e Logística (Documentação)


⚠️ A Responsabilidade das Configurações
Cada opção nesta tela carrega uma grande responsabilidade, pois altera drasticamente a experiência do seu cliente ou a rotina da sua equipe. Defina com cuidado a "personalidade" deste terminal.
________________


🛠️ Detalhamento dos Parâmetros
* 🖥️ Computador em modo Toten
   * Finalidade Principal: Transformar o dispositivo em um ponto de pedidos autônomo.
   * 💡 A Estratégia do Toten: De forma geral, não faz sentido selecionar o modo Toten sem selecionar o Auto Pagamento, pois quem utiliza um totem deseja liquidar toda a operação (pedido + pagamento) em um único fluxo.
   * 🛡️ O Plano B (Independência): No entanto, essas opções existem separadamente por um motivo de segurança operacional. Se a sua máquina de auto pagamento apresentar qualquer falha técnica, você pode desmarcar o "Auto Pagamento" e manter o "Toten" ativo. Dessa forma, o terminal continua operando como um Cardápio de Pré-Venda, permitindo que o cliente mantenha sua autonomia de escolha mesmo sem usar o próprio celular, restando apenas a finalização do pagamento no caixa físico.
   * * 💳 Auto Pagamento
   * O que faz: Habilita a integração direta com a máquina física de cartões.
   * Responsabilidade: Agiliza a operação e reduz filas, permitindo que o cliente pague por conta própria sem depender de um atendente humano.
* 🛒 PDV (Ponto de Venda)
   * O que faz: Ativa a interface de trabalho oficial para o caixa do seu restaurante.
   * Responsabilidade: Este é o centro de operação. No modo PDV, sua equipe tem acesso total à gestão de mesas, pedidos externos e controle financeiro manual.
* 🧾 Emissão de Notas Automática (NFC-e)
   * O que faz: Automação fiscal instantânea.
   * Responsabilidade (IMPORTANTE): Esta é uma Configuração Global. Ao ativar, o sistema emitirá o cupom fiscal eletrônico automaticamente logo após a confirmação do pagamento. Garante que seu negócio esteja sempre em conformidade com a lei, sem esforço manual.
________________


🚚 Logística e Entrega
* 📍 CEP do Estabelecimento
   * O que faz: Define a origem oficial do seu restaurante no mapa.
   * Responsabilidade: É o "ponto zero" para o cálculo de rotas. Sem este dado correto, o sistema não conseguirá calcular valores de frete ou se um CEP de entrega é atendido por você.
* 📏 Distância Máxima (Km)
   * O que faz: Define o raio máximo de atendimento do seu delivery.
   * Responsabilidade: Crucial para manter a qualidade da entrega. Ao definir um limite (ex: 5km), o sistema bloqueia automaticamente pedidos que ficariam muito distantes, protegendo sua margem de lucro e garantindo que a comida chegue quente ao cliente.


Saudação Inicial
👋 Guia: Saudação Inicial e Brinde
Este módulo foi projetado para ser o seu primeiro "aperto de mão" com o cliente. Ele é fundamental para transformar visitantes anônimos em clientes cadastrados e fiéis.
1. Mensagem de Saudação
É a frase que aparece no topo da tela de login e cadastro.
* Objetivo: Transmitir a identidade da sua marca logo de cara.
* Dica de Ouro: Em vez de usar apenas "Bem-vindo", tente algo mais caloroso ou que instigue o desejo (ex: "Pronto para saborear o melhor da culinária artesanal?" ou "Seja bem-vindo à família [Nome do Local]! 👋").
* Visibilidade: Esta mensagem é pública e aparece para todos que acessam o link do seu cardápio antes de fazerem o login.
2. Descrição do Brinde (Incentivo ao Cadastro)
Este é um dos campos mais estratégicos do seu sistema. Ele serve como um "ímã de dados".
* O que é: Um texto curto explicando o benefício que o cliente recebe se ele decidir se cadastrar agora.
* Por que usar: Capturar o e-mail e telefone do cliente permite que você faça um marketing muito mais eficiente depois. Mas o cliente precisa de um motivo para "pagar" com seus dados.
* Sugestões de Sucesso:
   * "Cadastre-se agora e ganhe uma sobremesa grátis no seu primeiro pedido!"
   * "Faça seu login e receba 10% de desconto imediato!"
   * "Crie sua conta e participe do nosso Clube de Fidelidade VIP."
3. Impacto no Negócio
Um sistema com uma saudação personalizada e um brinde claro tem uma taxa de conversão de cadastro até 40% maior do que sistemas que apenas pedem o login. Use isso para construir sua base de clientes!\n`;

export default SYSTEM_HELP_DOCUMENT;
