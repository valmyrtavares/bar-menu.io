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

  // Local state for flags during editing
  const [flags, setFlags] = React.useState({
    hasClients: global.hasClients,
    hasRawMaterial: global.hasRawMaterial,
    hasFinancial: global.hasFinancial,
    canConfigToten: global.canConfigToten,
  });

  React.useEffect(() => {
    setFlags({
      hasClients: global.hasClients,
      hasRawMaterial: global.hasRawMaterial,
      hasFinancial: global.hasFinancial,
      canConfigToten: global.canConfigToten,
    });
  }, [global.hasClients, global.hasRawMaterial, global.hasFinancial, global.canConfigToten]);

  const handleToggle = (field) => {
    setFlags((prev) => {
      const newState = { ...prev, [field]: !prev[field] };
      // Logic: Financial requires Raw Material
      if (field === 'hasRawMaterial' && !newState.hasRawMaterial) {
        newState.hasFinancial = false;
      }
      return newState;
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'GlobalConfig', 'packageSettings');
      
      // Calculate packageTier for backward compatibility
      let tier = 1; // Basic
      if (flags.hasClients && flags.hasRawMaterial && flags.hasFinancial) tier = 2; // Complete
      else if (flags.hasClients && !flags.hasRawMaterial) tier = 3; // Basic + Clients
      else if (!flags.hasClients && flags.hasRawMaterial && !flags.hasFinancial) tier = 4; // Basic + Raw Material
      else if (!flags.hasClients && flags.hasRawMaterial && flags.hasFinancial) tier = 5; // Basic + Material + Financial
      
      await setDoc(docRef, { 
        ...flags,
        packageTier: tier 
      }, { merge: true });
      
      alert('Configurações salvas com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Painel de Controle Mestre</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Configure os módulos da instância. Você pode carregar múltiplos módulos simultaneamente.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <button
          onClick={() => handleToggle('hasClients')}
          style={{
            padding: '20px',
            backgroundColor: flags.hasClients ? '#2196f3' : '#f0f0f0',
            color: flags.hasClients ? 'white' : '#333',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {flags.hasClients ? '✓ Gestão de Clientes Ativa' : 'Habilitar Gestão de Clientes'}
        </button>

        <button
          onClick={() => handleToggle('hasRawMaterial')}
          style={{
            padding: '20px',
            backgroundColor: flags.hasRawMaterial ? '#ff9800' : '#f0f0f0',
            color: flags.hasRawMaterial ? 'white' : '#333',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {flags.hasRawMaterial ? '✓ Matéria Prima Ativa' : 'Habilitar Matéria Prima'}
        </button>

        <button
          onClick={() => handleToggle('hasFinancial')}
          disabled={!flags.hasRawMaterial}
          style={{
            padding: '20px',
            backgroundColor: flags.hasFinancial ? '#9c27b0' : '#f0f0f0',
            color: flags.hasFinancial ? 'white' : '#333',
            border: '2px solid #9c27b0',
            borderRadius: '8px',
            cursor: flags.hasRawMaterial ? 'pointer' : 'not-allowed',
            opacity: flags.hasRawMaterial ? 1 : 0.5,
          }}
          title={!flags.hasRawMaterial ? 'Requer Matéria Prima ativa' : ''}
        >
          {flags.hasFinancial ? '✓ Gestão Financeira Ativa' : 'Habilitar Gestão Financeira'}
        </button>

        <button
          onClick={() => handleToggle('canConfigToten')}
          style={{
            padding: '20px',
            backgroundColor: flags.canConfigToten ? '#4caf50' : '#f0f0f0',
            color: flags.canConfigToten ? 'white' : '#333',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {flags.canConfigToten ? '✓ Configuração de Toten Liberada' : 'Liberar Configuração de Toten'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={saveSettings}
          disabled={loading}
          style={{
            padding: '15px 40px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>

        <button
          onClick={() => navigate('/admin')}
          disabled={loading}
          style={{
            padding: '15px 40px',
            backgroundColor: 'transparent',
            color: '#333',
            border: '2px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
        >
          Cancelar / Voltar
        </button>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h3>Resumo das Configurações Ativas:</h3>
        <ul>
          <li><strong>Gestão de Clientes:</strong> {global.hasClients ? 'SIM' : 'NÃO'}</li>
          <li><strong>Matéria Prima:</strong> {global.hasRawMaterial ? 'SIM' : 'NÃO'}</li>
          <li><strong>Gestão Financeira:</strong> {global.hasFinancial ? 'SIM' : 'NÃO'}</li>
          <li><strong>Configuração de Toten:</strong> {global.canConfigToten ? 'LIBERADA' : 'BLOQUEADA'}</li>
          <li><strong>Tier de Legado:</strong> {global.packageTier}</li>
        </ul>
      </div>
    </div>
  );
};

export default MasterControl;
