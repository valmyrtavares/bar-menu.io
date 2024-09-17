import React from "react";
import "../../assets/styles/TransitionPopup.css";

const TrasitionPopup = ({ movingItem }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef();

  React.useEffect(() => {
    if (movingItem && movingItem.length > 0) {
      // Quando um novo item é passado, exibir o popup
      setIsVisible(true);
      console.log("movingItem   ", movingItem);

      // Ocultar o popup após 3 segundos (ajuste o tempo conforme necessário)
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Limpar o timeout quando o componente é desmontado ou movingItem muda
      return () => clearTimeout(timeoutRef.current);
    }
  }, [movingItem]);

  return (
    <div>
      {isVisible && movingItem && movingItem.length > 0 && (
        <div className={`popup ${isVisible ? "show popup-animate" : ""}`}>
          <h1>{movingItem[0].name}</h1>
          <h3>Seu pedido já está pronto</h3>
        </div>
      )}
    </div>
  );
};
export default TrasitionPopup;
