import React, { useState, useContext } from 'react';
import { GlobalContext } from '../../GlobalContext.js';
import '../../assets/styles/resultMessage.css'; // Reusing existing modal styles for overlay
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';

const DeliveryAddressPopup = ({ customerName, onClose, onSubmit }) => {
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [errorCep, setErrorCep] = useState('');
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [localidade, setLocalidade] = useState('');
  const [uf, setUf] = useState('');
  const [popupMsg, setPopupMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const global = useContext(GlobalContext);
  const maxDeliveryDistance = global?.maxDeliveryDistance !== undefined ? global.maxDeliveryDistance : 1;

  // Establishment coordinates from global settings or fallback to defaults
  const RESTAURANT_LAT = global?.establishmentCoords?.lat || -23.55052;
  const RESTAURANT_LNG = global?.establishmentCoords?.lng || -46.633309;

  // Haversine formula to approximate distance between two lat/lon points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth ratio in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // distance in km
  };

  const handleCepChange = async (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    // Formatting CEP xxxxx-xxx
    if (value.length > 5) {
      setCep(value.slice(0, 5) + '-' + value.slice(5));
    } else {
      setCep(value);
    }

    if (value.length === 8) {
      setLoadingCep(true);
      setErrorCep('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setErrorCep('CEP não encontrado.');
          setLogradouro('');
          setBairro('');
        } else {
          setLogradouro(data.logradouro);
          setBairro(data.bairro);
          setLocalidade(data.localidade);
          setUf(data.uf);
          // Foco no numero
          document.getElementById('delivery-numero').focus();
        }
      } catch (err) {
        setErrorCep('Erro ao buscar CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logradouro || !numero || !bairro) {
      setPopupMsg("Por favor, preencha o CEP e o número do endereço.");
      return;
    }

    setCalculatingDistance(true);
    
    try {
      // Free rate-limited geocoding via Nominatim
      // Using structured parameters (street, city, state, country) to ensure results are in the correct city
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(logradouro + ', ' + numero)}&city=${encodeURIComponent(localidade)}&state=${encodeURIComponent(uf)}&country=Brasil&limit=1`;
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'bar-menu-delivery-app' }
      });
      const data = await response.json();

      let distance = 0;
      let isDistanceValid = true;

      if (data && data.length > 0) {
        const targetLat = parseFloat(data[0].lat);
        const targetLng = parseFloat(data[0].lon);
        distance = calculateDistance(RESTAURANT_LAT, RESTAURANT_LNG, targetLat, targetLng);
        
        // Formating distance to 1 decimal place
        distance = Number(distance.toFixed(1));

        if (distance > maxDeliveryDistance) {
          setPopupMsg(`Infelizmente entregamos até no máximo ${maxDeliveryDistance}km. Seu endereço está a ${distance}km de distância.`);
          setIsError(true);
          isDistanceValid = false;
        }
      } else {
        // Se não encontrar o endereço, não permite prosseguir
        setPopupMsg("Não conseguimos localizar seu endereço com precisão para validar a distância de entrega. Por favor, verifique o número e o bairro.");
        setIsError(true);
        isDistanceValid = false;
      }

      setCalculatingDistance(false);

      if (isDistanceValid) {
        const fullAddress = {
          cep,
          logradouro,
          numero,
          bairro,
          complemento,
          distance
        };
        onSubmit(fullAddress);
      }

    } catch (e) {
      setCalculatingDistance(false);
      console.error(e);
      // Fallback em caso de falha de rede da API de mapas
      setPopupMsg("Erro ao validar área de entrega. Tente novamente.");
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="default-comum-message-container" style={{ zIndex: 9999, padding: '20px', width: '90%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '10px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '15px' }}>{customerName}, onde entregaremos seu pedido?</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>CEP:</label>
            <input 
              type="text" 
              value={cep} 
              onChange={handleCepChange}
              placeholder="00000-000"
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
              maxLength={9}
            />
            {loadingCep && <small style={{ color: 'blue' }}>Buscando endereço...</small>}
            {errorCep && <small style={{ color: 'red' }}>{errorCep}</small>}
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Rua / Logradouro:</label>
            <input 
              type="text" 
              value={logradouro} 
              readOnly
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold' }}>Número:</label>
              <input 
                id="delivery-numero"
                type="text" 
                value={numero} 
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: 123"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold' }}>Bairro:</label>
              <input 
                type="text" 
                value={bairro} 
                readOnly
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Andar, Sala, Loja (Complemento livre):</label>
            <input 
              type="text" 
              value={complemento} 
              onChange={(e) => setComplemento(e.target.value)}
              placeholder="Ex: Apt 42, Bloco B"
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="container-button" style={{ marginTop: '20px' }}>
            <button type="button" onClick={onClose} disabled={calculatingDistance} style={{ backgroundColor: '#E0E0E0', color: '#333' }}>
              Cancelar
            </button>
            <button type="submit" disabled={!logradouro || !numero || calculatingDistance} style={{ padding: '0 20px' }}>
              {calculatingDistance ? "Calculando..." : "Confirmar Endereço"}
            </button>
          </div>
        </form>
      </div>

      {popupMsg && (
        <DefaultComumMessage 
          msg={popupMsg} 
          onClose={() => {
            setPopupMsg('');
            if (isError) onClose();
          }} 
          negativeResponse={isError ? "Entrega Recusada" : "Verificar Endereço"}
        />
      )}
    </>
  );
};

export default DeliveryAddressPopup;
