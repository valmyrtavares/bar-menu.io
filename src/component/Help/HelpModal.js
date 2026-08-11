import React, { useState, useEffect } from 'react';
import styles from '../../assets/styles/HelpModal.module.scss';
import { 
  askSystemAssistant, 
  findScreenDoc, 
  fetchUnansweredQueries, 
  deleteUnansweredQuery 
} from '../../services/aiHelpService';

const DEFAULT_DOC_URL = 'https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.7uh3xmsl0731#heading=h.txjco12lav7r';

const DEFAULT_SUGGESTIONS = [
  'Para que serve essa tela?',
  'Como cadastrar um novo produto?',
  'Como cadastrar preços por tamanho?',
  'Como dar entrada de estoque?',
];

function HelpModal({ currentScreenContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [screenContext, setScreenContext] = useState(currentScreenContext || '');
  const [currentDocUrl, setCurrentDocUrl] = useState(DEFAULT_DOC_URL);
  
  // Estados de Busca e IA
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isDocInsufficient, setIsDocInsufficient] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  // Configurações de API Key
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Painel de Dúvidas Não Documentadas
  const [showUnansweredPanel, setShowUnansweredPanel] = useState(false);
  const [unansweredList, setUnansweredList] = useState([]);

  // Carregar API Key e Dúvidas ao abrir
  useEffect(() => {
    const key = localStorage.getItem('REACT_APP_GEMINI_API_KEY') || '';
    setApiKeyInput(key);
    setHasApiKey(key.trim() !== '');

    if (isOpen) {
      loadUnansweredQueries();
    }
  }, [isOpen]);

  const loadUnansweredQueries = async () => {
    const list = await fetchUnansweredQueries();
    setUnansweredList(list);
  };

  // Atualizar contexto e sugestões quando a rota muda
  useEffect(() => {
    const ctx = currentScreenContext || window.location.pathname;
    setScreenContext(ctx);
    updateSuggestionsForScreen(ctx);
  }, [currentScreenContext, isOpen]);

  // Evento global para abrir o modal de qualquer interrogação '?'
  useEffect(() => {
    const handleGlobalOpen = (event) => {
      const { screenContext: ctx, docUrl } = event.detail || {};
      const activeCtx = ctx || window.location.pathname;
      setScreenContext(activeCtx);
      if (docUrl) setCurrentDocUrl(docUrl);
      updateSuggestionsForScreen(activeCtx);
      setResponse(null);
      setQuestion('');
      setShowSettings(false);
      setShowUnansweredPanel(false);
      setIsOpen(true);
      loadUnansweredQueries();
    };

    window.addEventListener('openAiHelp', handleGlobalOpen);
    return () => {
      window.removeEventListener('openAiHelp', handleGlobalOpen);
    };
  }, []);

  const updateSuggestionsForScreen = (ctx) => {
    const doc = findScreenDoc(ctx);
    if (doc && doc.faq && doc.faq.length > 0) {
      setSuggestions(doc.faq);
    } else {
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowSettings(false);
    setShowUnansweredPanel(false);
  };

  if (!isOpen) return null;

  const handleAsk = async (queryToAsk) => {
    const q = (typeof queryToAsk === 'string' ? queryToAsk : question).trim();
    if (!q) return;

    setLoading(true);
    setResponse(null);
    setIsDocInsufficient(false);

    try {
      const activeCtx = screenContext || window.location.pathname;
      const result = await askSystemAssistant(q, activeCtx);
      setResponse(result.answer);
      setIsAiGenerated(result.isAiGenerated);
      setIsDocInsufficient(result.isDocInsufficient || false);
      if (result.isDocInsufficient) {
        loadUnansweredQueries();
      }
    } catch (err) {
      setResponse('Desculpe, ocorreu um erro ao consultar a ajuda. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    setQuestion(chipText);
    handleAsk(chipText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAsk();
    }
  };

  const saveApiKey = () => {
    const key = apiKeyInput.trim();
    localStorage.setItem('REACT_APP_GEMINI_API_KEY', key);
    setHasApiKey(key !== '');
    setShowSettings(false);
    alert('Chave API salva com sucesso no navegador!');
  };

  const clearApiKey = () => {
    localStorage.removeItem('REACT_APP_GEMINI_API_KEY');
    setApiKeyInput('');
    setHasApiKey(false);
    setShowSettings(false);
    alert('Chave API removida. Retornando ao modo offline.');
  };

  const handleResolveUnanswered = async (id) => {
    await deleteUnansweredQuery(id);
    await loadUnansweredQueries();
  };

  const openFullDoc = () => {
    window.open(currentDocUrl || DEFAULT_DOC_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.overlay} onClick={handleClose} data-help-modal="true">
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.aiBadge}>IA Assistente</span>
            <h3>Ajuda & Suporte</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className={styles.unansweredToggleBtn}
              onClick={() => {
                setShowUnansweredPanel(!showUnansweredPanel);
                setShowSettings(false);
              }}
              title="Dúvidas Pendentes de Documentação"
            >
              📋 {unansweredList.length > 0 && <span className={styles.badge}>{unansweredList.length}</span>}
            </button>
            <button
              type="button"
              className={styles.settingsToggleBtn}
              onClick={() => {
                setShowSettings(!showSettings);
                setShowUnansweredPanel(false);
              }}
              title="Configurar IA"
            >
              ⚙️
            </button>
            <button className={styles.closeBtn} onClick={handleClose} title="Fechar">
              &times;
            </button>
          </div>
        </div>

        {/* Painel de Dúvidas sem Documentação */}
        {showUnansweredPanel && (
          <div className={styles.unansweredPanel}>
            <h4>📋 Dúvidas sem Documentação ({unansweredList.length})</h4>
            <p>Estas perguntas foram feitas no sistema, mas não constam no manual oficial:</p>
            {unansweredList.length === 0 ? (
              <span className={styles.emptyNotice}>Nenhuma dúvida pendente! A documentação cobre todas as perguntas feitas até agora.</span>
            ) : (
              <div className={styles.unansweredList}>
                {unansweredList.map((item) => (
                  <div key={item.id} className={styles.unansweredCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardQuestion}>"{item.question}"</span>
                      <span className={styles.cardContext}>Tela: {item.screenContext}</span>
                    </div>
                    {item.aiResponseSnippet && (
                      <div className={styles.cardSnippet}>IA: {item.aiResponseSnippet}</div>
                    )}
                    <button
                      type="button"
                      className={styles.resolveBtn}
                      onClick={() => handleResolveUnanswered(item.id)}
                    >
                      ✓ Marcar como Documentado
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Painel de Configurações (Chave API) */}
        {showSettings && (
          <div className={styles.settingsPanel}>
            <h4>Configuração de Inteligência Artificial</h4>
            <p>Insira sua API Key do Google Gemini para ativar o assistente dinâmico por voz/chat:</p>
            <div className={styles.apiKeyWrapper}>
              <input
                type="password"
                placeholder="Cole sua API Key do Gemini aqui (AIzaSy...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <div className={styles.settingsButtons}>
                <button type="button" className={styles.saveBtn} onClick={saveApiKey}>
                  Salvar
                </button>
                {hasApiKey && (
                  <button type="button" className={styles.clearBtn} onClick={clearApiKey}>
                    Limpar
                  </button>
                )}
              </div>
            </div>
            <span className={styles.linkHint}>
              Obtenha uma chave gratuita acessando o{' '}
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>.
            </span>
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {/* Indicador de Status */}
          <div className={styles.statusIndicator}>
            {hasApiKey ? (
              <span className={styles.statusOnline}>✦ Modo Inteligência Artificial Ativo</span>
            ) : (
              <span className={styles.statusOffline}>🔎 Modo Offline (Buscador Local Ativo)</span>
            )}
          </div>

          <div className={styles.inputSection}>
            <label htmlFor="aiHelpInput">
              Faça uma pergunta objetiva sobre o sistema:
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="aiHelpInput"
                type="text"
                placeholder="Ex: Como eu altero a imagem de um prato?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
              >
                {loading ? 'Consultando...' : 'Perguntar'}
              </button>
            </div>
          </div>

          {/* Sugestões Rápidas */}
          <div className={styles.chipsContainer}>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.chip}
                onClick={() => handleChipClick(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Área de Resposta */}
          {loading && (
            <div className={styles.loadingSpinner}>
              <div className={styles.dotPulse}></div>
              <span>Processando resposta com base na documentação do sistema...</span>
            </div>
          )}

          {response && !loading && (
            <div className={styles.responseArea}>
              <div className={styles.responseHeader}>
                <span>Resposta Objetiva</span>
                {isAiGenerated && (
                  <span className={styles.aiIndicator}>✦ Gerado por Gemini IA</span>
                )}
              </div>
              
              {isDocInsufficient && (
                <div className={styles.docWarningBanner}>
                  ⚠️ <strong>Aviso de Documentação:</strong> Esta funcionalidade ainda não consta no manual oficial do sistema. A sua pergunta foi salva na lista de atualizações do administrador.
                </div>
              )}

              <div className={styles.responseText}>{response}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.docLink} onClick={openFullDoc}>
            📖 Ver documentação completa
          </button>
          <button type="button" className={styles.dismissBtn} onClick={handleClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;

