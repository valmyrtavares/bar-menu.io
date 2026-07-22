import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { GlobalContext } from '../GlobalContext';
import { getBtnData } from '../api/Api';
import style from '../assets/styles/TotenIdlePresentation.module.scss';

const TotenIdlePresentation = () => {
  const global = useContext(GlobalContext);
  const isToten = global?.isToten || localStorage.getItem('isToten') === 'true';
  const [showPresentation, setShowPresentation] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const timerRef = useRef(null);

  // Busca imagem do logo se não estiver carregada no contexto
  useEffect(() => {
    if (global?.image) {
      setLogoUrl(global.image);
    } else {
      getBtnData('frontImage')
        .then((data) => {
          if (data && data[0] && data[0].image) {
            setLogoUrl(data[0].image);
          }
        })
        .catch((err) => console.error('Erro ao carregar logo na apresentação:', err));
    }
  }, [global?.image]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const activeToten = global?.isToten || localStorage.getItem('isToten') === 'true';
    if (activeToten) {
      timerRef.current = setTimeout(() => {
        setShowPresentation(true);
      }, 30000); // 30 segundos
    }
  }, [global?.isToten]);

  useEffect(() => {
    const activeToten = global?.isToten || localStorage.getItem('isToten') === 'true';
    if (!activeToten) {
      setShowPresentation(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['click', 'touchstart', 'mousedown', 'mousemove', 'keydown'];

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity));
    resetTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [global?.isToten, resetTimer]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowPresentation(false);
    resetTimer();
  };

  if (!isToten || !showPresentation) return null;

  const bgColor = global?.styles?.bgColor || 'var(--bg-color, #b02121)';

  return (
    <div
      className={style.presentationOverlay}
      style={{ backgroundColor: bgColor }}
      onClick={handleDismiss}
      onTouchStart={handleDismiss}
    >
      <div className={style.contentContainer}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo da empresa"
            className={style.logoImage}
          />
        )}
        <p className={style.startText}>Clique aqui para começarmos</p>
      </div>
    </div>
  );
};

export default TotenIdlePresentation;
