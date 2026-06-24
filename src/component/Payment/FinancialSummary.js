import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../config-firebase/firebase';
import { collection, onSnapshot, query, doc, getDoc, setDoc, getDocs, where, updateDoc } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  LabelList,
} from 'recharts';
import style from '../../assets/styles/FinancialSummary.module.scss';
import Title from '../title';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import AddExpensesForm from './ExpensesManegementList/AddExpensesForm';
import CloseBtn from '../closeBtn';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const CustomLegend = ({ data, colors }) => {
  return (
    <div className={style.customLegendContainer}>
      {data.map((entry, index) => {
        const displayName = entry.name.length > 18 ? entry.name.substring(0, 15) + '...' : entry.name;
        return (
          <div key={`legend-${index}`} className={style.legendItem} title={entry.name}>
            <span className={style.legendDot} style={{ backgroundColor: colors[index % colors.length] }}></span>
            <span className={style.legendText}>{displayName}</span>
          </div>
        );
      })}
    </div>
  );
};

const PieTooltip = ({ active, payload, isCurrency }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{ 
        backgroundColor: '#111', 
        padding: '12px', 
        border: '1px solid #FCA311', 
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        minWidth: '150px'
      }}>
        <p style={{ color: '#FCA311', fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '0.9rem' }}>
          {data.name}
        </p>
        <p style={{ color: '#fff', margin: 0, fontSize: '0.85rem' }}>
          {isCurrency ? `R$ ${Number(data.value).toFixed(2)}` : `${data.value} unidades`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomWaterfallTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    let description = '';
    switch (data.name) {
      case 'Receita':
        description = 'É a soma de todas as vendas sem descontar o custo dos ingredientes que foram usados em cada prato. Não é o mesmo que lucro, mas é tudo que foi pago no caixa deste estabelecimento.';
        break;
      case 'CMV':
        description = 'Custo de Mercadoria Vendida. É o custo dos ingredientes e insumos que foram efetivamente usados para preparar os pratos e bebidas vendidos no período.';
        break;
      case 'Resultado Bruto':
        description = 'É a Receita menos o CMV. Mostra quanto o estabelecimento ganhou com as vendas após cobrir o custo dos ingredientes, antes de pagar as outras despesas (como aluguel, luz e funcionários).';
        break;
      case 'Despesas':
        description = 'É a soma de todas as despesas operacionais do período (como aluguel, salários, contas e taxas), excluindo o custo dos ingredientes (CMV).';
        break;
      case 'Resultado Final':
        description = 'É o saldo que sobra (superavit) ou falta (deficit) após subtrair todas as despesas e custos do faturamento total. É o lucro real ou prejuízo do período.';
        break;
      default:
        description = '';
    }

    return (
      <div style={{
        backgroundColor: '#14213D',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '15px',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        maxWidth: '320px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
          paddingBottom: '5px', 
          color: data.color || '#fff',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}>
          {data.name}
        </h4>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '1.2rem', 
          fontWeight: 'bold',
          color: '#fff'
        }}>
          R$ {Number(data.value).toFixed(2)}
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '0.85rem', 
          lineHeight: '1.4', 
          color: '#e0e0e0',
          textAlign: 'left'
        }}>
          {description}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegendItem = ({ entry }) => {
  const [isHovered, setIsHovered] = useState(false);

  const descriptions = {
    'Resultado Bruto': 'É a diferença entre o faturamento total das vendas e o CMV (custo dos ingredientes). Representa o montante que sobrou para pagar todas as outras despesas do restaurante.',
    'Resultado Bruto Acumulado': 'É a soma diária do seu faturamento menos o custo dos ingredientes (CMV). Mostra a evolução do dinheiro que sobra no caixa dia após dia para pagar as despesas operacionais.',
    'Variável': 'Despesas que oscilam conforme o volume de vendas e a operação diária do restaurante (como taxas de cartão, comissões e compras extras).',
    'Despesas Acumuladas': 'Representa a soma acumulada de todos os gastos operacionais que já foram de fato pagos no período. Ela engloba tanto as contas fixas pagas quanto as despesas variáveis, como a compra de insumos e ingredientes. Por ser acumulada dia após dia, esta linha tende apenas a subir ao longo do mês.',
    'Contas a pagar': 'Representa exclusivamente os gastos fixos (como aluguel, salários, luz, etc.) agendados ou pendentes que ainda precisam ser pagos no mês. Como este saldo devedor restante diminui à medida que você realiza os pagamentos e quita seus compromissos, esta linha tende a descer ao longo do mês.',
    'Valor do Estoque': 'O valor total estimado de todas as mercadorias armazenadas. É o dinheiro do estabelecimento que está "parado" em forma de produtos estocados.'
  };

  const explanation = descriptions[entry.value] || entry.value;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        cursor: 'pointer',
        position: 'relative',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        transition: 'background 0.2s',
        userSelect: 'none'
      }}
    >
      <span style={{ 
        display: 'inline-block', 
        width: '12px', 
        height: '4px', 
        backgroundColor: entry.color,
        borderRadius: '2px'
      }} />
      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>
        {entry.value}
      </span>

      {isHovered && explanation && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
          backgroundColor: '#14213D',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '15px',
          borderRadius: '8px',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          width: '280px',
          zIndex: 10005,
          pointerEvents: 'none',
          textAlign: 'left',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)', 
            paddingBottom: '5px', 
            color: entry.color || '#fff',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            {entry.value}
          </h4>
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '0.8rem', 
            lineHeight: '1.4', 
            color: '#e0e0e0'
          }}>
            {explanation}
          </p>
          <div style={{ 
            borderTop: '1px dashed rgba(255, 255, 255, 0.15)', 
            paddingTop: '8px', 
            fontSize: '0.72rem', 
            color: '#FCA311',
            fontStyle: 'italic',
            lineHeight: '1.3'
          }}>
            💡 Dica: Encoste o mouse em cada nódulo (bolinha) ou barra do gráfico para ver os detalhes daquele dia ou mês.
          </div>
        </div>
      )}
    </div>
  );
};

const CustomChartLegend = (props) => {
  const { payload } = props;
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '12px', 
      flexWrap: 'wrap', 
      marginBottom: '15px'
    }}>
      {payload.map((entry, index) => (
        <CustomLegendItem key={`legend-item-${index}`} entry={entry} />
      ))}
    </div>
  );
};

const FinancialSummary = () => {
  const { hasFinancial } = React.useContext(GlobalContext);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [stock, setStock] = useState([]);
  const [dailyStock, setDailyStock] = useState([]);
  const [monthlyStockLogs, setMonthlyStockLogs] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'
  const [showOverduePopup, setShowOverduePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [sideDishes, setSideDishes] = useState([]);
  const [startDateRank, setStartDateRank] = useState(() => {
    const d = new Date();
    // Use local time to avoid timezone offset issues pushing to previous day
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });
  const [endDateRank, setEndDateRank] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [wasteRankingData, setWasteRankingData] = useState([]);
  const [isLoadingWaste, setIsLoadingWaste] = useState(false);
  const [showProductRanking, setShowProductRanking] = useState(false);
  const [showDetailedExpenses, setShowDetailedExpenses] = useState(false);
  const [showWasteRanking, setShowWasteRanking] = useState(false);
  const [showZeroSales, setShowZeroSales] = useState(false);

  const [showRevenueLine, setShowRevenueLine] = useState(true);
  const [showExpensesLine, setShowExpensesLine] = useState(true);
  const [showFixedLine, setShowFixedLine] = useState(true);
  const [showStockLine, setShowStockLine] = useState(true);
  const [productMetric, setProductMetric] = useState('quantity'); // 'quantity' | 'profit'
  const [tableMetric, setTableMetric] = useState('quantity'); // 'quantity' | 'profit'
  const [expenseTableTab, setExpenseTableTab] = useState('fixed'); // 'fixed' | 'variable'

  useEffect(() => {
    const unsubExpenses = onSnapshot(collection(db, 'outgoing'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubRevenue = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRevenue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubItems = onSnapshot(collection(db, 'item'), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSideDishes = onSnapshot(collection(db, 'sideDishes'), (snapshot) => {
      setSideDishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStock = onSnapshot(collection(db, 'stock'), (snapshot) => {
      setStock(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubDailyStock = onSnapshot(collection(db, 'dailyStockSnapshot'), (snapshot) => {
      setDailyStock(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubExpenses();
      unsubRevenue();
      unsubItems();
      unsubSideDishes();
      unsubStock();
      unsubDailyStock();
    };
  }, []);

  useEffect(() => {
    const startISO = new Date(selectedYear, selectedMonth, 1).toISOString();
    const endISO = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999).toISOString();

    const logsQuery = query(
      collection(db, 'stockUsageLogs'),
      where('timestamp', '>=', startISO),
      where('timestamp', '<=', endISO)
    );

    const unsubStockLogs = onSnapshot(logsQuery, (snapshot) => {
      setMonthlyStockLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubStockLogs();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchWasteRanking = async () => {
      // 1. Cutoff: May 2026 onwards
      if (selectedYear < 2026 || (selectedYear === 2026 && selectedMonth < 4)) {
        setWasteRankingData([]);
        return;
      }

      setIsLoadingWaste(true);
      try {
        const monthId = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const wasteCacheRef = doc(db, 'monthlyWasteRanking', monthId);
        
        // Data helpers for the selected month
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
        const startISO = startOfMonth.toISOString();
        const endISO = endOfMonth.toISOString();

        // Check if the month is already in the past
        const now = new Date();
        const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth < now.getMonth());

        if (isPastMonth) {
          const cacheSnap = await getDoc(wasteCacheRef);
          if (cacheSnap.exists()) {
            setWasteRankingData(cacheSnap.data().ranking || []);
            setIsLoadingWaste(false);
            return;
          }
        }

        // If not cached or is current month, calculate it!
        const lossesMap = {}; // key: product name -> value: { total: number, events: [] }
        
        // A) Inventory History (Audits)
        const inventoryQuery = query(
          collection(db, 'inventoryHistory'),
          where('timestamp', '>=', startOfMonth.getTime()),
          where('timestamp', '<=', endOfMonth.getTime())
        );
        const inventorySnap = await getDocs(inventoryQuery);
        inventorySnap.forEach(docSnap => {
          const data = docSnap.data();
          const auditDate = data.date || new Date(data.timestamp).toLocaleDateString();
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
              if (item.product && item.lossValue > 0) {
                if (!lossesMap[item.product]) lossesMap[item.product] = { total: 0, events: [] };
                lossesMap[item.product].total += Number(item.lossValue);
                lossesMap[item.product].events.push({
                   date: auditDate,
                   reason: 'Auditoria de Estoque (Falta)',
                   quantity: item.lossVolume || Math.abs(item.correction || 0),
                   unit: item.unit || '',
                   value: Number(item.lossValue)
                });
              }
            });
          }
        });

        // B) Stock Usage Logs (Edits)
        const logsQuery = query(
          collection(db, 'stockUsageLogs'),
          where('timestamp', '>=', startISO),
          where('timestamp', '<=', endISO)
        );
        const logsSnap = await getDocs(logsQuery);
        
        // We need product names, so map stockId -> productName
        const stockRef = collection(db, 'stock');
        const stockSnap = await getDocs(stockRef);
        const stockMap = {};
        stockSnap.forEach(s => stockMap[s.id] = s.data().product);

        logsSnap.forEach(docSnap => {
          const data = docSnap.data();
          // Filter: Must have noteReasonsEditingProduct, and must NOT be 'Auditoria de Estoque'
          if (data.noteReasonsEditingProduct && data.noteReasonsEditingProduct !== 'Auditoria de Estoque') {
            const previousCost = Number(data.previousCost) || 0;
            const currentCost = Number(data.totalResourceInvested) || 0;
            const lossValue = previousCost - currentCost;
            
            if (lossValue > 0) {
              const productName = stockMap[data.stockId] || 'Produto Desconhecido';
              const previousVolume = Number(data.previousVolume) || 0;
              const currentVolume = Number(data.ContentsInStock) || 0;
              const lossQty = previousVolume - currentVolume;

              if (!lossesMap[productName]) lossesMap[productName] = { total: 0, events: [] };
              lossesMap[productName].total += lossValue;
              lossesMap[productName].events.push({
                 date: data.date || new Date(data.timestamp || 0).toLocaleDateString(),
                 reason: data.noteReasonsEditingProduct,
                 quantity: lossQty > 0 ? lossQty : 0,
                 unit: data.unit || '',
                 value: lossValue
              });
            }
          }
        });

        // C) Consolidate and Sort
        const ranking = Object.entries(lossesMap)
          .map(([name, data]) => ({ name: `${name} (R$ ${data.total.toFixed(2)})`, value: data.total, events: data.events }))
          .sort((a, b) => b.value - a.value);

        setWasteRankingData(ranking);

        // Save to cache
        await setDoc(wasteCacheRef, {
          month: selectedMonth + 1,
          year: selectedYear,
          isClosed: isPastMonth,
          ranking: ranking,
          updatedAt: Date.now()
        });

      } catch (err) {
        console.error("Erro ao buscar waste ranking:", err);
      } finally {
        setIsLoadingWaste(false);
      }
    };

    fetchWasteRanking();
  }, [selectedMonth, selectedYear]);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-') && !dateStr.includes('/')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    const [datePart] = dateStr.split(' - ');
    const parts = datePart.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredData = useMemo(() => {
    const monthExpenses = expenses.filter(exp => {
      const dPay = parseDate(exp.paymentDate);
      const dDue = parseDate(exp.dueDate);
      const inPay = dPay && dPay.getMonth() === selectedMonth && dPay.getFullYear() === selectedYear;
      const inDue = dDue && dDue.getMonth() === selectedMonth && dDue.getFullYear() === selectedYear;
      return (inPay || inDue) && exp.entryType !== 'stock' && exp.name?.toLowerCase() !== 'entrada de estoque';
    });

    const monthRevenue = revenue.filter(rev => {
      const d = parseDate(rev.dateTime);
      return d && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return { monthExpenses, monthRevenue };
  }, [expenses, revenue, selectedMonth, selectedYear]);

  const calculateItemProfit = (item) => {
    const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
    let cost = 0;

    if (item.historicalCost !== undefined) {
      cost = Number(item.historicalCost);
    } else {
      let sideDishesCost = 0;
      if (item.sideDishes && item.sideDishes.length > 0) {
        item.sideDishes.forEach((sd) => {
          const sdObj = sideDishes.find((dish) => dish.sideDishes === sd.name);
          if (sdObj && !sdObj.isBasic && sdObj.costPriceObj) {
            sideDishesCost += Number(sdObj.costPriceObj.cost || 0);
          }
        });
      }

      let selectedDish = menuItems.find((m) => m.id === item.id);
      if (!selectedDish) {
        selectedDish = menuItems.find((m) => m.title && item.name && m.title.trim().toLowerCase() === item.name.trim().toLowerCase());
      }
      
      let mainCost = 0;
      if (selectedDish) {
        const { costProfitMarginCustomized = {}, costPriceObj = {} } = selectedDish;
        if (!item.size || item.size === '') {
          mainCost = Number(costPriceObj.cost || 0);
        } else {
          const currentCostData = Object.values(costProfitMarginCustomized || {}).find(
            (priceObj) => priceObj.label === item.size
          );
          if (currentCostData) {
            mainCost = Number(currentCostData.cost || 0);
          }
        }
      }

      cost = mainCost + sideDishesCost;
    }

    return finalPrice - cost;
  };

  const stats = useMemo(() => {
    const totalStockValue = stock
      .filter(item => item.operationSupplies === false && (item.activityStatus === undefined || item.activityStatus === false))
      .reduce((acc, item) => acc + (Number(item.totalCost) || 0), 0);

    if (viewMode === 'annual') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time for date comparisons
      
      const isSelectedCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
      
      let refMonth = selectedMonth;
      let refYear = selectedYear;
      if (isSelectedCurrentMonth) {
        if (selectedMonth === 0) {
          refMonth = 11; refYear = selectedYear - 1;
        } else {
          refMonth = selectedMonth - 1;
        }
      }

      // 1. Calcula os dados do MÊS DE REFERÊNCIA (para projeções futuras)
      const getRealStatsForMonth = (m, y) => {
        const monthRevenue = revenue.filter(rev => {
          const d = parseDate(rev.dateTime);
          return d && d.getMonth() === m && d.getFullYear() === y;
        });
        const monthExpenses = expenses.filter(exp => {
          const dPay = parseDate(exp.paymentDate);
          return dPay && dPay.getMonth() === m && dPay.getFullYear() === y && exp.confirmation && exp.entryType !== 'stock' && exp.name?.toLowerCase() !== 'entrada de estoque';
        });

        const profitValue = monthRevenue.reduce((acc, rev) => {
          return acc + (rev.request || []).reduce((a, item) => a + calculateItemProfit(item), 0);
        }, 0);

        const variableValue = monthExpenses
          .filter(exp => exp.category !== 'fixed')
          .reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);

        return { profit: profitValue, variable: variableValue };
      };

      const refStats = getRealStatsForMonth(refMonth, refYear);

      const annualData = [];
      let totalAnnualProfit = 0;
      let totalAnnualVariable = 0;
      let totalAnnualFixed = 0;

      for (let i = 0; i < 12; i++) {
        const m = (selectedMonth + i) % 12;
        const y = selectedYear + Math.floor((selectedMonth + i) / 12);
        
        // Compara com a data atual para decidir se usa Real ou Estimado
        const targetDate = new Date(y, m, 1);
        const currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const isFuture = targetDate > currentDate;

        let profit, variable;

        if (isFuture) {
          // Futuro: Usa estimativa baseada no mês de referência
          profit = refStats.profit;
          variable = refStats.variable;
        } else {
          // Passado ou Presente: Usa dados REAIS do mês em questão
          const actualStats = getRealStatsForMonth(m, y);
          profit = actualStats.profit;
          variable = actualStats.variable;
        }

        // Custo Fixo: Sempre Real (baseado em dueDate)
        const monthFixed = expenses
          .filter(exp => {
            const dDue = parseDate(exp.dueDate);
            return exp.category === 'fixed' && dDue && dDue.getMonth() === m && dDue.getFullYear() === y && exp.entryType !== 'stock' && exp.name?.toLowerCase() !== 'entrada de estoque';
          })
          .reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);

        annualData.push({
          month: m,
          year: y,
          profit,
          variable,
          fixed: monthFixed,
          isEstimated: isFuture,
          stockValue: (y > 2026 || (y === 2026 && m >= 5)) ? totalStockValue : null,
          monthName: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][m]
        });

        totalAnnualProfit += profit;
        totalAnnualVariable += variable;
        totalAnnualFixed += monthFixed;
      }

      return {
        totalRevenue: totalAnnualProfit,
        totalPaid: totalAnnualVariable,
        totalFixed: totalAnnualFixed,
        remainingFixed: totalAnnualFixed,
        superavit: totalAnnualProfit - totalAnnualVariable - totalAnnualFixed,
        totalStockValue,
        dailyData: annualData,
        viewMode: 'annual',
        refMonthName: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][refMonth],
        overdue: [],
        topProductsQty: [],
        topProductsProfit: [],
        topExpensesPie: [],
      };
    }

    const { monthExpenses, monthRevenue } = filteredData;

    const totalEstimatedFixed = monthExpenses
      .filter(exp => {
        const dDue = parseDate(exp.dueDate);
        return exp.category === 'fixed' && dDue && dDue.getMonth() === selectedMonth && dDue.getFullYear() === selectedYear && exp.entryType !== 'stock';
      })
      .reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      profit: 0,
      expenses: 0,
      profitCum: 0,
      expensesCum: 0,
      fixedRemaining: 0,
      expensesList: [],
      dueFixedList: [],
    }));

    let grossRevenueTotal = 0;
    let cmvTotal = 0;

    // Daily Profit and Due Fixed Expenses
    monthRevenue.forEach(rev => {
      const d = parseDate(rev.dateTime);
      if (d) {
        const dayIdx = d.getDate() - 1;
        if (dailyData[dayIdx]) {
          (rev.request || []).forEach(item => {
            const finalPrice = Number(item.finalPrice) || Number(item.price) || 0;
            const profit = calculateItemProfit(item);
            const cost = finalPrice - profit;
            
            grossRevenueTotal += finalPrice;
            cmvTotal += cost;

            dailyData[dayIdx].profit += profit;
          });
        }
      }
    });

    monthExpenses.forEach(exp => {
      const dDue = parseDate(exp.dueDate);
      if (exp.category === 'fixed' && dDue && dDue.getMonth() === selectedMonth && dDue.getFullYear() === selectedYear && exp.entryType !== 'stock') {
        const dayIdx = dDue.getDate() - 1;
        if (dailyData[dayIdx]) {
          dailyData[dayIdx].dueFixedList.push(exp);
        }
      }
    });

    // Daily actual payments
    monthExpenses.forEach(exp => {
      const dPay = parseDate(exp.paymentDate);
      if (dPay && dPay.getMonth() === selectedMonth && dPay.getFullYear() === selectedYear && exp.confirmation) {
        const dayIdx = dPay.getDate() - 1;
        if (dailyData[dayIdx]) {
          const val = Number(exp.confirmation) || 0;
          dailyData[dayIdx].expenses += val;
          dailyData[dayIdx].expensesList.push({ name: exp.name, value: val, category: exp.category });
        }
      }
    });

    let currentProfitCum = 0;
    let currentExpensesCum = 0;
    let currentFixedRemaining = totalEstimatedFixed;

    // Build chronological dailyStock array to carry over values
    const sortedStock = [...dailyStock].sort((a,b) => new Date(a.date) - new Date(b.date));
    
    // Group variations by day using monthlyStockLogs
    const dailyVariations = {};
    monthlyStockLogs.forEach(log => {
      const d = new Date(log.timestamp);
      const day = d.getDate();
      const prevCost = Number(log.previousCost) || 0;
      const currCost = Number(log.totalResourceInvested) || 0;
      const diff = currCost - prevCost;
      
      if (!dailyVariations[day]) dailyVariations[day] = 0;
      dailyVariations[day] += diff;
    });

    const stockByDay = new Array(daysInMonth + 1).fill(null);
    
    // 1. Fill stockByDay with snapshots where available
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const snapForDay = sortedStock.find(s => s.id === currentDayStr);
      if (snapForDay) {
          stockByDay[day] = snapForDay.totalStockValue;
      }
    }

    // 2. Fallback for today if no snapshot exists yet
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) {
       const todayDate = today.getDate();
       stockByDay[todayDate] = totalStockValue;
    }

    // 3. Backwards reconstruction: calculates past end-of-day stock using recorded daily variations
    for (let day = daysInMonth - 1; day >= 1; day--) {
       if (stockByDay[day] === null && stockByDay[day + 1] !== null) {
           const diffNextDay = dailyVariations[day + 1] || 0;
           stockByDay[day] = stockByDay[day + 1] - diffNextDay;
       }
    }

    // 4. Forward carry-over: if a future day has no snapshot, carry over the last known value
    for (let day = 2; day <= daysInMonth; day++) {
       if (stockByDay[day] === null && stockByDay[day - 1] !== null) {
           stockByDay[day] = stockByDay[day - 1] + (dailyVariations[day] || 0);
       }
    }

    dailyData.forEach(day => {
      currentProfitCum += day.profit;
      currentExpensesCum += day.expenses;
      
      day.expensesList.forEach(exp => {
        if (exp.category === 'fixed') {
          currentFixedRemaining -= exp.value;
        }
      });

      const targetDate = new Date(selectedYear, selectedMonth, day.day);
      if (targetDate > today) {
         day.profitCum = null;
         day.expensesCum = null;
         day.fixedRemaining = null;
         day.stockValue = null;
      } else {
         day.profitCum = currentProfitCum;
         day.expensesCum = currentExpensesCum;
         day.fixedRemaining = Math.max(0, currentFixedRemaining);
         if (selectedYear > 2026 || (selectedYear === 2026 && selectedMonth >= 5)) {
            day.stockValue = stockByDay[day.day];
         } else {
            day.stockValue = null;
         }
      }
    });

    const totalPaidFixed = monthExpenses
      .filter(exp => {
        const dPay = parseDate(exp.paymentDate);
        return exp.category === 'fixed' && dPay && dPay.getMonth() === selectedMonth && dPay.getFullYear() === selectedYear && exp.entryType !== 'stock';
      })
      .reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);
    
    const profitTotal = currentProfitCum;
    const expensesTotal = currentExpensesCum;
    const remainingFixed = Math.max(0, totalEstimatedFixed - totalPaidFixed);

    const overdue = monthExpenses.filter(exp => {
      if (exp.category !== 'fixed' || exp.paymentDate || !exp.dueDate) return false;
      const due = parseDate(exp.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      return due < today;
    });

    // Top Products Logic (Quantity & Profit)
    const productQtyMap = {};
    const productProfitMap = {};
    monthRevenue.forEach(rev => {
      (rev.request || []).forEach(item => {
        const name = item.product || item.name || 'Produto s/ nome';
        const qty = Number(item.amount || item.quantity || 1);
        if (qty > 0) {
          productQtyMap[name] = (productQtyMap[name] || 0) + qty;
          
          const unitProfit = calculateItemProfit(item);
          const totalProfit = unitProfit * qty;
          productProfitMap[name] = (productProfitMap[name] || 0) + totalProfit;
        }
      });
    });
    const topProductsQty = Object.entries(productQtyMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 Qty

    const topProductsProfit = Object.entries(productProfitMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 Profit

    // Top Expenses Logic (Pie)
    const expensePieMap = {};
    monthExpenses.forEach(exp => {
      const name = exp.name;
      const value = Number(exp.confirmation || 0);
      if (name && value > 0) {
        expensePieMap[name] = (expensePieMap[name] || 0) + value;
      }
    });
    const topExpensesPie = Object.entries(expensePieMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      totalRevenue: profitTotal,
      grossRevenueTotal,
      cmvTotal,
      totalPaid: expensesTotal,
      remainingFixed,
      superavit: profitTotal - expensesTotal - remainingFixed, // Adjusted superavit calculation
      totalStockValue,
      dailyData,
      overdue,
      topProductsQty,
      topProductsProfit,
      topExpensesPie,
    };
  }, [filteredData, selectedMonth, selectedYear, viewMode, expenses, revenue, menuItems, sideDishes, stock, dailyStock, monthlyStockLogs]);

  const averageDailyCMV = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
    let daysToDivide = 1;
    
    if (isCurrentMonth) {
      daysToDivide = Math.max(1, now.getDate());
    } else {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      daysToDivide = Math.max(1, daysInMonth);
    }
    
    return (stats.cmvTotal || 0) / daysToDivide;
  }, [stats.cmvTotal, selectedMonth, selectedYear]);

  useEffect(() => {
    if (stats.overdue.length > 0) {
      setShowOverduePopup(true);
    }
  }, [stats.overdue.length]);

  // Reset viewMode when period changes
  useEffect(() => {
    setViewMode('monthly');
  }, [selectedMonth, selectedYear]);

  const detailedExpensesList = useMemo(() => {
    const isPending = (exp) => !exp.paymentDate || !exp.confirmation || Number(exp.confirmation) === 0;
    return [...filteredData.monthExpenses].sort((a, b) => {
      // First, sort by pending vs paid (pending first)
      const aPending = isPending(a);
      const bPending = isPending(b);
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;

      // Then sort by due date
      const dDueA = parseDate(a.dueDate);
      const dDueB = parseDate(b.dueDate);
      if (dDueA && dDueB) {
        return dDueA - dDueB;
      }
      return 0;
    });
  }, [filteredData.monthExpenses]);

  const productRankingList = useMemo(() => {
    const rankingMap = {};
    // Initialize all active menu items with 0 sales and 0 profit
    menuItems.forEach(item => {
      if (item.title) {
        rankingMap[item.title] = { sold: 0, profit: 0 };
      }
    });

    const sDate = startDateRank ? new Date(`${startDateRank}T00:00:00`) : new Date('2000-01-01');
    const eDate = endDateRank ? new Date(`${endDateRank}T23:59:59`) : new Date('2100-01-01');

    revenue.forEach(rev => {
      const d = parseDate(rev.dateTime);
      if (d && d >= sDate && d <= eDate) {
        (rev.request || []).forEach(reqItem => {
          const name = reqItem.product || reqItem.name;
          const qty = Number(reqItem.amount || reqItem.quantity || 1);
          if (name && qty > 0) {
            // Only count if it's currently in the menu (this excludes deleted products)
            if (rankingMap.hasOwnProperty(name)) {
              rankingMap[name].sold += qty;
              
              const unitProfit = calculateItemProfit(reqItem);
              rankingMap[name].profit += (unitProfit * qty);
            }
          }
        });
      }
    });

    return Object.entries(rankingMap)
      .map(([name, data]) => ({ name, sold: data.sold, profit: data.profit }))
      .sort((a, b) => {
        if (tableMetric === 'quantity') {
          return b.sold - a.sold;
        } else {
          return b.profit - a.profit;
        }
      });
  }, [revenue, menuItems, startDateRank, endDateRank, tableMetric]);

  const { productsWithSales, productsWithoutSales } = useMemo(() => {
    const withSales = [];
    const withoutSales = [];
    productRankingList.forEach(prod => {
      if (prod.sold > 0) {
        withSales.push(prod);
      } else {
        withoutSales.push(prod);
      }
    });
    return { productsWithSales: withSales, productsWithoutSales: withoutSales };
  }, [productRankingList]);

  const maxWasteValue = useMemo(() => {
    if (!wasteRankingData || wasteRankingData.length === 0) return 0;
    return Math.max(...wasteRankingData.map(item => item.value));
  }, [wasteRankingData]);

  const CustomWasteTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(20, 33, 61, 0.95)',
          border: '1px solid #444',
          padding: '15px',
          borderRadius: '8px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          width: '280px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px', color: '#FCA311' }}>
            {data.name}
          </h4>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#00ff88', fontWeight: 'bold' }}>
            Total Desperdiçado: R$ {Number(data.value).toFixed(2)}
          </p>
          <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
            {data.events && data.events.length > 0 ? data.events.map((ev, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '2px' }}>{ev.date} • {ev.reason}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{Number(ev.quantity).toFixed(2)} {ev.unit}</span>
                  <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>R$ {Number(ev.value).toFixed(2)}</span>
                </div>
              </div>
            )) : (
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Sem detalhes adicionais.</div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (viewMode === 'annual') {
        const data = payload[0]?.payload || {};
        const profit = Number(data.profit) || 0;
        const variable = Number(data.variable) || 0;
        const fixed = Number(data.fixed) || 0;
        return (
          <div className={style.customTooltip}>
            <h4>{(data.monthName || '') + ' ' + (data.year || '')}</h4>
            <div className={style.statusBadge} style={{ 
              color: data.isEstimated ? '#FCA311' : '#00ff88',
              fontSize: '0.75rem',
              marginBottom: '5px',
              fontWeight: 'bold'
            }}>
              {data.isEstimated ? '📊 PROJEÇÃO' : '✅ DADOS REAIS'}
            </div>
            {showRevenueLine && (
              <div className={`${style.tooltipItem} ${style.green}`}>
                <span>{data.isEstimated ? 'Resultado Bruto Estimado:' : 'Resultado Bruto Real:'}</span>
                <strong>R$ {profit.toFixed(2)}</strong>
              </div>
            )}
            {showExpensesLine && (
              <div className={`${style.tooltipItem} ${style.red}`}>
                <span>{data.isEstimated ? 'Despesa Variável:' : 'Despesa Real:'}</span>
                <strong>R$ {variable.toFixed(2)}</strong>
              </div>
            )}
            {showFixedLine && (
              <div className={`${style.tooltipItem} ${style.yellow}`}>
                <span>Contas a pagar:</span>
                <strong>R$ {fixed.toFixed(2)}</strong>
              </div>
            )}
            {showStockLine && data.stockValue !== null && (
              <div className={`${style.tooltipItem}`} style={{ color: '#0088FE' }}>
                <span>Valor do Estoque:</span>
                <strong>R$ {(Number(data.stockValue) || 0).toFixed(2)}</strong>
              </div>
            )}
          </div>
        );
      }
      const data = payload[payload.length - 1]?.payload || {};
      const profit = Number(data.profit) || 0;
      const profitCum = Number(data.profitCum) || 0;
      const expenses = Number(data.expenses) || 0;
      const expensesCum = Number(data.expensesCum) || 0;
      const fixedRemaining = Number(data.fixedRemaining) || 0;
      return (
        <div className={style.customTooltip}>
          <h4>Dia {label}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            {showRevenueLine && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88', fontSize: '0.9rem' }}>
                  <span>Resultado Bruto do dia:</span>
                  <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                    <span>R$</span>
                    <span>{profit.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88', fontSize: '0.9rem' }}>
                  <span>Resultado Bruto Acumulado:</span>
                  <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                    <span>R$</span>
                    <span>{profitCum.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            {showExpensesLine && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4d', fontSize: '0.9rem' }}>
                  <span>Despesa do dia:</span>
                  <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                    <span>R$</span>
                    <span>{expenses.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff4d4d', fontSize: '0.9rem' }}>
                  <span>Despesas Acumuladas:</span>
                  <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                    <span>R$</span>
                    <span>{expensesCum.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            {showFixedLine && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FCA311', fontSize: '0.9rem' }}>
                <span>Contas a pagar:</span>
                <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                  <span>R$</span>
                  <span>{fixedRemaining.toFixed(2)}</span>
                </div>
              </div>
            )}
            {showStockLine && data.stockValue !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0088FE', fontSize: '0.9rem' }}>
                <span>Valor do Estoque:</span>
                <div style={{ display: 'flex', width: '120px', justifyContent: 'space-between' }}>
                  <span>R$</span>
                  <span>{(Number(data.stockValue) || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          {showExpensesLine && (() => {
            console.log('Tooltip render day:', label, 'expensesList:', data.expensesList);
            return data.expensesList.length > 0 && (
              <div className={style.details}>
                {/* Non-discard expenses */}
                {data.expensesList.filter(ex => !ex.name || !ex.name.toLowerCase().includes('descarte')).map((ex, i) => (
                  <div key={`exp-${i}`} className={style.expenseItem}>
                    <span>{ex.name} ({ex.category === 'fixed' ? 'Fixa' : 'Var'}):</span>
                    <strong>R$ {ex.value.toFixed(2)}</strong>
                  </div>
                ))}
                
                {/* Grouped discard expenses */}
                {data.expensesList.some(ex => ex.name && ex.name.toLowerCase().includes('descarte')) && (
                  <div style={{ marginTop: '5px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '5px' }}>
                    <span style={{ color: '#FCA311', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      Descarte de MP:
                    </span>
                    {data.expensesList.filter(ex => ex.name && ex.name.toLowerCase().includes('descarte')).map((ex, i) => {
                      const subtitle = ex.name.includes('-') 
                        ? ex.name.split('-').slice(1).join('-').trim() 
                        : ex.name;
                      return (
                        <div key={`discard-${i}`} className={style.expenseItem} style={{ paddingLeft: '8px', marginBottom: '2px' }}>
                          <span style={{ color: '#ccc' }}>↳ {subtitle}:</span>
                          <strong style={{ color: '#fff' }}>R$ {ex.value.toFixed(2)}</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          {showFixedLine && data.dueFixedList && data.dueFixedList.length > 0 && (
            <div className={`${style.details} ${style.dueSection}`}>
              <h5 style={{ color: '#FCA311', marginBottom: '5px' }}>Vencimentos Hoje:</h5>
              {data.dueFixedList.map((ex, i) => (
                <div key={i} className={style.expenseItem}>
                  <span>{ex.name}:</span>
                  <span>R$ {Number(ex.value).toFixed(2)}</span>
                </div>
              ))}
              <small style={{ color: '#ccc', display: 'block', marginTop: '5px' }}>Clique na bolinha para pagar</small>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDotClick = (expense) => {
    setSelectedExpense(expense);
    setShowEditPopup(true);
  };

  const handlePayExpense = async (expense) => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      
      const expenseRef = doc(db, 'outgoing', expense.id);
      await updateDoc(expenseRef, {
        paymentDate: todayStr,
        confirmation: Number(expense.value) || 0
      });
    } catch (error) {
      console.error("Erro ao pagar conta automaticamente:", error);
      alert("Erro ao processar o pagamento.");
    }
  };

  const CustomYellowDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload && payload.dueFixedList && payload.dueFixedList.length > 0) {
      return (
        <g 
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={(e) => {
              e.stopPropagation();
              handleDotClick(payload.dueFixedList[0]);
          }}
        >
          <circle 
            cx={cx} cy={cy} r={7} 
            fill="#FCA311" stroke="#fff" strokeWidth={2} 
          />
          <circle 
            cx={cx} cy={cy} r={12} 
            fill="transparent"
          />
        </g>
      );
    }
    return null;
  };

  const CustomXAxisTick = (props) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#888" fontSize={12} fontWeight="bold">
          {payload.value}
        </text>
        {payload.value === 'CMV' && (
          <text x={0} y={0} dy={30} textAnchor="middle" fill="#888" fontSize={10}>
            (Custo da Mercadoria Vendida)
          </text>
        )}
      </g>
    );
  };

  const waterfallData = [
    { name: 'Receita', value: stats.grossRevenueTotal || 0, color: '#0088FE' },
    { name: 'CMV', value: stats.cmvTotal || 0, color: '#ffc658' },
    { name: 'Resultado Bruto', value: stats.totalRevenue || 0, color: '#00C49F' },
    { name: 'Despesas', value: (stats.totalPaid || 0) + (stats.remainingFixed || 0), color: '#ff9f43' },
    { 
      name: 'Resultado Final', 
      value: stats.superavit || 0, 
      color: (stats.superavit || 0) > 0 ? '#00ff88' : ((stats.superavit || 0) < 0 ? '#ff7b9c' : '#a0a0a0') 
    }
  ];

  const getSuperavitStatusText = () => {
    if ((stats.superavit || 0) > 0) return 'Resultado positivo';
    if ((stats.superavit || 0) < 0) return 'Resultado negativo';
    return 'Ponto de equilíbrio';
  };

  if (!hasFinancial) return <div className={style.accessDenied}>Acesso Restrito ao Pacote Financeiro</div>;

  return (
    <div className={style.container}>
      {showOverduePopup && (
        <div className={style.overduePopupOverlay}>
          <div className={style.overduePopup}>
            <h3>⚠️ Despesas Fixas Pendentes</h3>
            <p>As seguintes contas ultrapassaram o vencimento e não foram pagas:</p>
            <ul>
              {stats.overdue.map(exp => (
                <li key={exp.id}>
                  <strong>{exp.name}</strong> - Venceu em: {exp.dueDate} (R$ {Number(exp.value).toFixed(2)})
                </li>
              ))}
            </ul>
            <button onClick={() => setShowOverduePopup(false)}>Entendi / Resolver Depois</button>
          </div>
        </div>
      )}

      <div className={style.headerContainer}>
        <div className={style.titleRow}>
          <Link to="/admin/admin" className={style.titleLink}>
            <Title mainTitle={`Corrida do Lucro ${viewMode === 'annual' ? 'Anual' : 'Mensal'}`} />
          </Link>
        </div>
        <Link to="/admin/admin" className={style.btnBack} title="Sair do Módulo">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div className={style.actionsRow}>
          <div className={style.helpIconContainer}>
            <a
              href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.x6o9zkqvyxt2"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir documentação"
            >
              <span>?</span>
            </a>
          </div>
          <button 
            className={`${style.annualToggle} ${viewMode === 'annual' ? style.active : ''}`}
            onClick={() => setViewMode(v => v === 'monthly' ? 'annual' : 'monthly')}
          >
            {viewMode === 'annual' ? '📊 Ver Mensal' : '📅 Resumo Anual'}
          </button>
        </div>
      </div>

      <div className={style.controls}>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className={style.dashboardCards}>
        <div className={`${style.card} ${stats.superavit >= 0 ? style.profit : style.loss}`}>
          <span>Resultado atual</span>
          <strong>R$ {Math.abs(stats.superavit).toFixed(2)}</strong>
          <small>{stats.superavit >= 0 ? 'Superavit' : 'Deficit'}</small>
        </div>
        <div 
          className={`${style.card} ${style.profit} ${!showRevenueLine ? style.inactiveCard : ''}`}
          onClick={() => setShowRevenueLine(prev => !prev)}
        >
          <div className={style.cardHeader}>
            <span>Resultado Bruto Acumulado</span>
            <div className={`${style.customCheckbox} ${showRevenueLine ? style.checked : ''}`}>
              {showRevenueLine && '✓'}
            </div>
          </div>
          <strong>R$ {stats.totalRevenue.toFixed(2)}</strong>
        </div>
        <div 
          className={`${style.card} ${style.loss} ${!showExpensesLine ? style.inactiveCard : ''}`}
          onClick={() => setShowExpensesLine(prev => !prev)}
        >
          <div className={style.cardHeader}>
            <span>Despesas Acumuladas</span>
            <div className={`${style.customCheckbox} ${showExpensesLine ? style.checked : ''}`}>
              {showExpensesLine && '✓'}
            </div>
          </div>
          <strong>R$ {stats.totalPaid.toFixed(2)}</strong>
        </div>
        <div 
          className={`${style.card} ${style.fixed} ${!showFixedLine ? style.inactiveCard : ''}`}
          onClick={() => setShowFixedLine(prev => !prev)}
        >
          <div className={style.cardHeader}>
            <span>Contas a pagar</span>
            <div className={`${style.customCheckbox} ${showFixedLine ? style.checked : ''}`}>
              {showFixedLine && '✓'}
            </div>
          </div>
          <strong>R$ {stats.remainingFixed.toFixed(2)}</strong>
        </div>
        {(selectedYear > 2026 || (selectedYear === 2026 && selectedMonth >= 5)) && (
          <div 
            className={`${style.card} ${!showStockLine ? style.inactiveCard : ''}`}
            onClick={() => setShowStockLine(prev => !prev)}
            style={{ 
              backgroundColor: showStockLine ? '#0088FE' : '#1a1a1a', 
              color: showStockLine ? '#fff' : '#555', 
              border: showStockLine ? '1px solid #0056b3' : '1px solid #333',
              cursor: 'pointer',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}
          >
            <div className={style.cardHeader}>
              <span style={{ color: showStockLine ? '#fff' : '#444' }}>Valor do Estoque</span>
              <div 
                className={`${style.customCheckbox} ${showStockLine ? style.checked : ''}`}
                style={{ 
                  color: showStockLine ? '#0088FE' : '#444',
                  borderColor: showStockLine ? '#fff' : '#444'
                }}
              >
                {showStockLine && '✓'}
              </div>
            </div>
            <strong>R$ {(stats.totalStockValue || 0).toFixed(2)}</strong>
            <div style={{ 
              marginTop: '8px', 
              borderTop: showStockLine ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #333', 
              paddingTop: '6px', 
              fontSize: '0.62rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              textAlign: 'left',
              letterSpacing: '-0.015em'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: showStockLine ? '#fff' : '#555', gap: '4px' }}>
                <span style={{ color: 'inherit', whiteSpace: 'nowrap' }}>CMV Médio Diário:</span>
                <span style={{ fontWeight: 'bold', color: 'inherit', whiteSpace: 'nowrap' }}>R$ {averageDailyCMV.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: showStockLine ? '#fff' : '#555', gap: '4px' }}>
                <span style={{ color: 'inherit', whiteSpace: 'nowrap' }}>Cobertura Aproximada:</span>
                <span style={{ fontWeight: 'bold', color: 'inherit', whiteSpace: 'nowrap' }}>{averageDailyCMV > 0 ? `${Math.round((stats.totalStockValue || 0) / averageDailyCMV)} dias` : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={style.chartCard}>
        <h3>{viewMode === 'annual' ? '📊 Projeção de 12 Meses' : '🏁 Evolução Diária (Cumulativo)'}</h3>
        <div className={style.chartContainer}>
          {viewMode === 'annual' ? (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="monthName" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltipContent />} wrapperStyle={{ zIndex: 10000 }} />
                <Legend content={<CustomChartLegend />} />
                {showRevenueLine && <Bar dataKey="profit" fill="#00ff88" name="Resultado Bruto" radius={[4, 4, 0, 0]} />}
                {showExpensesLine && <Bar dataKey="variable" fill="#ff4d4d" name="Variável" radius={[4, 4, 0, 0]} />}
                {showFixedLine && <Bar dataKey="fixed" fill="#FCA311" name="Contas a pagar" radius={[4, 4, 0, 0]} />}
                {showStockLine && (
                  <Line 
                    type="monotone" 
                    dataKey="stockValue" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    name="Valor do Estoque"
                    dot={{ r: 4, fill: '#0088FE', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip content={<CustomTooltipContent />} wrapperStyle={{ zIndex: 10000 }} />
                <Legend content={<CustomChartLegend />} />
                
                {showRevenueLine && (
                  <Line 
                    type="monotone" 
                    dataKey="profitCum" 
                    stroke="#00ff88" 
                    strokeWidth={3}
                    name="Resultado Bruto Acumulado"
                    dot={{ r: 4, fill: '#00ff88', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                )}
                {showExpensesLine && (
                  <Line 
                    type="monotone" 
                    dataKey="expensesCum" 
                    stroke="#ff4d4d" 
                    strokeWidth={3}
                    name="Despesas Acumuladas"
                    dot={{ r: 4, fill: '#ff4d4d', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                )}
                {showFixedLine && (
                  <Line 
                    type="monotone" 
                    dataKey="fixedRemaining" 
                    stroke="#FCA311" 
                    strokeWidth={3}
                    name="Contas a pagar"
                    dot={<CustomYellowDot />}
                    isAnimationActive={false}
                  />
                )}
                {showStockLine && (
                  <Line 
                    type="monotone" 
                    dataKey="stockValue" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    name="Valor do Estoque"
                    dot={{ r: 4, fill: '#0088FE', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {viewMode === 'annual' && (
          <div className={style.annualDisclaimer}>
            * Estimativa baseada no mês de <strong>{stats.refMonthName}</strong>. 
            O lucro e despesas variáveis são replicados, enquanto o custo fixo reflete o cronograma real das suas parcelas agendadas.
          </div>
        )}
      </div>

      {viewMode === 'monthly' && (
        <div className={style.chartCard} style={{ marginTop: '30px' }}>
          <h3>💸 Resultados</h3>
          <div className={style.chartContainer}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={waterfallData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={<CustomXAxisTick />} />
                <YAxis stroke="#888" tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip content={<CustomWaterfallTooltip />} wrapperStyle={{ zIndex: 10000 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    formatter={(val) => `R$ ${Number(val).toFixed(2)}`} 
                    fill="#fff" 
                    fontSize={12} 
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: waterfallData[4].color }}>
              {getSuperavitStatusText()}
            </p>
          </div>
        </div>
      )}

      {viewMode === 'monthly' && (
        <div style={{ marginTop: '30px', marginBottom: '30px', width: '100%' }}>
          <div className={style.tableSection}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '15px',
              borderBottom: showDetailedExpenses ? '1px solid #eee' : 'none',
              paddingBottom: showDetailedExpenses ? '12px' : '0',
              marginBottom: showDetailedExpenses ? '15px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h3 style={{ margin: 0 }}>💵 Detalhamento de Despesas</h3>
                <button 
                  onClick={() => setShowDetailedExpenses(prev => !prev)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #14213D',
                    color: '#14213D',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {showDetailedExpenses ? '▲ Recolher' : '▼ Expandir'}
                </button>
              </div>
              
              {showDetailedExpenses && (
                <div className={style.metricToggle}>
                  <button
                    type="button"
                    className={`${style.toggleBtn} ${expenseTableTab === 'fixed' ? style.activeToggle : ''}`}
                    onClick={() => setExpenseTableTab('fixed')}
                  >
                    Fixas
                  </button>
                  <button
                    type="button"
                    className={`${style.toggleBtn} ${expenseTableTab === 'variable' ? style.activeToggle : ''}`}
                    onClick={() => setExpenseTableTab('variable')}
                  >
                    Variáveis
                  </button>
                </div>
              )}
            </div>
            {showDetailedExpenses && (() => {
              const listToShow = expenseTableTab === 'fixed' 
                ? detailedExpensesList.filter(exp => exp.category === 'fixed')
                : detailedExpensesList.filter(exp => exp.category !== 'fixed');
              return (
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Vencimento</th>
                      <th>Pagamento</th>
                      <th>Estimado</th>
                      <th>Pago</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listToShow.map((exp, i) => {
                      const isPending = !exp.paymentDate || !exp.confirmation || Number(exp.confirmation) === 0;
                      const formatData = (dStr) => dStr ? (dStr.includes('-') ? dStr.split('-').reverse().join('/') : dStr) : '-';
                      return (
                        <tr key={i}>
                          <td>{exp.name}</td>
                          <td>{exp.category === 'fixed' ? 'Fixa' : 'Variável'}</td>
                          <td>{formatData(exp.dueDate)}</td>
                          <td>{formatData(exp.paymentDate)}</td>
                          <td>R$ {(Number(exp.value) || 0).toFixed(2)}</td>
                          <td>R$ {(Number(exp.confirmation) || 0).toFixed(2)}</td>
                          <td className={isPending ? style.pending : style.paidStatus}>
                            {isPending ? 'Pendente' : 'Pago'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {isPending ? (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePayExpense(exp);
                                    }}
                                    style={{
                                      backgroundColor: '#00ff88',
                                      color: '#14213D',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '0.8rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    💳 Pagar
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDotClick(exp);
                                    }}
                                    style={{
                                      backgroundColor: '#FCA311',
                                      color: '#fff',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '0.8rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    ✏️ Editar
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDotClick(exp);
                                  }}
                                  style={{
                                    backgroundColor: '#FCA311',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {listToShow.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                          Nenhuma despesa registrada nesta aba.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className={style.pieChartsGrid}>
          <div className={style.pieCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', textAlign: 'left' }}>
                🍕 {productMetric === 'quantity' ? 'Produtos Mais Vendidos (%)' : 'Produtos Mais Lucrativos (%)'}
              </h3>
              <div className={style.metricToggle}>
                <button
                  type="button"
                  className={`${style.toggleBtn} ${productMetric === 'quantity' ? style.activeToggle : ''}`}
                  onClick={() => setProductMetric('quantity')}
                >
                  Qtd
                </button>
                <button
                  type="button"
                  className={`${style.toggleBtn} ${productMetric === 'profit' ? style.activeToggle : ''}`}
                  onClick={() => setProductMetric('profit')}
                >
                  Lucro
                </button>
              </div>
            </div>
            {(() => {
              const topProductsToShow = productMetric === 'quantity' ? stats.topProductsQty : stats.topProductsProfit;
              return topProductsToShow && topProductsToShow.length > 0 ? (
                <>
                  <div className={style.pieWrapper}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={topProductsToShow}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={100}
                          innerRadius={65}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          paddingAngle={3}
                        >
                          {topProductsToShow.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<PieTooltip isCurrency={productMetric === 'profit'} />} wrapperStyle={{ zIndex: 10000 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <CustomLegend data={topProductsToShow} colors={COLORS} />
                </>
              ) : (
                <div className={style.noDataMessage}>As vendas não estavam ativas naquela época.</div>
              );
            })()}
          </div>

          <div className={style.pieCard}>
            <h3>💸 Distribuição de Gastos</h3>
            {stats.topExpensesPie.length > 0 ? (
              <>
                <div className={style.pieWrapper}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.topExpensesPie}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={100}
                        innerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={3}
                      >
                        {stats.topExpensesPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<PieTooltip isCurrency={true} />} wrapperStyle={{ zIndex: 10000 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CustomLegend data={stats.topExpensesPie} colors={COLORS} />
              </>
            ) : (
              <div className={style.noDataMessage}>As vendas não estavam ativas naquela época.</div>
            )}
          </div>
        </div>
      )}

      {/* NOVO RANKING DE PRODUTOS COMPLETO */}
      <div className={style.summaryGrid} style={{ marginTop: '30px', marginBottom: '30px' }}>
        <div className={style.tableSection}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '15px',
            borderBottom: showProductRanking ? '1px solid #eee' : 'none',
            paddingBottom: showProductRanking ? '12px' : '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>🏆 Ranking Completo de Vendas</h3>
              <button 
                onClick={() => setShowProductRanking(prev => !prev)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #14213D',
                  color: '#14213D',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                {showProductRanking ? '▲ Recolher' : '▼ Expandir'}
              </button>
              {showProductRanking && (
                <div className={style.metricToggle} style={{ marginLeft: '10px' }}>
                  <button
                    type="button"
                    className={`${style.toggleBtn} ${tableMetric === 'quantity' ? style.activeToggle : ''}`}
                    onClick={() => setTableMetric('quantity')}
                  >
                    Qtd
                  </button>
                  <button
                    type="button"
                    className={`${style.toggleBtn} ${tableMetric === 'profit' ? style.activeToggle : ''}`}
                    onClick={() => setTableMetric('profit')}
                  >
                    Lucro
                  </button>
                </div>
              )}
            </div>
            {showProductRanking && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.8rem', color: '#14213D', fontWeight: 'bold' }}>Data Inicial</label>
                  <input 
                    type="date" 
                    value={startDateRank} 
                    onChange={(e) => setStartDateRank(e.target.value)}
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.8rem', color: '#14213D', fontWeight: 'bold' }}>Data Final</label>
                  <input 
                    type="date" 
                    value={endDateRank} 
                    onChange={(e) => setEndDateRank(e.target.value)}
                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {showProductRanking && (
            <>
              <table style={{ marginTop: '15px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', width: '80px' }}>Posição</th>
                    <th style={{ textAlign: 'left' }}>Nome do Produto</th>
                    <th style={{ textAlign: 'center' }}>
                      {tableMetric === 'quantity' ? 'Quantidade Vendida' : 'Lucro Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productsWithSales.map((prod, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}º</td>
                      <td>{prod.name}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {tableMetric === 'quantity' ? prod.sold : `R$ ${prod.profit.toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                  {productsWithSales.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                        Nenhum produto vendido no período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {productsWithoutSales.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#ff4d4d' }}>❌ Produtos sem vendas ({productsWithoutSales.length})</h4>
                    <button 
                      type="button"
                      onClick={() => setShowZeroSales(prev => !prev)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #ff4d4d',
                        color: '#ff4d4d',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      {showZeroSales ? '▲ Recolher' : '▼ Mostrar Produtos'}
                    </button>
                  </div>
                  
                  {showZeroSales && (
                    <table style={{ marginTop: '10px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'center', width: '80px' }}>Posição</th>
                          <th style={{ textAlign: 'left' }}>Nome do Produto</th>
                          <th style={{ textAlign: 'center' }}>
                            {tableMetric === 'quantity' ? 'Quantidade Vendida' : 'Lucro Total'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsWithoutSales.map((prod, index) => {
                          const realPos = productsWithSales.length + index + 1;
                          return (
                            <tr key={index} style={{ backgroundColor: '#ffe6e6' }}>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{realPos}º</td>
                              <td>{prod.name}</td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#ff4d4d' }}>
                                {tableMetric === 'quantity' ? prod.sold : `R$ ${prod.profit.toFixed(2)}`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* NOVO RANKING DE DESPERDÍCIOS */}
      <div style={{ width: '100%', marginBottom: '30px', boxSizing: 'border-box' }}>
        <div className={style.tableSection} style={{ overflow: 'visible', boxSizing: 'border-box' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            borderBottom: showWasteRanking ? '1px solid #eee' : 'none',
            paddingBottom: showWasteRanking ? '12px' : '0',
            marginBottom: showWasteRanking ? '15px' : '0'
          }}>
            <h3 style={{ margin: 0 }}>🗑️ Ranking de Desperdícios (Mensal)</h3>
            <button 
              onClick={() => setShowWasteRanking(prev => !prev)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #14213D',
                color: '#14213D',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {showWasteRanking ? '▲ Recolher' : '▼ Expandir'}
            </button>
          </div>
          
          {showWasteRanking && (
            <div className={style.chartContainer} style={{ marginTop: '20px' }}>
              {isLoadingWaste ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Carregando dados de desperdício...</div>
              ) : wasteRankingData.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                  gap: '15px', 
                  width: '100%'
                }}>
                  {Array.from({ length: Math.ceil(wasteRankingData.length / 10) }, (_, i) => wasteRankingData.slice(i * 10, i * 10 + 10)).map((chunk, index) => {
                    const chunkWithRank = chunk.map((item, itemIndex) => {
                      const absoluteRank = index * 10 + itemIndex + 1;
                      return {
                        ...item,
                        name: `${absoluteRank}º ${item.name}`
                      };
                    });
                    return (
                      <div key={index} style={{ border: '1px solid #333', borderRadius: '8px', padding: '10px 0' }}>
                        <h4 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#888', fontSize: '0.9rem' }}>
                          Página {index + 1}
                        </h4>
                        <ResponsiveContainer width="100%" height={Math.max(200, chunk.length * 50)}>
                          <BarChart 
                            layout="vertical" 
                            data={chunkWithRank} 
                            margin={{ top: 10, right: 60, left: 20, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                            <XAxis type="number" hide domain={[0, maxWasteValue || 'auto']} />
                            <YAxis dataKey="name" type="category" width={200} stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                            <RechartsTooltip 
                              content={<CustomWasteTooltip />} 
                              wrapperStyle={{ zIndex: 1000 }}
                              allowEscapeViewBox={{ x: true, y: true }}
                            />
                            <Bar dataKey="value" fill="#ff4d4d" barSize={20} radius={[0, 4, 4, 0]}>
                              <LabelList 
                                dataKey="value" 
                                position="right" 
                                formatter={(val) => `R$ ${Number(val).toFixed(2)}`} 
                                fill="#ff4d4d" 
                                fontSize={12} 
                                fontWeight="bold"
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>Nenhum desperdício registrado neste mês.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditPopup && (
        <div className={style.editOverlay}>
          <AddExpensesForm 
            setShowPopup={setShowEditPopup} 
            setRefreshData={setRefreshData} 
            obj={selectedExpense} 
          />
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;
