import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import styleEdit from '../../assets/styles/EditFormStockProduct.module.scss';
import styleTrack from '../../assets/styles/TrackStockProduct.module.scss';
import styleProgress from '../../assets/styles/AuditingPopupProgress.module.scss';

const renderSparkline = (history, unit) => {
  if (!history || history.length === 0) return null;

  const pointDistance = 95;
  // Ponto de início + contagens de histórico
  const historyLen = history.length;
  const totalPoints = historyLen + 1;
  const svgWidth = Math.max(320, totalPoints * pointDistance);
  const svgHeight = 130;
  const paddingX = 40;
  const paddingY = 30;

  // Gerar série acumulada
  let cumulative = 0;
  const cumulativeHistory = history.map(h => {
    cumulative += h.difVol;
    return {
      date: h.date,
      difVol: h.difVol, // mudança individual
      cumulativeVol: cumulative
    };
  });

  // Ponto de início virtual (0 discrepância)
  const pointsData = [
    { cumulativeVol: 0, difVol: 0, date: 'Início', isStart: true },
    ...cumulativeHistory
  ];

  // Encontrar o maior desvio absoluto acumulado para escalonar o eixo Y
  const maxAbsDiff = Math.max(...pointsData.map(p => Math.abs(p.cumulativeVol)), 0.1);
  const centerY = svgHeight / 2; // Linha de discrepância zero (65)

  // Gerar coordenadas X e Y para cada ponto
  const points = pointsData.map((p, i) => {
    const x = paddingX + (i / (pointsData.length - 1)) * (svgWidth - 2 * paddingX);
    // Se cumulativeVol for negativo (perda), o y aumenta (vai para baixo no SVG)
    // Se cumulativeVol for positivo (ganho), o y diminui (vai para cima no SVG)
    const y = centerY - (p.cumulativeVol / maxAbsDiff) * (centerY - paddingY);
    return {
      x,
      y,
      cumulativeVal: p.cumulativeVol,
      changeVal: p.difVol,
      date: p.date,
      isStart: p.isStart
    };
  });

  return (
    <div className={styleProgress.sparklineContainer}>
      <h5 className={styleProgress.sparklineTitle}>Tendência de Discrepância Acumulada ({unit})</h5>
      <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '10px' }}>
        <svg 
          style={{ width: `${svgWidth}px`, height: `${svgHeight}px`, display: 'block', overflow: 'visible' }} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* Linha de referência Zero */}
          <line
            x1="15"
            y1={centerY}
            x2={svgWidth - 15}
            y2={centerY}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeDasharray="3,3"
            strokeWidth="1"
          />
          <text
            x="15"
            y={centerY - 6}
            className={styleProgress.sparklineText}
            fontSize="10"
            fontWeight="600"
            opacity="0.8"
          >
            Esperado (Estável)
          </text>

          {/* Desenhar os segmentos de linha coloridos entre os pontos */}
          {points.map((p, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            
            // Cor do segmento baseada na mudança do ponto atual
            const change = p.changeVal;
            const strokeColor = change < 0 ? '#ef4444' : change > 0 ? '#34d399' : 'rgba(255, 255, 255, 0.25)';

            return (
              <line
                key={`line-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={p.x}
                y2={p.y}
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Desenhar os pontos (círculos) e textos */}
          {points.map((p, idx) => {
            if (p.isStart) {
              return (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="rgba(255, 255, 255, 0.4)"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className={styleProgress.sparklineText}
                    fontSize="10"
                    opacity="0.6"
                  >
                    Início
                  </text>
                </g>
              );
            }

            // O sinal e a cor do círculo representam o desvio individual daquele inventário
            const change = p.changeVal;
            const isNegativeLabel = change < 0;
            const isPositiveLabel = change > 0;
            const dotColor = isNegativeLabel ? '#ef4444' : isPositiveLabel ? '#34d399' : '#94a3b8';
            
            // Posicionamento vertical do rótulo baseado na posição acumulada (para não cruzar a linha zero confusamente)
            const textY = p.cumulativeVal < 0 ? p.y + 14 : p.y - 8;
            
            // Formatador de valor: ganhos recebem sinal de + (ex: +1.00) e nunca sinal de menos (-)
            const formattedVal = isPositiveLabel ? `+${change.toFixed(2)}` : change.toFixed(2);
            
            // Data curta abreviada (DD/MM) para evitar sobreposição horizontal
            const shortDate = p.date.split(' - ')[0].substring(0, 5);

            return (
              <g key={idx}>
                {/* Linha vertical pontilhada conectando o ponto à linha zero */}
                <line
                  x1={p.x}
                  y1={centerY}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
                
                {/* Círculo do ponto */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill={dotColor}
                  stroke="#222232"
                  strokeWidth="1.5"
                />

                {/* Rótulo do valor do desvio individual */}
                <text
                  x={p.x}
                  y={textY}
                  textAnchor="middle"
                  className={styleProgress.sparklineText}
                  fill={dotColor}
                  fontWeight="700"
                  fontSize="11"
                >
                  {formattedVal}
                </text>

                {/* Data da auditoria na base do gráfico */}
                <text
                  x={p.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={styleProgress.sparklineText}
                  fontSize="10"
                  opacity="0.6"
                >
                  {shortDate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const InventoryHistoryPopup = ({ onClose, fetchStock }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);
  
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics'
  const [menuItems, setMenuItems] = useState([]);
  const [adjustmentLogs, setAdjustmentLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  useEffect(() => {
    const fetchHistoryAndAnalytics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'inventoryHistory'));
        const data = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          
          // Calcular a diferença real usando o array de items
          let difference = 0;
          if (docData.items && Array.isArray(docData.items)) {
            difference = docData.items.reduce((acc, item) => {
              return acc + (Number(item.currentCost) - Number(item.previousCost));
            }, 0);
          } else {
            difference = -(docData.totalLossValue || 0);
          }

          data.push({
            id: doc.id.substring(0, 4).toUpperCase(),
            fullId: doc.id,
            date: docData.date,
            timestamp: docData.timestamp || 0,
            difference: difference,
            items: docData.items || []
          });
        });

        // Ordenar do mais recente para o mais antigo
        data.sort((a, b) => b.timestamp - a.timestamp);
        setHistoryItems(data);

        // Buscar pratos e logs de calibração
        const [dishesSnap, logsSnap] = await Promise.all([
          getDocs(collection(db, 'item')),
          getDocs(collection(db, 'recipeAdjustmentsLogs'))
        ]);

        const loadedDishes = [];
        dishesSnap.forEach(d => {
          loadedDishes.push({ id: d.id, ...d.data() });
        });
        setMenuItems(loadedDishes);

        const loadedLogs = [];
        logsSnap.forEach(l => {
          loadedLogs.push({ id: l.id, ...l.data() });
        });
        setAdjustmentLogs(loadedLogs);

        // --- PROCESSAMENTO DOS DADOS DE INTELIGÊNCIA ---
        const productsMap = {};

        // Processar em ordem cronológica (mais antigos primeiro) para poder traçar histórico
        const chronologicalInventories = [...data].reverse();

        chronologicalInventories.forEach((inv) => {
          if (inv.items && Array.isArray(inv.items)) {
            inv.items.forEach((item) => {
              const name = item.product;
              if (!name) return;

              if (!productsMap[name]) {
                productsMap[name] = {
                  product: name,
                  unit: item.unit || '',
                  history: [],
                  totalAudits: 0,
                  negativeCount: 0,
                  positiveCount: 0,
                  totalLossValue: 0,
                  totalGainValue: 0,
                  netVolumeDiff: 0,
                  lastVolume: Number(item.currentVolume) || 0,
                };
              }

              const difVol = Number(item.currentVolume) - Number(item.previousVolume);
              const difCost = Number(item.currentCost) - Number(item.previousCost);

              productsMap[name].history.push({
                date: inv.date,
                timestamp: inv.timestamp,
                difVol,
                difCost,
                previousVolume: Number(item.previousVolume),
                currentVolume: Number(item.currentVolume),
              });

              productsMap[name].totalAudits += 1;
              if (difVol < 0) {
                productsMap[name].negativeCount += 1;
                productsMap[name].totalLossValue += Math.abs(difCost);
              } else if (difVol > 0) {
                productsMap[name].positiveCount += 1;
                productsMap[name].totalGainValue += difCost;
              }
              productsMap[name].netVolumeDiff += difVol;
              productsMap[name].lastVolume = Number(item.currentVolume);
            });
          }
        });

        const processedAnalytics = Object.values(productsMap).map((prod) => {
          // Classificar padrão
          let pattern = 'Estável';
          let explanation = 'Estoque saudável ou com poucas correções necessárias.';

          if (prod.totalAudits >= 3) {
            const negRate = prod.negativeCount / prod.totalAudits;

            if (negRate >= 0.8) {
              pattern = 'Perda Sistemática';
              explanation = `Este ingrediente apresenta falta física constante (em ${prod.negativeCount} de ${prod.totalAudits} contagens). Isto indica desperdício na preparação ou que a dosagem nas receitas no sistema está abaixo do consumo real na cozinha.`;
            } else if (prod.negativeCount > 0 && prod.positiveCount > 0) {
              pattern = 'Flutuação';
              explanation = `Apresenta variações frequentes de saldo positivo e negativo entre os períodos. Isso costuma indicar erros de contagem física pelos operadores ou atrasos no lançamento de notas de entrada.`;
            }
          } else {
            pattern = 'Dados Insuficientes';
            explanation = 'É necessário pelo menos 3 inventários contendo este item para traçar um diagnóstico preciso.';
          }

          // Encontrar pratos que usam este ingrediente
          const dishesUsingItem = loadedDishes.filter(dish => {
            const list = dish.recipe?.FinalingridientsList;
            if (!list) return false;
            
            const matches = (arr) => {
              if (!Array.isArray(arr)) return false;
              return arr.some(ing => ing.name && ing.name.trim().toLowerCase() === prod.product.trim().toLowerCase());
            };

            if (Array.isArray(list)) return matches(list);
            if (typeof list === 'object') {
              return matches(list.firstPrice) || matches(list.secondPrice) || matches(list.thirdPrice) ||
                     (dish.CustomizedPrice && (
                       matches(list[dish.CustomizedPrice.firstLabel]) ||
                       matches(list[dish.CustomizedPrice.secondLabel]) ||
                       matches(list[dish.CustomizedPrice.thirdLabel])
                     ));
            }
            return false;
          }).map(d => d.title);

          // Verificar logs de calibração para o Feedback Loop
          const logsForProduct = loadedLogs
            .filter(l => l.product === prod.product)
            .sort((a, b) => b.timestamp - a.timestamp); // mais recente primeiro
          
          let lastAdjustment = null;
          let feedbackMessage = null;
          let feedbackType = null;

          if (logsForProduct.length > 0) {
            lastAdjustment = logsForProduct[0];
            const postAdjustmentAudits = prod.history.filter(h => h.timestamp > lastAdjustment.timestamp);
            
            if (postAdjustmentAudits.length > 0) {
              const avgPostDiff = postAdjustmentAudits.reduce((acc, h) => acc + h.difVol, 0) / postAdjustmentAudits.length;
              const avgVolume = postAdjustmentAudits.reduce((acc, h) => acc + h.previousVolume, 0) / postAdjustmentAudits.length;
              const ratio = avgVolume > 0 ? (avgPostDiff / avgVolume) * 100 : 0;

              if (ratio >= -2 && ratio <= 2) {
                feedbackType = 'success';
                feedbackMessage = `✅ Correção Bem-Sucedida: O ajuste de +${Math.round((lastAdjustment.scaleFactor - 1) * 100)}% feito em ${lastAdjustment.date} calibrou a receita com sucesso. A discrepância média caiu para ${ratio.toFixed(1)}%.`;
              } else if (ratio < -2) {
                feedbackType = 'neutral';
                feedbackMessage = `⚠️ Sub-calibrado: A perda residual média ainda é de ${ratio.toFixed(1)}% mesmo após o ajuste de +${Math.round((lastAdjustment.scaleFactor - 1) * 100)}%. Sugerimos aumentar a receita.`;
              } else if (ratio > 2) {
                feedbackType = 'neutral';
                feedbackMessage = `⚖️ Super-calibrado: Após o ajuste de +${Math.round((lastAdjustment.scaleFactor - 1) * 100)}%, houve sobra média de +${ratio.toFixed(1)}%. Sugerimos reduzir um pouco a receita.`;
              }
            } else {
              feedbackType = 'neutral';
              feedbackMessage = `⏳ Aguardando novo inventário para avaliar o impacto do ajuste de +${Math.round((lastAdjustment.scaleFactor - 1) * 100)}% realizado em ${lastAdjustment.date}.`;
            }
          }

          // Sugestão de correção
          let suggestedCorrectionPct = 0;
          if (pattern === 'Perda Sistemática' && prod.history.length > 0) {
            const totalPrevious = prod.history.reduce((acc, h) => acc + h.previousVolume, 0);
            const totalDiff = prod.history.reduce((acc, h) => acc + Math.abs(h.difVol), 0);
            suggestedCorrectionPct = totalPrevious > 0 ? (totalDiff / totalPrevious) * 100 : 0;
            if (suggestedCorrectionPct > 30) suggestedCorrectionPct = 30; // Segurança max 30%
          }

          return {
            ...prod,
            pattern,
            explanation,
            dishesUsingItem,
            lastAdjustment,
            feedbackMessage,
            feedbackType,
            suggestedCorrectionPct,
            isHighImpact: false
          };
        });

        // Ordenar por perda absoluta em dinheiro desc para marcar Alto Impacto
        processedAnalytics.sort((a, b) => b.totalLossValue - a.totalLossValue);
        
        // Marcar top 3 com perda significativa (> R$ 50) como Alto Impacto
        processedAnalytics.forEach((item, index) => {
          if (index < 3 && item.totalLossValue > 50) {
            item.isHighImpact = true;
          }
        });

        // Ordenar alfabeticamente pelo nome da matéria-prima
        processedAnalytics.sort((a, b) => a.product.localeCompare(b.product, 'pt-BR', { sensitivity: 'base' }));

        setAnalyticsData(processedAnalytics);
      } catch (err) {
        console.error("Erro ao carregar histórico de inventários", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryAndAnalytics();
  }, [refreshTrigger]);

  const handleAutomaticRecipeAdjustment = async (productName, correctionPct) => {
    if (isAdjusting) return;
    
    const scaleFactor = 1 + (correctionPct / 100);
    const confirm = window.confirm(
      `Deseja ajustar as receitas automaticamente? Isso aumentará a quantidade de "${productName}" em todas as receitas em +${Math.round(correctionPct)}% e atualizará seus respectivos custos no sistema.`
    );
    if (!confirm) return;

    setIsAdjusting(true);
    try {
      let updatedCount = 0;
      const updates = [];

      menuItems.forEach((dish) => {
        let recipeList = dish.recipe?.FinalingridientsList;
        if (!recipeList) return;

        let changed = false;

        const scaleArray = (arr) => {
          if (!Array.isArray(arr)) return 0;
          let diff = 0;
          arr.forEach((ing) => {
            if (ing.name && ing.name.trim().toLowerCase() === productName.trim().toLowerCase()) {
              const originalAmount = Number(ing.amount) || 0;
              const originalPortionCost = Number(ing.portionCost) || 0;

              ing.amount = Number((originalAmount * scaleFactor).toFixed(4));
              ing.portionCost = Number((originalPortionCost * scaleFactor).toFixed(2));
              
              diff += (ing.portionCost - originalPortionCost);
              changed = true;
            }
          });
          return diff;
        };

        if (Array.isArray(recipeList)) {
          const diff = scaleArray(recipeList);
          if (diff !== 0 && dish.costPriceObj) {
            dish.costPriceObj.cost = Number((Number(dish.costPriceObj.cost || 0) + diff).toFixed(2));
          }
        } else if (typeof recipeList === 'object' && recipeList !== null) {
          const labels = dish.CustomizedPrice;
          
          const firstDiff = scaleArray(recipeList.firstPrice || (labels ? recipeList[labels.firstLabel] : null));
          if (firstDiff !== 0 && dish.CustomizedPrice) {
            dish.CustomizedPrice.firstCost = Number((Number(dish.CustomizedPrice.firstCost || 0) + firstDiff).toFixed(2));
            dish.costPriceObj.cost = dish.CustomizedPrice.firstCost;
          }

          const secondDiff = scaleArray(recipeList.secondPrice || (labels ? recipeList[labels.secondLabel] : null));
          if (secondDiff !== 0 && dish.CustomizedPrice) {
            dish.CustomizedPrice.secondCost = Number((Number(dish.CustomizedPrice.secondCost || 0) + secondDiff).toFixed(2));
          }

          const thirdDiff = scaleArray(recipeList.thirdPrice || (labels ? recipeList[labels.thirdLabel] : null));
          if (thirdDiff !== 0 && dish.CustomizedPrice) {
            dish.CustomizedPrice.thirdCost = Number((Number(dish.CustomizedPrice.thirdCost || 0) + thirdDiff).toFixed(2));
          }
        }

        if (changed) {
          updatedCount++;
          const docRef = doc(db, 'item', dish.id);
          updates.push(updateDoc(docRef, {
            recipe: dish.recipe,
            costPriceObj: dish.costPriceObj,
            CustomizedPrice: dish.CustomizedPrice
          }));
        }
      });

      if (updatedCount > 0) {
        await Promise.all(updates);
        
        // Registrar log de calibração
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        await addDoc(collection(db, 'recipeAdjustmentsLogs'), {
          product: productName,
          scaleFactor: scaleFactor,
          timestamp: Date.now(),
          date: dateStr
        });

        alert(`Sucesso! ${updatedCount} receita(s) contendo "${productName}" foram recalibradas em +${Math.round(correctionPct)}% no sistema.`);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(`Nenhuma receita ativa encontrada que utilize "${productName}".`);
      }
    } catch (err) {
      console.error("Erro ao recalibrar receitas:", err);
      alert("Ocorreu um erro ao atualizar as receitas. Verifique o console.");
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleSaveCorrection = async (prod, idx) => {
    const val = Number(editValue);
    if (isNaN(val) || val < 0 || editValue === '') {
      alert("Valor inválido. Digite um número maior ou igual a zero.");
      return;
    }
    
    const oldVolume = Number(prod.currentVolume);
    if (val === oldVolume && Number(prod.currentCost) > 0) {
      setEditingIndex(null);
      return;
    }
    
    setIsSavingCorrection(true);
    try {
      const deltaVolume = val - oldVolume;
      
      let stockUnitCost = 0;
      let stockDocId = null;
      let stockData = null;
      
      const stockDocs = await getDocs(query(collection(db, 'stock'), where('product', '==', prod.product)));
      if (!stockDocs.empty) {
        const stockDoc = stockDocs.docs[0];
        stockDocId = stockDoc.id;
        stockData = stockDoc.data();
        
        if (Number(stockData.totalCost) > 0 && Number(stockData.totalVolume) > 0) {
          stockUnitCost = Number(stockData.totalCost) / Number(stockData.totalVolume);
        } else if (Number(stockData.lastUnitCost) > 0) {
          stockUnitCost = Number(stockData.lastUnitCost);
        } else {
          stockUnitCost = Number(stockData.CostPerUnit || 0);
        }
      }
      
      if (stockUnitCost === 0) {
        if (oldVolume > 0 && Number(prod.currentCost) > 0) {
          stockUnitCost = Number(prod.currentCost) / oldVolume;
        } else if (Number(prod.previousVolume) > 0 && Number(prod.previousCost) > 0) {
          stockUnitCost = Number(prod.previousCost) / Number(prod.previousVolume);
        }
      }
      
      const newCurrentCost = Number((val * stockUnitCost).toFixed(2));
      
      const updatedItems = [...selectedInventory.items];
      updatedItems[idx] = {
        ...prod,
        currentVolume: val,
        currentCost: newCurrentCost
      };
      
      const invRef = doc(db, 'inventoryHistory', selectedInventory.fullId);
      await updateDoc(invRef, {
        items: updatedItems
      });
      
      if (stockDocId && stockData) {
        const newStockVolume = Math.max(0, Number(stockData.totalVolume) + deltaVolume);
        const newStockCost = Math.max(0, Number((newStockVolume * stockUnitCost).toFixed(2)));
        const newUnit = Number(stockData.volumePerUnit) > 0 ? newStockVolume / Number(stockData.volumePerUnit) : 0;
        
        await updateDoc(doc(db, 'stock', stockDocId), {
          totalVolume: newStockVolume,
          totalCost: newStockCost,
          amount: Number(newUnit.toFixed(2))
        });
        
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        const seconds = String(today.getSeconds()).padStart(2, '0');
        const formattedDate = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;

        await addDoc(collection(db, 'stockUsageLogs'), {
          stockId: stockDocId,
          timestamp: new Date().toISOString(),
          date: formattedDate,
          category: 'Correção de Inventário',
          unit: stockData.unitOfMeasurement || prod.unit,
          package: Number(newUnit.toFixed(2)),
          inputProduct: deltaVolume > 0 ? deltaVolume : 0,
          outputProduct: deltaVolume < 0 ? Math.abs(deltaVolume) : 0,
          cost: 0,
          previousVolume: Number(stockData.totalVolume),
          previousCost: Number(stockData.totalCost),
          ContentsInStock: newStockVolume,
          totalResourceInvested: newStockCost,
          noteReasonsEditingProduct: `Correção ref. ao inventário ${selectedInventory.id}: alterado de ${oldVolume} para ${val}`
        });
      }
      
      setSelectedInventory({
        ...selectedInventory,
        items: updatedItems
      });
      setEditingIndex(null);
      setRefreshTrigger(prev => prev + 1);
      if (fetchStock) {
        await fetchStock();
      }
    } catch (err) {
      console.error("Erro ao corrigir inventário:", err);
      alert("Ocorreu um erro ao corrigir o inventário.");
    } finally {
      setIsSavingCorrection(false);
    }
  };

  return (
    <div className={styleEdit.popupOverlay}>
      <div className={styleEdit.containerEditStock} style={{ width: '95%', maxWidth: '1100px', height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className={styleEdit.closeBtnRow}>
          <button className={styleEdit.closeBtn} type="button" onClick={onClose}>
            X
          </button>
        </div>

        <div className={styleEdit.titleRow}>
          <h2>
            {selectedInventory 
              ? `Detalhes do Inventário ${selectedInventory.id}` 
              : activeTab === 'analytics' 
                ? 'Inteligência de Estoque e Receitas' 
                : 'Histórico de Inventários'}
          </h2>
          <p style={{ marginTop: '10px' }}>
            {selectedInventory 
              ? `Data: ${selectedInventory.date}` 
              : activeTab === 'analytics'
                ? 'Análise automatizada de perdas sistemáticas, erros de contagem e calibragem de receitas.'
                : 'Consulta de inventários salvos anteriormente. Clique na linha para detalhes.'}
          </p>
        </div>

        {!selectedInventory && (
          <div className={styleProgress.tabsHeader}>
            <button 
              className={`${styleProgress.tabButton} ${activeTab === 'history' ? styleProgress.active : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Histórico de Inventários
            </button>
            <button 
              className={`${styleProgress.tabButton} ${activeTab === 'analytics' ? styleProgress.active : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Análise de Inteligência
            </button>
          </div>
        )}

        <div className={styleTrack.tableStockContainer} style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          {loading ? (
            <p>Carregando histórico...</p>
          ) : historyItems.length === 0 ? (
            <p>Nenhum histórico encontrado.</p>
          ) : selectedInventory ? (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Antes</th>
                  <th>Depois</th>
                  <th>Dif. Volume</th>
                  <th>Dif. Dinheiro</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {selectedInventory.items.length === 0 && (
                   <tr><td colSpan="6" style={{textAlign: 'center'}}>Sem detalhes de itens para este inventário.</td></tr>
                )}
                {selectedInventory.items.map((prod, idx) => {
                  const difVol = Number(prod.currentVolume) - Number(prod.previousVolume);
                  const difCost = Number(prod.currentCost) - Number(prod.previousCost);
                  
                  const isNegative = difCost < 0;
                  const isPositive = difCost > 0;
                  const color = isNegative ? 'red' : isPositive ? '#007bff' : 'inherit';
                  
                  return (
                    <tr key={idx}>
                      <td>{prod.product}</td>
                      <td>{Number(prod.previousVolume).toFixed(2)} {prod.unit}</td>
                      <td>
                        {editingIndex === idx ? (
                           <input 
                              type="text" 
                              value={editValue} 
                              onChange={(e) => {
                                 let val = e.target.value.replace(',', '.');
                                 if (val !== '' && isNaN(Number(val))) return;
                                 setEditValue(val);
                              }}
                              style={{ width: '80px', padding: '5px' }}
                           />
                        ) : (
                           `${Number(prod.currentVolume).toFixed(2)} ${prod.unit}`
                        )}
                      </td>
                      <td>{difVol > 0 ? '+' : ''}{difVol.toFixed(2)} {prod.unit}</td>
                      <td style={{ color: color, fontWeight: 'bold' }}>
                        {difCost > 0 ? '+' : ''}R$ {difCost.toFixed(2).replace('.', ',')}
                      </td>
                      <td>
                        {editingIndex === idx ? (
                           <div style={{ display: 'flex', gap: '10px' }}>
                             <button onClick={() => handleSaveCorrection(prod, idx)} disabled={isSavingCorrection} style={{ color: 'green', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' }}>Salvar</button>
                             <button onClick={() => setEditingIndex(null)} disabled={isSavingCorrection} style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' }}>Cancelar</button>
                           </div>
                        ) : (
                           <button onClick={() => { setEditingIndex(idx); setEditValue(Number(prod.currentVolume).toString()); }} style={{ color: '#007bff', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold' }}>Editar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : activeTab === 'analytics' ? (
            <div className={styleProgress.analysisGrid}>
              {analyticsData.length === 0 ? (
                <p>Nenhuma matéria-prima analisada ainda. Faça mais inventários.</p>
              ) : (
                analyticsData.map((item, idx) => {
                  const hasSystematic = item.pattern === 'Perda Sistemática';
                  const hasFluctuation = item.pattern === 'Flutuação';
                  const isExpanded = expandedProduct === item.product;
                  
                  if (!isExpanded) {
                    // Visualização fechada (apenas nome e badges de status/alertas)
                    return (
                      <div 
                        key={idx} 
                        className={styleProgress.collapsedCard}
                        onClick={() => setExpandedProduct(item.product)}
                      >
                        <div className={styleProgress.collapsedLeft}>
                          <h4 className={styleProgress.cardTitle}>{item.product}</h4>
                          <div className={styleProgress.badgeList}>
                            {item.isHighImpact && (
                              <span className={`${styleProgress.badge} ${styleProgress.highImpact}`}>🚨 Alto Prejuízo</span>
                            )}
                            {hasSystematic && (
                              <span className={`${styleProgress.badge} ${styleProgress.systematic}`}>⚠️ Perda Sistemática</span>
                            )}
                            {hasFluctuation && (
                              <span className={`${styleProgress.badge} ${styleProgress.fluctuation}`}>🔄 Flutuação</span>
                            )}
                            {item.pattern === 'Estável' && (
                              <span className={`${styleProgress.badge} ${styleProgress.stable}`}>✅ Saudável</span>
                            )}
                          </div>
                        </div>
                        <button 
                          className={styleProgress.expandBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProduct(item.product);
                          }}
                        >
                          ▼ Expandir
                        </button>
                      </div>
                    );
                  }

                  // Visualização expandida (conteúdo completo)
                  return (
                    <div key={idx} className={styleProgress.analysisCard}>
                      <div className={styleProgress.cardHeader}>
                        <h4 className={styleProgress.cardTitle}>{item.product}</h4>
                        <div className={styleProgress.badgeList} style={{ marginRight: 'auto', marginLeft: '15px' }}>
                          {item.isHighImpact && (
                            <span className={`${styleProgress.badge} ${styleProgress.highImpact}`}>🚨 Alto Prejuízo</span>
                          )}
                          {hasSystematic && (
                            <span className={`${styleProgress.badge} ${styleProgress.systematic}`}>⚠️ Perda Sistemática</span>
                          )}
                          {hasFluctuation && (
                            <span className={`${styleProgress.badge} ${styleProgress.fluctuation}`}>🔄 Flutuação</span>
                          )}
                          {item.pattern === 'Estável' && (
                            <span className={`${styleProgress.badge} ${styleProgress.stable}`}>✅ Saudável</span>
                          )}
                        </div>
                        <button 
                          className={styleProgress.expandBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedProduct(null);
                          }}
                          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                          ▲ Recolher
                        </button>
                      </div>

                      <div className={styleProgress.cardBody}>
                        <p>{item.explanation}</p>
                        <p>
                          Ajustes históricos: <strong>{item.totalAudits}</strong> contagens |
                          Diferença Acumulada: <strong style={{ color: item.netVolumeDiff < 0 ? '#ef4444' : '#10b981' }}>
                            {item.netVolumeDiff > 0 ? '+' : ''}{item.netVolumeDiff.toFixed(2)} {item.unit}
                          </strong>
                        </p>
                        {item.totalLossValue > 0 && (
                          <p>
                            Prejuízo total estimado: <strong style={{ color: '#ef4444' }}>R$ {item.totalLossValue.toFixed(2).replace('.', ',')}</strong>
                          </p>
                        )}
                        {item.dishesUsingItem.length > 0 && (
                          <p style={{ fontSize: '0.85rem', color: '#a0a0b0' }}>
                            Usado nas receitas de: <em>{item.dishesUsingItem.join(', ')}</em>
                          </p>
                        )}
                        
                        {/* Feedback Loop Alert */}
                        {item.feedbackMessage && (
                          <div className={`${styleProgress.feedbackAlert} ${item.feedbackType === 'success' ? styleProgress.success : styleProgress.neutral}`}>
                            {item.feedbackMessage}
                          </div>
                        )}

                        {/* Gráfico de Tendência SVG (Sparkline) */}
                        {renderSparkline(item.history, item.unit)}

                        {/* Histórico detalhado de inventários (Linha do Tempo) */}
                        <div className={styleProgress.timelineTitle}>Histórico de Contagens:</div>
                        <div className={styleProgress.historyTimeline}>
                          {[...item.history].reverse().map((hist, hIdx) => {
                            const dif = hist.difVol;
                            const isLoss = dif < 0;
                            const isGain = dif > 0;
                            
                            return (
                              <div key={hIdx} className={styleProgress.timelineItem}>
                                <div className={styleProgress.timelineHeader}>
                                  <span>Contagem #{item.history.length - hIdx}</span>
                                  <span className={styleProgress.timelineDate}>{hist.date}</span>
                                </div>
                                <div className={styleProgress.timelineValues}>
                                  <div>Esperado: <span>{hist.previousVolume.toFixed(2)} {item.unit}</span></div>
                                  <div>Real: <span>{hist.currentVolume.toFixed(2)} {item.unit}</span></div>
                                </div>
                                <div className={`${styleProgress.timelineDiff} ${isLoss ? styleProgress.loss : isGain ? styleProgress.gain : styleProgress.stable}`}>
                                  {isLoss ? (
                                    <>↓ Perda de {Math.abs(dif).toFixed(2)} {item.unit}</>
                                  ) : isGain ? (
                                    <>↑ Ganho de {dif.toFixed(2)} {item.unit}</>
                                  ) : (
                                    <>→ Sem discrepância</>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {hasSystematic && item.suggestedCorrectionPct > 0 && (
                        <div className={styleProgress.cardActions}>
                          <p className={styleProgress.cardSuggestion}>
                            Sugestão: Ajustar dose nas receitas em <strong>+{Math.round(item.suggestedCorrectionPct)}%</strong>
                          </p>
                          <button 
                            className={styleProgress.adjustBtn}
                            onClick={() => handleAutomaticRecipeAdjustment(item.product, item.suggestedCorrectionPct)}
                            disabled={isAdjusting}
                          >
                            {isAdjusting ? 'Ajustando...' : 'Calibrar Receitas'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Diferença em dinheiro</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => {
                  const isNegative = item.difference < 0;
                  const isPositive = item.difference > 0;
                  const color = isNegative ? 'red' : isPositive ? '#007bff' : 'inherit'; // #007bff is blue

                  // formatar diferença em dinheiro
                  const absValue = Math.abs(item.difference);
                  const formattedValue = `R$ ${absValue.toFixed(2).replace('.', ',')}`;
                  const prefix = isNegative ? '- ' : isPositive ? '+ ' : '';

                  return (
                    <tr 
                      key={item.fullId}
                      onClick={() => setSelectedInventory(item)}
                      style={{ cursor: 'pointer' }}
                      title="Clique para ver detalhes"
                    >
                      <td style={{ fontWeight: 'bold' }}>{item.id}</td>
                      <td>{item.date}</td>
                      <td style={{ color: color, fontWeight: 'bold' }}>
                        {prefix}{formattedValue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selectedInventory && (
          <div className={styleEdit.btnRow} style={{ justifyContent: 'center', marginTop: '20px' }}>
             <button 
               className={styleEdit.closeBtn} 
               style={{ position: 'relative', top: 0, right: 0, backgroundColor: '#6c757d', color: '#fff' }} 
               type="button" 
               onClick={() => setSelectedInventory(null)}
             >
               Voltar
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistoryPopup;
