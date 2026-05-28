import React, { useState, useMemo } from 'react';
import log from '../../assets/styles/AdjustmentRecords.module.scss';
import CloseBtn from '../closeBtn';

const getLogTimestamp = (item, useTimestampFirst = false) => {
  if (!item) return 0;

  const parseAnyDate = (val) => {
    if (!val) return null;
    
    // 1. Instância do objeto Date
    if (val instanceof Date) {
      return val.getTime();
    }
    
    // 2. Timestamp do Firestore (objeto com seconds)
    if (typeof val === 'object' && val.seconds !== undefined) {
      return val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0);
    }
    
    // 3. Número (timestamp Unix de milissegundos)
    if (typeof val === 'number') {
      return val;
    }
    
    // 4. String formatada
    if (typeof val === 'string') {
      let str = val.trim();
      if (!str) return null;
      
      // Se for formato ISO string válido
      if (str.includes('T') && !isNaN(Date.parse(str))) {
        return new Date(str).getTime();
      }
      
      let hour = 0;
      let minute = 0;
      let second = 0;
      
      // Expressão regular para capturar e remover a hora (ex: "28/05/2026 - 15:30" ou "28/05/2026 15:30:00")
      const timeRegex = /(?:\s+|-\s+)(\d{2}):(\d{2})(?::(\d{2}))?/;
      const timeMatch = str.match(timeRegex);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10) || 0;
        minute = parseInt(timeMatch[2], 10) || 0;
        second = parseInt(timeMatch[3], 10) || 0;
        str = str.replace(timeMatch[0], '').trim();
      }
      
      // Separadores comuns de data (/ ou -)
      const separators = ['/', '-'];
      for (const sep of separators) {
        if (str.includes(sep)) {
          const parts = str.split(sep);
          if (parts.length === 3) {
            // Se o ano estiver no início (YYYY-MM-DD)
            if (parts[0].length === 4) {
              const year = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const day = parseInt(parts[2], 10);
              const d = new Date(year, month, day, hour, minute, second);
              if (!isNaN(d.getTime())) return d.getTime();
            } else {
              // Se o dia estiver no início (DD-MM-YYYY ou DD/MM/YYYY)
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const year = parseInt(parts[2], 10);
              const d = new Date(year, month, day, hour, minute, second);
              if (!isNaN(d.getTime())) return d.getTime();
            }
          }
        }
      }
      
      // Fallback para parse padrão de data
      const fallback = Date.parse(val);
      if (!isNaN(fallback)) return fallback;
    }
    
    return null;
  };

  const timeFromTimestamp = parseAnyDate(item.timestamp);
  const timeFromDate = parseAnyDate(item.date);

  if (useTimestampFirst) {
    if (timeFromTimestamp !== null) return timeFromTimestamp;
    if (timeFromDate !== null) return timeFromDate;
  } else {
    if (timeFromDate !== null) return timeFromDate;
    if (timeFromTimestamp !== null) return timeFromTimestamp;
  }

  return 0;
};


const AdjustmentRecords = ({
  eventLogData,
  setShowAdjustmentRecords,
  title,
}) => {
  const [filter, setFilter] = useState('Todas as Movimentações');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  const filteredData = useMemo(() => {
    if (!eventLogData) return [];
    
    // Ordena os registros de forma consistente:
    // 1. Pelo dia/hora real do evento (campo 'date')
    // 2. Se as datas forem idênticas (ou se uma delas não tiver 'date'), usa o 'timestamp' como critério de desempate.
    let data = [...eventLogData].sort((a, b) => {
      const dateA = getLogTimestamp(a, false); // Prioriza 'date'
      const dateB = getLogTimestamp(b, false); // Prioriza 'date'
      
      if (dateA !== dateB) {
        return dateB - dateA; // Decrescente (mais recente primeiro)
      }
      
      // Se empatar na data, usa o timestamp preciso como tie-breaker
      const tsA = getLogTimestamp(a, true); // Prioriza 'timestamp'
      const tsB = getLogTimestamp(b, true); // Prioriza 'timestamp'
      return tsB - tsA; // Decrescente (mais recente primeiro)
    });

    if (filter === 'Entrada de MP') {
      data = data.filter(item => {
        const valRaw = item.inputProduct ?? item.entrada ?? 0;
        const val = Math.abs(Number(String(valRaw).replace(',', '.')));
        return val > 0 && !isNaN(val);
      });
      data = data.slice(0, 10);
    } else if (filter === 'Saída de MP') {
      data = data.filter(item => {
        const valRaw = item.outputProduct ?? item.saida ?? 0;
        const val = Math.abs(Number(String(valRaw).replace(',', '.')));
        return val > 0 && !isNaN(val);
      });
      data = data.slice(0, 100);
    } else if (filter === 'Edição de MP') {
      data = data.filter(item => item.category === 'Editado' || item.category === 'Auditoria' || item.adjustmentExpenseNote || item.noteReasonsEditingProduct);
      data = data.slice(0, 10);
    }
    
    return data;
  }, [eventLogData, filter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className={log.containderAdjustmentRecords}>
      <div className={log.containerIcon}>
        <a
          href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.3z2eh6xgiwvv"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir documentação"
        >
          <span>?</span>
        </a>
      </div>
      <CloseBtn setClose={setShowAdjustmentRecords} />
      <h1>Lista de Ocorrencias do {title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
        <select 
          value={filter} 
          onChange={handleFilterChange}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
        >
          <option value="Todas as Movimentações">Todas as Movimentações</option>
          <option value="Entrada de MP">Entrada de MP</option>
          <option value="Saída de MP">Saída de MP</option>
          <option value="Edição de MP">Edição de MP</option>
        </select>
      </div>

      <div className={log.containderAdjustmentRecordsTable}>
        <table>
          <thead>
            <tr>
              <th title="Data em que o registro foi realizado.">Data</th>
              <th title="Quantidade de produto que entrou no estoque nesta operação.">
                Entrada do produto
              </th>
              <th title="Quantidade de produto que saiu do estoque (venda, perda ou ajuste).">
                Saida
              </th>
              <th title="Número do pedido vinculado à saída, se houver.">
                Pedido
              </th>
              <th title="O tipo de movimentação (Entrada, Saída, Ajuste, Edição, etc.).">
                Categoria
              </th>
              <th title="O volume que existia no estoque antes desta movimentação.">
                Vol Anterior
              </th>
              <th title="O valor (R$) total investido no estoque deste produto antes da movimentação.">
                Investimento anterior
              </th>
              <th title="O volume resultante no estoque após a movimentação.">
                Volume Atual
              </th>
              <th title="O valor (R$) total investido no estoque após a entrada ou saída.">
                Investimento Atual
              </th>
              <th title="O Custo Médio Ponderado atual (Investimento Atual / Volume Atual).">
                Custo Médio Unit.
              </th>
              <th title="Notas detalhadas sobre o motivo da edição ou a quantidade de embalagens envolvidas.">
                Anotações ou Embalagens
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData &&
              paginatedData.length > 0 &&
              paginatedData.map((item, index) => {
                const safeNum = (val) => {
                  const num = Number(val);
                  return isNaN(num) ? 0 : num;
                };
                const vol = safeNum(item.ContentsInStock);
                const inv = safeNum(item.totalResourceInvested);
                const avgCost = vol > 0 ? (inv / vol).toFixed(2) : '0.00';

                return (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>
                      {item.inputProduct ?? item.entrada ?? 0} {item.unit}
                    </td>
                    <td>{item.outputProduct ?? item.saida ?? 0}</td>
                    <td style={{ fontWeight: item?.orderNumber ? 'bold' : 'normal' }}>
                      {item?.orderNumber || '-'}
                    </td>
                    <td>{item.category}</td>
                    <td>
                      {safeNum(item.previousVolume).toFixed(2)} {item.unit}
                    </td>
                    <td>R${safeNum(item.previousCost).toFixed(2)}</td>
                    <td>
                      {' '}
                      {safeNum(item.ContentsInStock).toFixed(2)}
                      {item.unit}
                    </td>
                    <td>R$ {safeNum(item.totalResourceInvested).toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: '#14213D' }}>R$ {avgCost} / {item.unit}</td>
                    <td
                      title={
                        item.noteReasonsEditingProduct
                          ? item.noteReasonsEditingProduct
                          : item.adjustmentExpenseNote
                      }
                    >
                      {item.category === 'Editado' || item.adjustmentExpenseNote
                        ? item.noteReasonsEditingProduct ||
                          item.adjustmentExpenseNote
                          ? 'notas'
                          : 'sem notas '
                        : item.package}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {filter === 'Todas as Movimentações' && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', margin: '20px 0' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};
export default AdjustmentRecords;
