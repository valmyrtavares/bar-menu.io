import { SYSTEM_HELP_DOCUMENT, SCREEN_DOCUMENTATION_MAP } from '../assets/docs/systemHelpDoc';
import { db } from '../config-firebase/firebase';
import { collection, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { addDoc, deleteDoc } from '../api/FirestoreInterceptor';

// Lista estruturada de artigos para o buscador semântico offline
const HELP_ARTICLES = [
  {
    id: 'edit_dish',
    title: 'Alterar Imagem, Nome ou Preço de um Prato Existente',
    keywords: [
      'editar', 'edito', 'edite', 'alterar', 'altero', 'mudar', 'mudo', 'trocar', 'troco', 
      'imagem', 'foto', 'foto', 'pic', 'capa', 'upload', 'prato', 'produto', 'item', 'lixeira', 
      'excluir', 'deletar', 'remover'
    ],
    content: `**Como editar ou alterar a imagem de um prato já existente:**\n\n1. Acesse o **Painel do Administrador**.\n2. No menu lateral, clique em **"Edite seus pratos"** (ou Lista para Editar e Deletar).\n3. Encontre o prato desejado na lista.\n4. Clique no ícone de **Lápis (Editar)** ao lado do prato.\n5. Clique no campo de imagem para fazer o upload da **nova foto**, ou altere o preço/nome.\n6. Clique em **Salvar** para atualizar o prato no cardápio.\n\n*(Para remover o prato definitivamente, clique no ícone de Lixeira).*`
  },
  {
    id: 'create_dish',
    title: 'Cadastrar Novo Produto ou Prato',
    keywords: [
      'cadastrar', 'cadastro', 'criar', 'incluir', 'adicionar', 'adiciono', 'novo', 'prato', 
      'produto', 'item', 'cardapio', 'cardápio', 'bebida', 'lanche', 'porção'
    ],
    content: `**Como cadastrar um novo produto no cardápio:**\n\n1. Acesse o **Painel do Administrador**.\n2. No menu lateral, clique em **"Adicione um prato"**.\n3. Preencha o Nome do produto, Descrição, Categoria e Preço principal.\n4. Faça o upload da Imagem do produto.\n5. Clique em **Salvar** ou **Cadastrar**.`
  },
  {
    id: 'size_prices',
    title: 'Cadastrar Preços por Tamanho ou Porção',
    keywords: [
      'tamanho', 'tamanhos', 'porção', 'porcao', 'porções', 'porcoes', 'customizado', 
      'variacao', 'variação', 'preço', 'preco', 'preços', 'precos', 'p', 'm', 'g', 'ml', 'litro'
    ],
    content: `**Como cadastrar preços por tamanho ou porções:**\n\n1. No menu do administrador, acesse a opção **"Preço Customizado"** ou **"Preço por Tamanho"**.\n2. Escolha o produto que deseja configurar na lista.\n3. Adicione as variações (ex: P, M, G ou 300ml, 500ml, 1L).\n4. Informe o valor correspondente de cada variação e clique em **Salvar**.\n\n*As opções de tamanho ficarão visíveis para o cliente ao selecionar o item no cardápio.*`
  },
  {
    id: 'stock_entry',
    title: 'Entrada de Estoque e Matéria-Prima',
    keywords: [
      'estoque', 'insumo', 'materia', 'matéria', 'compra', 'entrada', 'quantidade', 'lote', 
      'registar', 'log', 'fornecedor', 'historico'
    ],
    content: `**Como dar entrada de estoque / matéria-prima:**\n\n1. Acesse **"Estoque" > "Entrada de Estoque"**.\n2. Selecione o insumo (ou cadastre um novo).\n3. Informe a quantidade comprada, a unidade (kg, g, un, L) e o valor total.\n4. Clique em **"Registrar Entrada"**.\n\n*Os lançamentos ficarão registrados no histórico de movimentações.*`
  },
  {
    id: 'stock_adjustment',
    title: 'Ajuste de Quantidade de Insumo no Estoque',
    keywords: [
      'ajuste', 'ajustar', 'corrigir', 'perda', 'validade', 'contagem', 'fisica', 'física', 
      'estoque', 'quantidade', 'justificativa', 'log'
    ],
    content: `**Como ajustar a quantidade de um insumo no estoque:**\n\n1. No menu de Estoque, clique em **"Ajuste de Estoque"**.\n2. Escolha a opção de ajuste (Correção por Perda, Validade ou Contagem Física).\n3. Digite a nova quantidade real e a justificativa.\n4. Confirme o ajuste.`
  },
  {
    id: 'fiscal_config',
    title: 'Atributos Fiscais, NCM e CEST',
    keywords: [
      'fiscal', 'ncm', 'cest', 'imposto', 'nota', 'nfce', 'sat', 'cupom', 'tributo', 
      'origem', 'tributação'
    ],
    content: `**Como configurar atributos fiscais (NCM/Impostos):**\n\n1. Acesse a tela de **"Atributos Fiscais"** no menu do administrador.\n2. Selecione o produto na lista.\n3. Preencha os códigos **NCM**, **CEST** e a **Origem da Mercadoria**.\n4. Clique em **Salvar** para liberar a emissão correta de NFC-e / Cupons Fiscais.`
  },
  {
    id: 'sales_report',
    title: 'Vendas, Lucro e Relatório Financeiro',
    keywords: [
      'venda', 'vendas', 'faturamento', 'lucro', 'relatorio', 'relatório', 'periodo', 'período', 
      'caixa', 'cartão', 'faturado'
    ],
    content: `**Como consultar vendas e relatórios financeiros:**\n\n1. Acesse a tela de **"Vendas"** (\`/admin/request\`).\n2. Escolha a **Data Inicial** e a **Data Final** para filtrar o período.\n3. A tabela exibirá a quantidade vendida, total arrecadado, custos de insumos, taxas de cartão e o **lucro líquido**.\n4. Clicar em um item permite abrir os detalhes contábeis.`
  },
  {
    id: 'recipes_config',
    title: 'Gestão de Receitas e Ficha Técnica',
    keywords: [
      'receita', 'ficha', 'tecnica', 'técnica', 'ingrediente', 'baixa', 'vincular', 'receitas'
    ],
    content: `**Como criar a Ficha Técnica / Receita dos pratos:**\n\n1. Acesse **"Gestão de Receitas"** no menu do administrador.\n2. Escolha o prato do cardápio.\n3. Adicione cada matéria-prima usada (ex: 200g de carne, 1 pão, 50g de queijo).\n4. Salve a receita. Os insumos serão baixados automaticamente ao realizar as vendas.`
  },
  {
    id: 'stock_red_warning',
    title: 'Linha Vermelha no Estoque / Alerta de Estoque Mínimo',
    keywords: [
      'vermelho', 'vermelha', 'linha', 'cor', 'alerta', 'mínimo', 'minimo', 'baixo', 'abaixo',
      'aviso', 'estoque', 'significa', 'motivo'
    ],
    content: `**O que significa a linha destacada em VERMELHO no estoque:**\n\n1. **Alerta de Estoque Mínimo:** A cor vermelha indica que a quantidade atual desse insumo no estoque atingiu ou ficou **abaixo da quantidade mínima** cadastrada.\n2. **Ação Recomendada:** Trata-se de um aviso automático para que o administrador faça a **reposição ou nova compra** da matéria-prima antes que ela acabe.\n3. **Como resolver:** Registre uma nova compra na opção **"Nova Entrada"** ou ajuste a quantidade em **"Ajuste de Estoque"**.`
  },
  {
    id: 'expenses_config',
    title: 'Despesas e Fornecedores',
    keywords: [
      'despesa', 'despesas', 'fornecedor', 'fornecedores', 'conta', 'pagar', 'vencimento'
    ],
    content: `**Como registrar despesas e fornecedores:**\n\n1. Acesse **"Despesas"** no menu do administrador.\n2. Para novos fornecedores: clique em **"Cadastrar Fornecedor"**.\n3. Para lançar um custo: clique em **"Registrar Despesa"**, informe o fornecedor, valor, vencimento e categoria.\n4. Salve para acompanhar no fluxo financeiro.`
  },
  {
    id: 'inventory_history',
    title: 'Histórico de Inventários e Auditorias',
    keywords: [
      'inventário', 'inventario', 'inventários', 'inventarios', 'histórico', 'historico', 
      'auditoria', 'auditorias', 'correção', 'correcao', 'editar', 'diferença', 'prejuízo', 'desvio'
    ],
    content: `**Histórico de Inventários e Auditorias:**\n\n* **Consulta:** A tela lista todas as contagens físicas passadas com ID, data e a diferença financeira total de desvio.\n* **Comparação Detalhada:** Clique em qualquer linha para ver a comparação entre o volume teórico esperado e o volume real contado, bem como a variação de custo de cada item.\n* **Correção:** Você pode editar e corrigir a quantidade contada de qualquer insumo clicando em "Editar" na linha correspondente. Essa ação é permitida por motivos de auditoria apenas nas **primeiras 2 horas** após a gravação do inventário.`
  },
  {
    id: 'inventory_analytics',
    title: 'Análise de Inteligência e Calibragem de Receitas',
    keywords: [
      'inteligência', 'inteligencia', 'análise', 'analise', 'calibrar', 'calibração', 'calibracao', 
      'receitas', 'receita', 'desperdício', 'desperdicio', 'flutuação', 'flutuacao', 'sistemática'
    ],
    content: `**Análise de Inteligência e Calibragem de Receitas:**\n\n* **Perda Sistemática:** Identifica ingredientes que somem constantemente (mais de 80% das vezes). Sugere aumentar a dosagem nas fichas técnicas para alinhar o sistema ao consumo real.\n* **Flutuação:** Identifica ingredientes com perdas e ganhos alternados. Indica erros de contagem física do operador ou notas fiscais atrasadas.\n* **Estável:** Insumos sem discrepâncias significativas.\n* **Calibragem:** Clique em "Calibrar Receitas" (disponível para Perda Sistemática) para ver a simulação de custos antigo vs. novo por prato e aplicar a atualização automática apenas nas receitas que você marcar.`
  }
];

// Lista de palavras irrelevantes para ignorar na pontuação
const STOP_WORDS = new Set([
  'como', 'para', 'que', 'uma', 'no', 'na', 'um', 'de', 'do', 'da', 'em', 'o', 'a', 'os', 'as', 
  'e', 'ou', 'com', 'sem', 'por', 'sobre', 'qual', 'quais', 'onde', 'como', 'quem'
]);

/**
 * Registra perguntas que não estão presentes na documentação.
 */
async function logUnansweredQuery(userQuestion, screenContext, aiResponse) {
  const payload = {
    question: userQuestion,
    screenContext: screenContext || 'Geral',
    timestamp: new Date().toISOString(),
    aiResponseSnippet: aiResponse ? aiResponse.replace('[DOCUMENTACAO_INSUFICIENTE]', '').trim() : '',
  };

  // 1. Salva no Firestore
  try {
    if (db) {
      await addDoc(collection(db, 'ai_unanswered_queries'), payload);
    }
  } catch (err) {
    console.warn('Não foi possível salvar no Firestore, usando localStorage:', err);
  }

  // 2. Salva em LocalStorage para acesso garantido
  try {
    const existing = JSON.parse(localStorage.getItem('AI_UNANSWERED_QUERIES') || '[]');
    existing.unshift({ ...payload, id: 'local_' + Date.now() });
    localStorage.setItem('AI_UNANSWERED_QUERIES', JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage:', err);
  }
}

/**
 * Busca a lista de dúvidas pendentes de documentação.
 */
export async function fetchUnansweredQueries() {
  const results = [];

  // Tenta buscar no Firestore
  try {
    if (db) {
      const q = query(collection(db, 'ai_unanswered_queries'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() });
      });
    }
  } catch (err) {
    console.warn('Falha ao buscar no Firestore, buscando localStorage:', err);
  }

  // Fallback / Merge com LocalStorage
  try {
    const local = JSON.parse(localStorage.getItem('AI_UNANSWERED_QUERIES') || '[]');
    for (const item of local) {
      if (!results.some(r => r.question === item.question)) {
        results.push(item);
      }
    }
  } catch (err) {
    console.warn('Erro ao ler localStorage:', err);
  }

  return results;
}

/**
 * Remove uma dúvida marcada como documentada/resolvida.
 */
export async function deleteUnansweredQuery(id) {
  if (!id) return;
  
  if (!id.startsWith('local_')) {
    try {
      if (db) {
        await deleteDoc(doc(db, 'ai_unanswered_queries', id));
      }
    } catch (err) {
      console.warn('Erro ao deletar no Firestore:', err);
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem('AI_UNANSWERED_QUERIES') || '[]');
    const filtered = local.filter(item => item.id !== id);
    localStorage.setItem('AI_UNANSWERED_QUERIES', JSON.stringify(filtered));
  } catch (err) {
    console.warn('Erro ao deletar no localStorage:', err);
  }
}

/**
 * Serviço de Ajuda Inteligente que responde a dúvidas do administrador.
 */
export async function askSystemAssistant(userQuestion, screenContext = '') {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('REACT_APP_GEMINI_API_KEY');
  const activeScreenDoc = findScreenDoc(screenContext);

  // 1. Chamada via API do Google Gemini se a chave estiver disponível
  if (apiKey && apiKey.trim() !== '') {
    try {
      const systemPrompt = `Você é o Assistente Virtual Oficial do sistema "bar-menu.io".
Sua função é orientar o administrador de forma OBJETIVA e PASSO A PASSO.

DOCUMENTAÇÃO BASE DO SISTEMA:
${SYSTEM_HELP_DOCUMENT}

INFORMAÇÕES DA TELA ATUAL EM QUE O USUÁRIO ESTÁ (${screenContext || 'Geral'}):
${activeScreenDoc ? `${activeScreenDoc.title}: ${activeScreenDoc.description}` : 'Nenhuma tela específica.'}

REGRAS OBRIGATÓRIAS:
1. Responda em Português do Brasil com tom profissional, claro e solícito.
2. Formate as respostas em tópicos e passos numerados claros.
3. Se o usuário perguntar sobre "essa tela", explique a função da tela atual (${activeScreenDoc?.title || 'a tela atual'}).
4. REGRA DE DOCUMENTAÇÃO INCOMPLETA: Se a pergunta do usuário tratar de um assunto, recurso, campo ou regra que NÃO CONSTA ou NÃO ESTÁ DETALHADA no DOCUMENTAÇÃO BASE DO SISTEMA acima, inclua obrigatoriamente a tag "[DOCUMENTACAO_INSUFICIENTE]" no início da sua resposta, e informe gentilmente que este recurso ainda não possui manual completo, mas que a dúvida foi registrada para atualização.
`;

      const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-3.5-flash'];
      let lastError = null;

      for (const modelName of modelsToTry) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey.trim(),
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemPrompt + '\n\nPergunta do Usuário: ' + userQuestion },
                  ],
                },
              ],
              generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            let cleanAnswer = candidateText.trim();
            const isInsufficient = cleanAnswer.includes('[DOCUMENTACAO_INSUFICIENTE]');
            
            if (isInsufficient) {
              cleanAnswer = cleanAnswer.replace('[DOCUMENTACAO_INSUFICIENTE]', '').trim();
              // Log no Firebase / LocalStorage
              logUnansweredQuery(userQuestion, screenContext, cleanAnswer);
            }

            return {
              answer: cleanAnswer,
              isAiGenerated: true,
              isDocInsufficient: isInsufficient,
              faqSuggestions: activeScreenDoc?.faq || [],
            };
          }
        } else {
          const errText = await response.text();
          console.warn(`[Gemini API (${modelName}) HTTP ${response.status}]:`, errText);
          lastError = { status: response.status, text: errText };
        }
      }

      if (lastError) {
        alert(`Erro na API Gemini (${lastError.status}): ${lastError.text}`);
      }
    } catch (err) {
      console.warn('Falha na chamada Gemini, usando buscador local:', err);
      alert(`Falha de rede com a API Gemini: ${err.message}`);
    }
  }

  // 2. Motor de Busca Semântica Local
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
  
  for (const [routeKey, doc] of Object.entries(SCREEN_DOCUMENTATION_MAP)) {
    if (path.includes(routeKey.toLowerCase()) || routeKey.toLowerCase().includes(path)) {
      return doc;
    }
  }

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
 * Resposta inteligente com pontuação de termos (TF-IDF local simplificado).
 */
function generateLocalKnowledgeAnswer(userQuestion, screenContext, activeScreenDoc) {
  const q = userQuestion.toLowerCase().trim();

  // Caso seja pergunta direta sobre a tela atual
  const isScreenQuery =
    q.includes('essa tela') ||
    q.includes('esta tela') ||
    q.includes('para que serve') ||
    q.includes('o que e isso') ||
    q.includes('o que faz') ||
    q.includes('como funciona') ||
    q === 'ajuda';

  if (isScreenQuery && activeScreenDoc) {
    return `📌 **${activeScreenDoc.title}**\n\n${activeScreenDoc.description}`;
  }

  // Dividir a pergunta em palavras significativas
  const words = q.split(/[\s,?.!]+/g).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  let bestArticle = null;
  let highestScore = 0;

  for (const article of HELP_ARTICLES) {
    let score = 0;
    
    // Pontua com base em correspondência de palavras-chave
    for (const word of words) {
      for (const keyword of article.keywords) {
        if (keyword === word) {
          score += 2.0; // Palavra idêntica ganha peso máximo
        } else if (keyword.length > 2 && (keyword.startsWith(word) || word.startsWith(keyword))) {
          score += 1.0; // Correspondência de radical (apenas p/ palavras maiores que 2 letras)
        }
      }
    }

    // Boost se o título do artigo bater com o contexto da tela atual
    if (activeScreenDoc && article.content.toLowerCase().includes(activeScreenDoc.title.split(' ')[0].toLowerCase())) {
      score += 0.3;
    }

    if (score > highestScore) {
      highestScore = score;
      bestArticle = article;
    }
  }

  // Se encontramos uma correspondência relevante (score mínimo)
  if (bestArticle && highestScore >= 1.0) {
    return bestArticle.content;
  }

  // Fallback para documentação de tela ativa
  if (activeScreenDoc) {
    return `📌 **${activeScreenDoc.title}**\n\n${activeScreenDoc.description}`;
  }

  return `**Como podemos te ajudar no bar-menu.io?**\n\n- Para saber sobre a tela atual: *"Para que serve essa tela?"*\n- Para mudar fotos/pratos: *"Como mudo a imagem de um prato?"*\n- Para cadastrar pratos: *"Como cadastrar um produto?"*\n- Para preços por tamanho: *"Como cadastrar preços por tamanho?"*\n- Para estoque: *"Como dar entrada de estoque?"*`;
}
