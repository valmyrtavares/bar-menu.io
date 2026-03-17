import React from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config-firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { GlobalContext } from '../GlobalContext';
import style from '../assets/styles/AdminMainMenu.module.scss';

const MasterControl = () => {
  const global = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const changePackage = async (tier) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'GlobalConfig', 'packageSettings');
      await setDoc(docRef, { packageTier: tier }, { merge: true });
      alert(`Pacote alterado para ${tier === 1 ? 'Básico' : 'Completo'}!`);
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      alert('Erro ao atualizar pacote. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Painel de Controle Mestre</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Este painel é de uso exclusivo do desenvolvedor para configurar os módulos da instância.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={() => changePackage(1)}
          disabled={loading || global.packageTier === 1}
          style={{
            padding: '20px 40px',
            fontSize: '1.2rem',
            backgroundColor: global.packageTier === 1 ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: global.packageTier === 1 ? 'default' : 'pointer',
          }}
        >
          Pacote Básico {global.packageTier === 1 && '(Ativo)'}
        </button>

        <button
          onClick={() => changePackage(2)}
          disabled={loading || global.packageTier === 2}
          style={{
            padding: '20px 40px',
            fontSize: '1.2rem',
            backgroundColor: global.packageTier === 2 ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: global.packageTier === 2 ? 'default' : 'pointer',
          }}
        >
          Pacote Completo {global.packageTier === 2 && '(Ativo)'}
        </button>

        <button
          onClick={() => changePackage(3)}
          disabled={loading || global.packageTier === 3}
          style={{
            padding: '20px 40px',
            fontSize: '1.2rem',
            backgroundColor: global.packageTier === 3 ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: global.packageTier === 3 ? 'default' : 'pointer',
          }}
        >
          Básico + Clientes {global.packageTier === 3 && '(Ativo)'}
        </button>

        <button
          disabled={true}
          style={{
            padding: '20px 40px',
            fontSize: '1.2rem',
            backgroundColor: '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
          title="Módulo em desenvolvimento"
        >
          Básico + Matéria Prima (Em breve)
        </button>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'left', display: 'inline-block' }}>
        <h3>Configurações Ativas:</h3>
        <ul>
          <li><strong>ID da Instância:</strong> {global.id || 'Não detectado'}</li>
          <li><strong>Modo Totem:</strong> {global.isToten ? 'Sim' : 'Não'}</li>
          <li><strong>NFC-e Automática:</strong> {global.enableAutoNfce ? 'Ativo' : 'Inativo'}</li>
          <li><strong>Tier Atual:</strong> {
            global.packageTier === 1 ? 'Básico (1)' :
            global.packageTier === 2 ? 'Completo (2)' :
            global.packageTier === 3 ? 'Básico + Clientes (3)' :
            global.packageTier === 4 ? 'Básico + Matéria Prima (4)' :
            `Desconhecido (${global.packageTier})`
          }</li>
        </ul>
      </div>
    </div>
  );
};

export default MasterControl;
