import React, { useState, useEffect } from 'react';
import styles from '../../assets/styles/HelpModal.module.scss';
import { askSystemAssistant, findScreenDoc } from '../../services/aiHelpService';

const DEFAULT_DOC_URL = 'https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.7uh3xmsl0731#heading=h.txjco12lav7r';

const DEFAULT_SUGGESTIONS = [
  'Para que serve essa tela?',
  'Como cadastrar um novo produto?',
  'Como cadastrar preços por tamanho?',
  'Como dar entrada de estoque?',
];

function HelpModal({ isOpen: propsIsOpen, onClose: propsOnClose, currentScreenContext: propsScreenContext }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [screenContext, setScreenContext] = useState(propsScreenContext || '');
  const [currentDocUrl, setCurrentDocUrl] = useState(DEFAULT_DOC_URL);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;

  // Atualizar contexto e sugestões quando o modal abre ou altera o contexto de tela
  useEffect(() => {
    const ctx = propsScreenContext || window.location.pathname;
    setScreenContext(ctx);
    updateSuggestionsForScreen(ctx);
  }, [propsScreenContext, isOpen]);

  // Listener para evento global de abertura por qualquer botão '?' do sistema
  useEffect(() => {
    const handleGlobalOpen = (event) => {
      const { screenContext: ctx, docUrl } = event.detail || {};
      const activeCtx = ctx || window.location.pathname;
      setScreenContext(activeCtx);
      if (docUrl) setCurrentDocUrl(docUrl);
      updateSuggestionsForScreen(activeCtx);
      setResponse(null);
      setQuestion('');
      setInternalIsOpen(true);
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
    if (propsOnClose) {
      propsOnClose();
    }
    setInternalIsOpen(false);
  };

  if (!isOpen) return null;

  const handleAsk = async (queryToAsk) => {
    const q = (typeof queryToAsk === 'string' ? queryToAsk : question).trim();
    if (!q) return;

    setLoading(true);
    setResponse(null);

    try {
      const activeCtx = screenContext || window.location.pathname;
      const result = await askSystemAssistant(q, activeCtx);
      setResponse(result.answer);
      setIsAiGenerated(result.isAiGenerated);
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

  const openFullDoc = () => {
    window.open(currentDocUrl || DEFAULT_DOC_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
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
          <button className={styles.closeBtn} onClick={handleClose} title="Fechar">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.inputSection}>
            <label htmlFor="aiHelpInput">
              Faça uma pergunta objetiva sobre o sistema:
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="aiHelpInput"
                type="text"
                placeholder="Ex: Para que serve essa tela? ou Como cadastrar produto?"
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
