import React from 'react';
import style from '../../assets/styles/StockMovementPopup.module.scss';
import { getBtnData, fetchStockUsageLogs } from '../../api/Api';

const StockMovementPopup = ({ onClose }) => {
  const [stockList, setStockList] = React.useState([]);
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [movementType, setMovementType] = React.useState('saida'); // 'entrada' ou 'saida'
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStock = async () => {
      try {
        const data = await getBtnData('stock');
        const sorted = data.sort((a, b) => a.product.localeCompare(b.product));
        setStockList(sorted);
      } catch (err) {
        console.error('Erro ao buscar estoque:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  const parseDate = (date) => {
    if (!date) return new Date(0);
    
    // Suporte para Timestamp do Firestore
    if (date.seconds !== undefined) {
      return new Date(date.seconds * 1000);
    }
    
    if (date instanceof Date) return date;

    let dateStr = String(date).trim();
    
    // Remover sufixo de hora se existir (ex: "06/06/2025 - 17:10" -> "06/06/2025")
    if (dateStr.includes(' - ')) {
      dateStr = dateStr.split(' - ')[0];
    }

    // Suporte para DD/MM/YYYY (padrão do sistema)
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]);
        const year = Number(parts[2]);
        return new Date(year, month - 1, day);
      }
    }
    // Suporte para YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    return new Date(dateStr);
  };

  const handleFilter = async () => {
    if (!selectedProductId || !startDate || !endDate) {
      alert('Por favor, preencha todos os filtros.');
      return;
    }

    const selectedProduct = stockList.find((item) => item.id === selectedProductId);
    console.log('Produto Selecionado:', selectedProduct);

    if (!selectedProduct) {
      alert('Produto não encontrado.');
      return;
    }

    const logs = await fetchStockUsageLogs(selectedProductId);

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      console.warn('Este produto não possui histórico:', selectedProduct.product);
      setResult({ value: 0, unit: selectedProduct.unitOfMeasurement || '' });
      return;
    }

    // Converter strings YYYY-MM-DD para datas locais
    const [sY, sM, sD] = startDate.split('-').map(Number);
    const [eY, eM, eD] = endDate.split('-').map(Number);
    
    const start = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);
    end.setHours(23, 59, 59, 999);

    let total = 0;

    console.log(`Filtrando de ${start.toLocaleDateString()} até ${end.toLocaleDateString()}`);
    console.log(`Item: ${selectedProduct.product}, Tipo: ${movementType}`);
    console.log(`Histórico total: ${logs.length} eventos`);

    logs.forEach((event) => {
      const eventDate = parseDate(event.date);
      if (eventDate >= start && eventDate <= end) {
        // Tentar buscar por múltiplos nomes de campos possíveis
        const valRaw = movementType === 'saida' 
          ? (event.outputProduct ?? event.saida ?? 0)
          : (event.inputProduct ?? event.entrada ?? 0);
        
        const val = Math.abs(Number(String(valRaw).replace(',', '.')));
        
        if (!isNaN(val)) {
          console.log(`Evento em ${event.date}: ${val} (dentro do período)`);
          total += val;
        }
      }
    });

    console.log(`Total calculado: ${total}`);

    const finalResult = convertUnit(total, selectedProduct.unitOfMeasurement);
    setResult(finalResult);
  };

  const convertUnit = (value, unit) => {
    let currentUnit = unit || '';
    let currentValue = value;
    const u = currentUnit.toLowerCase().trim();

    if (value >= 1000) {
      if (u === 'mg' || u === 'ml' || u.includes('mili') || u.includes('ml')) {
        currentValue = value / 1000;
        currentUnit = 'L';
      } else if (u === 'g' || u === 'gramas') {
        currentValue = value / 1000;
        currentUnit = 'Kg';
      }
    }
    
    return { 
      value: Number(currentValue.toFixed(2)), 
      unit: currentUnit 
    };
  };

  return (
    <div className={style.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={style.popup}>
        <div className={style.header}>
          <h2>Movimentação de Estoque</h2>
          <button className={style.closeBtn} onClick={onClose}>X</button>
        </div>

        <div className={style.formGrid}>
          <div className={style.field}>
            <label>Data Inicial</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className={style.field}>
            <label>Data Final</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div className={`${style.field} ${style.fullWidth}`}>
            <label>Matéria Prima</label>
            <select 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Carregando itens...' : 'Selecione um item...'}</option>
              {stockList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product} ({item.unitOfMeasurement})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={style.radioGroup}>
          <label className={style.radioItem}>
            <input 
              type="radio" 
              name="movement" 
              value="entrada" 
              checked={movementType === 'entrada'} 
              onChange={() => setMovementType('entrada')} 
            />
            Entrada
          </label>
          <label className={style.radioItem}>
            <input 
              type="radio" 
              name="movement" 
              value="saida" 
              checked={movementType === 'saida'} 
              onChange={() => setMovementType('saida')} 
            />
            Saída
          </label>
        </div>

        <div className={style.footer}>
          <button className={style.filterBtn} onClick={handleFilter}>
            Filtrar Movimentação
          </button>

          {result !== null && (
            <div className={style.resultArea}>
              <div className={style.resultLabel}>
                Total de {movementType === 'entrada' ? 'Entradas' : 'Saídas'} no período:
              </div>
              <div className={style.resultValue}>
                {result.value} <span>{result.unit}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovementPopup;
