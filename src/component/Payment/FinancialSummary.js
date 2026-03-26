import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../config-firebase/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
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

const FinancialSummary = () => {
  const { hasFinancial } = React.useContext(GlobalContext);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'
  const [showOverduePopup, setShowOverduePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    const unsubExpenses = onSnapshot(collection(db, 'outgoing'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubRevenue = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRevenue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubExpenses();
      unsubRevenue();
    };
  }, []);

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
      return inPay || inDue;
    });

    const monthRevenue = revenue.filter(rev => {
      const d = parseDate(rev.dateTime);
      return d && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return { monthExpenses, monthRevenue };
  }, [expenses, revenue, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    if (viewMode === 'annual') {
      const now = new Date();
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

      const refExpensesList = expenses.filter(exp => {
        const dPay = parseDate(exp.paymentDate);
        return dPay && dPay.getMonth() === refMonth && dPay.getFullYear() === refYear && exp.confirmation;
      });
      const refRevenueList = revenue.filter(rev => {
        const d = parseDate(rev.dateTime);
        return d && d.getMonth() === refMonth && d.getFullYear() === refYear;
      });

      const refProfit = refRevenueList.reduce((acc, rev) => {
        let p = 0;
        (rev.request || []).forEach(item => {
          const price = Number(item.finalPrice) || 0;
          p += price;
        });
        return acc + p;
      }, 0);

      const refVariable = refExpensesList
        .filter(exp => exp.category !== 'fixed')
        .reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);

      const annualData = [];
      let totalAnnualProfit = 0;
      let totalAnnualVariable = 0;
      let totalAnnualFixed = 0;

      for (let i = 0; i < 12; i++) {
        const m = (refMonth + i) % 12;
        const y = refYear + Math.floor((refMonth + i) / 12);
        
        const monthFixed = expenses
          .filter(exp => {
            const dDue = parseDate(exp.dueDate);
            return exp.category === 'fixed' && dDue && dDue.getMonth() === m && dDue.getFullYear() === y;
          })
          .reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);

        annualData.push({
          month: m,
          year: y,
          profit: refProfit,
          variable: refVariable,
          fixed: monthFixed,
          monthName: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][m]
        });

        totalAnnualProfit += refProfit;
        totalAnnualVariable += refVariable;
        totalAnnualFixed += monthFixed;
      }

      return {
        totalRevenue: totalAnnualProfit,
        totalPaid: totalAnnualVariable,
        totalFixed: totalAnnualFixed,
        remainingFixed: totalAnnualFixed,
        superavit: totalAnnualProfit - totalAnnualVariable - totalAnnualFixed,
        dailyData: annualData,
        viewMode: 'annual',
        refMonthName: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][refMonth],
        overdue: [], // not used in annual view
        topProducts: [], // not used in annual view
        topExpensesPie: [], // not used in annual view
      };
    }

    const { monthExpenses, monthRevenue } = filteredData;

    const totalEstimatedFixed = monthExpenses
      .filter(exp => {
        const dDue = parseDate(exp.dueDate);
        return exp.category === 'fixed' && dDue && dDue.getMonth() === selectedMonth && dDue.getFullYear() === selectedYear;
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

    // Daily Profit and Due Fixed Expenses
    monthRevenue.forEach(rev => {
      const d = parseDate(rev.dateTime);
      if (d) {
        const dayIdx = d.getDate() - 1;
        if (dailyData[dayIdx]) {
          (rev.request || []).forEach(item => {
            const price = Number(item.finalPrice) || 0;
            dailyData[dayIdx].profit += price;
          });
        }
      }
    });

    monthExpenses.forEach(exp => {
      const dDue = parseDate(exp.dueDate);
      if (exp.category === 'fixed' && dDue && dDue.getMonth() === selectedMonth && dDue.getFullYear() === selectedYear) {
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

    dailyData.forEach(day => {
      currentProfitCum += day.profit;
      currentExpensesCum += day.expenses;
      
      day.expensesList.forEach(exp => {
        if (exp.category === 'fixed') {
          currentFixedRemaining -= exp.value;
        }
      });

      day.profitCum = currentProfitCum;
      day.expensesCum = currentExpensesCum;
      day.fixedRemaining = Math.max(0, currentFixedRemaining);
    });

    const totalPaidFixed = monthExpenses
      .filter(exp => {
        const dPay = parseDate(exp.paymentDate);
        return exp.category === 'fixed' && dPay && dPay.getMonth() === selectedMonth && dPay.getFullYear() === selectedYear;
      })
      .reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);
    
    const profitTotal = dailyData[daysInMonth-1]?.profitCum || 0;
    const expensesTotal = dailyData[daysInMonth-1]?.expensesCum || 0;
    const remainingFixed = Math.max(0, totalEstimatedFixed - totalPaidFixed);

    const overdue = monthExpenses.filter(exp => {
      if (exp.category !== 'fixed' || exp.paymentDate || !exp.dueDate) return false;
      const due = parseDate(exp.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      return due < today;
    });

    // Top Products Logic
    const productMap = {};
    monthRevenue.forEach(rev => {
      (rev.request || []).forEach(item => {
        const name = item.product || item.name || 'Produto s/ nome';
        const qty = Number(item.amount || item.quantity || 1);
        if (qty > 0) {
          productMap[name] = (productMap[name] || 0) + qty;
        }
      });
    });
    const topProducts = Object.entries(productMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8

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
      totalPaid: expensesTotal,
      remainingFixed,
      superavit: profitTotal - expensesTotal - remainingFixed, // Adjusted superavit calculation
      dailyData,
      overdue,
      topProducts,
      topExpensesPie,
    };
  }, [filteredData, selectedMonth, selectedYear, viewMode, expenses, revenue]);

  useEffect(() => {
    if (stats.overdue.length > 0) {
      setShowOverduePopup(true);
    }
  }, [stats.overdue.length]);

  // Reset viewMode when period changes
  useEffect(() => {
    setViewMode('monthly');
  }, [selectedMonth, selectedYear]);

  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredData.monthExpenses.forEach(exp => {
      const key = `${exp.name}-${exp.category}`;
      if (!groups[key]) {
        groups[key] = { 
          name: exp.name, 
          category: exp.category, 
          estimated: 0, 
          paid: 0,
          pending: false 
        };
      }
      groups[key].estimated += Number(exp.value) || 0;
      groups[key].paid += Number(exp.confirmation) || 0;
      if (!exp.paymentDate) groups[key].pending = true;
    });
    return Object.values(groups).sort((a, b) => b.estimated - a.estimated);
  }, [filteredData.monthExpenses]);

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
            <div className={`${style.tooltipItem} ${style.green}`}>
              <span>Lucro Estimado:</span>
              <strong>R$ {profit.toFixed(2)}</strong>
            </div>
            <div className={`${style.tooltipItem} ${style.red}`}>
              <span>Despesa Variável:</span>
              <strong>R$ {variable.toFixed(2)}</strong>
            </div>
            <div className={`${style.tooltipItem} ${style.yellow}`}>
              <span>Custo Fixo Real:</span>
              <strong>R$ {fixed.toFixed(2)}</strong>
            </div>
          </div>
        );
      }
      const data = payload[payload.length - 1]?.payload || {};
      const profit = Number(data.profit) || 0;
      const expenses = Number(data.expenses) || 0;
      const fixedRemaining = Number(data.fixedRemaining) || 0;
      return (
        <div className={style.customTooltip}>
          <h4>Dia {label}</h4>
          <div className={`${style.tooltipItem} ${style.green}`}>
            <span>Lucro do Dia:</span>
            <strong>R$ {profit.toFixed(2)}</strong>
          </div>
          <div className={`${style.tooltipItem} ${style.red}`}>
            <span>Gasto do Dia:</span>
            <strong>R$ {expenses.toFixed(2)}</strong>
          </div>
          <div className={`${style.tooltipItem} ${style.yellow}`}>
            <span>Custo Fixo Restante:</span>
            <strong>R$ {fixedRemaining.toFixed(2)}</strong>
          </div>
          {data.expensesList.length > 0 && (
            <div className={style.details}>
              {data.expensesList.map((ex, i) => (
                <div key={i} className={style.expenseItem}>
                  <span>{ex.name} ({ex.category === 'fixed' ? 'Fixa' : 'Var'}):</span>
                  <strong>R$ {ex.value.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
          {data.dueFixedList && data.dueFixedList.length > 0 && (
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
          <span>Distância (Vantagem)</span>
          <strong>R$ {Math.abs(stats.superavit).toFixed(2)}</strong>
          <small>{stats.superavit >= 0 ? 'Superavit' : 'Deficit'}</small>
        </div>
        <div className={`${style.card} ${style.profit}`}>
          <span>Lucro Acumulado</span>
          <strong>R$ {stats.totalRevenue.toFixed(2)}</strong>
        </div>
        <div className={`${style.card} ${style.loss}`}>
          <span>Gastos Acumulados</span>
          <strong>R$ {stats.totalPaid.toFixed(2)}</strong>
        </div>
        <div className={`${style.card} ${style.fixed}`}>
          <span>Custo Fixo Restante</span>
          <strong>R$ {stats.remainingFixed.toFixed(2)}</strong>
        </div>
        <div className={`${style.card} ${style.neutral}`}>
          <span>Quem está vencendo?</span>
          <strong>{stats.superavit >= 0 ? 'Você' : 'As Contas'}</strong>
        </div>
      </div>

      <div className={style.chartCard}>
        <h3>{viewMode === 'annual' ? '📊 Projeção de 12 Meses' : '🏁 Evolução Diária (Cumulativo)'}</h3>
        <div className={style.chartContainer}>
          {viewMode === 'annual' ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="monthName" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltipContent />} />
                <Bar dataKey="profit" fill="#00ff88" name="Lucro" radius={[4, 4, 0, 0]} />
                <Bar dataKey="variable" fill="#ff4d4d" name="Variável" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fixed" fill="#FCA311" name="Fixo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(val) => `R$ ${val}`} />
                <RechartsTooltip content={<CustomTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                
                <Line 
                  type="monotone" 
                  dataKey="profitCum" 
                  stroke="#00ff88" 
                  strokeWidth={3}
                  name="Lucro Acumulado"
                  dot={{ r: 4, fill: '#00ff88', strokeWidth: 2 }} 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expensesCum" 
                  stroke="#ff4d4d" 
                  strokeWidth={3}
                  name="Gastos Acumulados"
                  dot={{ r: 4, fill: '#ff4d4d', strokeWidth: 2 }} 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fixedRemaining" 
                  stroke="#FCA311" 
                  strokeWidth={3}
                  name="Custo Fixo Restante"
                  dot={<CustomYellowDot />}
                  isAnimationActive={false}
                />
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
        <>
          <div className={style.summaryGrid}>
            <div className={style.tableSection}>
              <h3>Detalhamento de Saídas</h3>
              <table>
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Tipo</th>
                    <th>Estimado</th>
                    <th>Pago</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedExpenses.map((group, i) => (
                    <tr key={i}>
                      <td>{group.name}</td>
                      <td>{group.category === 'fixed' ? 'Fixa' : 'Variável'}</td>
                      <td>R$ {group.estimated.toFixed(2)}</td>
                      <td>R$ {group.paid.toFixed(2)}</td>
                      <td className={group.pending ? style.pending : style.paidStatus}>
                        {group.pending ? 'Pendente' : 'Pago'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'monthly' && (
        <div className={style.pieChartsGrid}>
          <div className={style.pieCard}>
            <h3>🍕 Produtos Mais Vendidos (%)</h3>
            {stats.topProducts.length > 0 ? (
              <>
                <div className={style.pieWrapper}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.topProducts}
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
                        {stats.topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <CustomLegend data={stats.topProducts} colors={COLORS} />
              </>
            ) : (
              <div className={style.noDataMessage}>As vendas não estavam ativas naquela época.</div>
            )}
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
                      <RechartsTooltip content={<PieTooltip isCurrency={true} />} />
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
