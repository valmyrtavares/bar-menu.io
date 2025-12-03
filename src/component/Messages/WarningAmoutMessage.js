import React from 'react';
import { GlobalContext } from '../../GlobalContext';

function WarningAmoutMessage() {
  const { warningLowRawMaterial, setWarningLowRawMaterial } =
    React.useContext(GlobalContext);
  React.useEffect(() => {
    const raw = localStorage.getItem('warningAmountMessage');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setWarningLowRawMaterial(parsed);
        }
      } catch (err) {
        console.error('Erro ao ler warningAmountMessage:', err);
      }
    }
  }, [setWarningLowRawMaterial]);

  return (
    <div>
      {warningLowRawMaterial?.map((msg, idx) => (
        <h3 style={{ color: 'red' }} key={idx}>
          {msg}
        </h3>
      ))}
    </div>
  );
}

export default WarningAmoutMessage;
