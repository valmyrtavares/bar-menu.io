import { SYSTEM_HELP_DOCUMENT, SCREEN_DOCUMENTATION_MAP } from '../assets/docs/systemHelpDoc';

/**
 * Serviço de Ajuda Inteligente que responde a dúvidas do administrador.
 * 
 * @param {string} userQuestion - Pergunta do usuário.
 * @param {string} [screenContext] - Rota ou nome da tela atual (ex: '/admin/request').
 * @returns {Promise<{answer: string, isAiGenerated: boolean, faqSuggestions: string[]}>}
 */
export async function askSystemAssistant(userQuestion, screenContext = '') {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const activeScreenDoc = findScreenDoc(screenContext);

  // 1. Tentar chamada via API da IA do Gemini se a chave estiver configurada
  if (apiKey) {
    try {
      const systemPrompt = `Você é o Assistente Virtual Oficial do sistema "bar-menu.io".
Sua função é orientar o administrador de forma OBJETIVA e PASSO A PASSO.

DOCUMENTAÇÃO BASE DO SISTEMA:
${SYSTEM_HELP_DOCUMENT}

INFORMAÇÕES DA TELA ATUAL EM QUE O USUÁRIO ESTÁ (${screenContext || 'Geral'}):
${activeScreenDoc ? `${activeScreenDoc.title}: ${activeScreenDoc.description}` : 'Nenhuma tela específica.'}

REGRAS:
1. Responda em Português do Brasil com tom profissional e solicito.
2. Formate as respostas em tópicos e passos numerados claros.
3. Se o usuário perguntar sobre "essa tela", explique a função da tela atual (${activeScreenDoc?.title || 'a tela atual'}).
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemPrompt },
                  { text: `Pergunta do Usuário: ${userQuestion}` },
                ],
              },
            ],
            generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return {
            answer: candidateText.trim(),
            isAiGenerated: true,
            faqSuggestions: activeScreenDoc?.faq || [],
          };
        }
      }
    } catch (err) {
      console.warn('Falha na requisição da IA, utilizando motor de busca local:', err);
    }
  }

  // 2. Motor de Busca de Conhecimento Local (Busca Contextual e Inteligente sem necessidade de API Key)
  const localAnswer = generateLocalKnowledgeAnswer(userQuestion, screenContext, activeScreenDoc);
  return {
    answer: localAnswer,
    isAiGenerated: false,
    faqSuggestions: activeScreenDoc?.faq || [],
  };
}

/**
 * Encontra a documentação da tela com base na rota atual.
 */
export function findScreenDoc(screenContext) {
  if (!screenContext) return null;
  const path = typeof screenContext === 'string' ? screenContext.toLowerCase() : '';
  
  // Tentar bater a rota exata ou parcial
  for (const [routeKey, doc] of Object.entries(SCREEN_DOCUMENTATION_MAP)) {
    if (path.includes(routeKey.toLowerCase()) || routeKey.toLowerCase().includes(path)) {
      return doc;
    }
  }

  // Fallback por palavra-chave da rota
  if (path.includes('request') || path.includes('venda')) return SCREEN_DOCUMENTATION_MAP['/admin/request'];
  if (path.includes('stock') || path.includes('estoque')) return SCREEN_DOCUMENTATION_MAP['/admin/stock'];
  if (path.includes('item') || path.includes('prato')) return SCREEN_DOCUMENTATION_MAP['/admin/item'];
  if (path.includes('recipe') || path.includes('receita')) return SCREEN_DOCUMENTATION_MAP['/admin/managementRecipes'];
  if (path.includes('customer') || path.includes('cliente')) return SCREEN_DOCUMENTATION_MAP['/admin/customer'];
  if (path.includes('expense') || path.includes('despesa')) return SCREEN_DOCUMENTATION_MAP['/admin/expenses'];
  if (path.includes('sell-flow') || path.includes('caixa')) return SCREEN_DOCUMENTATION_MAP['/admin/sell-flow'];

  return null;
}

/**
 * Resposta contextualizada por palavras-chave e tela ativa.
 */
function generateLocalKnowledgeAnswer(userQuestion, screenContext, activeScreenDoc) {
  const q = userQuestion.toLowerCase().trim();

  // Perguntas sobre "essa tela", "para que serve", "o que faz", "como funciona essa pagina"
  if (
    q.includes('essa tela') ||
    q.includes('esta tela') ||
    q.includes('para que serve') ||
    q.includes('o que e isso') ||
    q.includes('o que faz') ||
    q.includes('como funciona') ||
    q === 'ajuda' ||
    q === 'socorro'
  ) {
    if (activeScreenDoc) {
      return `📌 **${activeScreenDoc.title}**\n\n${activeScreenDoc.description}`;
    }
  }

  // Perguntas sobre cadastro de produtos
  if (q.includes('produto') || q.includes('cardapio') || q.includes('prato') || q.includes('cadastrar')) {
    if (q.includes('tamanho') || q.includes('preco') || q.includes('preço') || q.includes('porcao') || q.includes('porção')) {
      return `**Como cadastrar preços por tamanho ou porções:**\n\n1. No menu do administrador, acesse a opção **"Preço Customizado"** ou **"Preço por Tamanho"**.\n2. Escolha o produto que deseja configurar na lista.\n3. Adicione as variações (ex: P, M, G ou 300ml, 500ml, 1L).\n4. Informe o valor correspondente de cada variação e clique em **Salvar**.\n\n*As opções de tamanho ficarão visíveis para o cliente ao selecionar o item no cardápio.*`;
    }
    if (q.includes('editar') || q.includes('excluir') || q.includes('deletar') || q.includes('mudar')) {
      return `**Como editar ou excluir um produto:**\n\n1. No menu do administrador, clique em **"Edite seus pratos"** (ou Lista para Editar e Deletar).\n2. Localize o produto desejado.\n3. Clique no ícone de **Lápis** para editar nome, preço ou foto.\n4. Clique no ícone da **Lixeira** para excluir o produto do cardápio.`;
    }
    return `**Como cadastrar um novo produto no cardápio:**\n\n1. Acesse o **Painel do Administrador**.\n2. No menu lateral, clique em **"Adicione um prato"**.\n3. Preencha o Nome do produto, Descrição, Categoria e Preço principal.\n4. Faça o upload da Imagem do produto.\n5. Clique em **Salvar** ou **Cadastrar**.`;
  }

  // Perguntas sobre vendas / faturamento
  if (q.includes('venda') || q.includes('faturamento') || q.includes('lucro') || q.includes('relatorio') || q.includes('relatório')) {
    return `**Como consultar vendas e relatórios financeiros:**\n\n1. No menu do administrador, acesse a tela de **"Vendas"** (\`/admin/request\`).\n2. Escolha a **Data Inicial** e a **Data Final** para filtrar o período.\n3. A tabela exibirá a quantidade vendida, total arrecadado, custos de insumos, taxas de cartão e o **lucro líquido**.\n4. Na linha inferior de **Total**, você verá o resumo geral do período selecionado.`;
  }

  // Perguntas sobre estoque e matéria-prima
  if (q.includes('estoque') || q.includes('insumo') || q.includes('compra') || q.includes('entrada') || q.includes('ajuste')) {
    return `**Como gerenciar o estoque de insumos:**\n\n1. No menu do administrador, vá em **"Estoque"**.\n2. Para registrar compras: acesse **"Entrada de Estoque"**, selecione o insumo, digite a quantidade e valor total pago.\n3. Para correções (perdas ou validades): use a tela de **"Ajuste de Estoque"** e insira a nova quantidade real.\n4. Para acompanhar o histórico: veja a aba **"Histórico de Movimentações"**.`;
  }

  // Perguntas sobre impostos e fiscal
  if (q.includes('fiscal') || q.includes('ncm') || q.includes('cest') || q.includes('imposto') || q.includes('nota')) {
    return `**Como configurar atributos fiscais (NCM/Impostos):**\n\n1. Acesse a tela de **"Atributos Fiscais"** no menu do administrador (ou clique no alerta de pendências fiscais).\n2. Selecione o produto na lista.\n3. Preencha os códigos **NCM**, **CEST** e a **Origem da Mercadoria**.\n4. Clique em **Salvar** para liberar a emissão correta de NFC-e / Cupons Fiscais.`;
  }

  // Perguntas sobre receitas / ficha técnica
  if (q.includes('receita') || q.includes('ficha') || q.includes('tecnica') || q.includes('técnica') || q.includes('baixa')) {
    return `**Como criar a Ficha Técnica / Receita dos pratos:**\n\n1. Acesse **"Gestão de Receitas"** no menu do administrador.\n2. Escolha o prato do cardápio.\n3. Adicione cada matéria-prima usada (ex: 200g de carne, 1 pão, 50g de queijo).\n4. Salve a receita. Sempre que esse prato for vendido, os insumos serão baixados automaticamente do estoque.`;
  }

  // Perguntas sobre despesas e fornecedores
  if (q.includes('despesa') || q.includes('fornecedor') || q.includes('conta') || q.includes('pagar')) {
    return `**Como registrar despesas e fornecedores:**\n\n1. Acesse **"Despesas"** no menu do administrador.\n2. Para novos fornecedores: clique em **"Cadastrar Fornecedor"**.\n3. Para lançar um custo: clique em **"Registrar Despesa"**, informe o fornecedor, valor, vencimento e categoria.\n4. Salve para acompanhar no fluxo financeiro.`;
  }

  // Se houver uma documentação de tela ativa, responder sobre ela
  if (activeScreenDoc) {
    return `📌 **${activeScreenDoc.title}**\n\n${activeScreenDoc.description}\n\n*Dica: Você também pode fazer perguntas específicas sobre cadastro de produtos, preços por tamanho, estoque, vendas ou despesas.*`;
  }

  // Resposta padrão caso nenhuma palavra corresponda
  return `**Como podemos te ajudar no bar-menu.io?**\n\n- Para saber sobre a tela atual, pergunte: *"Para que serve essa tela?"*\n- Para cadastrar itens: *"Como cadastrar um produto?"*\n- Para preços por tamanho: *"Como cadastrar preços por tamanho?"*\n- Para estoque: *"Como dar entrada de estoque?"*\n- Para vendas: *"Como consultar vendas por período?"*`;
}
