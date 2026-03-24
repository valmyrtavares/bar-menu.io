import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../config-firebase/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  Label,
} from 'recharts';
import style from '../../assets/styles/FinancialSummary.module.scss';
import Title from '../title';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

const FinancialSummary = () => {
  const { hasFinancial } = React.useContext(GlobalContext);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [items, setItems] = useState([]);
  const [sideDishes, setSideDishes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubExpenses = onSnapshot(collection(db, 'outgoing'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubRevenue = onSnapshot(collection(db, 'requests'), (snapshot) => {
      setRevenue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubItems = onSnapshot(collection(db, 'item'), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSideDishes = onSnapshot(collection(db, 'sideDishes'), (snapshot) => {
      setSideDishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubExpenses();
      unsubRevenue();
      unsubItems();
      unsubSideDishes();
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

  const calculateTransactionFee = (totalSum, paymentMethod) => {
    const fees = { debit: 0.025, pix: 0.025, cash: 0, credite: 0.029, vr: 0.07 };
    const method = (paymentMethod || '').toLowerCase();
    const feeRate = method.includes('vr') ? fees.vr : fees[method] || 0;
    return totalSum * feeRate;
  };

  const getProductCost = (requestId, size, name) => {
    let dish = items.find(i => i.id === requestId);
    if (!dish) dish = items.find(i => i.title?.trim().toLowerCase() === name?.trim().toLowerCase());
    if (!dish) return 0;

    const { costProfitMarginCustomized = {}, costPriceObj = {} } = dish;
    if (size && costProfitMarginCustomized) {
      const sizeData = Object.values(costProfitMarginCustomized).find(s => s.label === size);
      if (sizeData) return Number(sizeData.cost) || 0;
    }
    return Number(costPriceObj.cost) || 0;
  };

  const getSideDishCost = (name) => {
    const sd = sideDishes.find(s => s.sideDishes === name);
    if (!sd || sd.isBasic) return 0;
    return Number(sd.costPriceObj?.cost) || 0;
  };

  const filteredData = useMemo(() => {
    const monthExpenses = expenses.filter(exp => {
      const d = parseDate(exp.paymentDate || exp.dueDate);
      return d && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const monthRevenue = revenue.filter(rev => {
      const d = parseDate(rev.dateTime);
      return d && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    return { monthExpenses, monthRevenue };
  }, [expenses, revenue, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    const { monthExpenses, monthRevenue } = filteredData;

    const totalEstimatedFixed = monthExpenses
      .filter(exp => exp.category === 'fixed')
      .reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      profit: 0,      // Non-cumulative for tooltip
      expenses: 0,    // Non-cumulative for tooltip
      profitCum: 0,   // Cumulative (Green)
      expensesCum: 0, // Cumulative (Red)
      fixedRemaining: 0, // Cumulative (Yellow)
      expensesList: [],
    }));

    // Calculate non-cumulative daily values first
    monthRevenue.forEach(rev => {
      const d = parseDate(rev.dateTime);
      if (d) {
        const dayIdx = d.getDate() - 1;
        if (dailyData[dayIdx]) {
          (rev.request || []).forEach(item => {
            const price = Number(item.finalPrice) || 0;
            const fee = calculateTransactionFee(price, rev.paymentMethod);
            const cost = getProductCost(item.id, item.size, item.name);
            const sideCost = (item.sideDishes || []).reduce((acc, sd) => acc + getSideDishCost(sd.name), 0);
            dailyData[dayIdx].profit += (price - fee - cost - sideCost);
          });
        }
      }
    });

    monthExpenses.forEach(exp => {
      const d = parseDate(exp.paymentDate || exp.dueDate);
      if (d && exp.confirmation) { // Process as paid if confirmed
        const dayIdx = d.getDate() - 1;
        if (dailyData[dayIdx]) {
          const val = Number(exp.confirmation) || 0;
          dailyData[dayIdx].expenses += val;
          dailyData[dayIdx].expensesList.push({ name: exp.name, value: val, category: exp.category });
        }
      }
    });

    // Calculate Cumulative patterns
    let currentProfitCum = 0;
    let currentExpensesCum = 0;
    let currentFixedRemaining = totalEstimatedFixed;

    dailyData.forEach(day => {
      currentProfitCum += day.profit;
      currentExpensesCum += day.expenses;
      
      // Decrease yellow line if fixed expenses were paid today
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
      .filter(exp => exp.category === 'fixed' && exp.paymentDate)
      .reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);
    
    const profitTotal = dailyData[daysInMonth-1]?.profitCum || 0;
    const expensesTotal = dailyData[daysInMonth-1]?.expensesCum || 0;
    const superavit = profitTotal - expensesTotal;

    const overdue = monthExpenses.filter(exp => {
      if (exp.category !== 'fixed' || exp.paymentDate || !exp.dueDate) return false;
      const due = parseDate(exp.dueDate);
      return due < new Date();
    });

    return { 
      totalRevenue: profitTotal, 
      totalPaid: expensesTotal, 
      estimatedFixed: totalEstimatedFixed, 
      remainingFixed: Math.max(0, totalEstimatedFixed - totalPaidFixed),
      superavit, 
      dailyData, 
      overdue 
    };
  }, [filteredData, items, sideDishes, selectedMonth, selectedYear]);

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
      const data = payload[payload.length - 1].payload; // Use cumulative data point
      return (
        <div className={style.customTooltip}>
          <h4>Dia {label}</h4>
          <div className={`${style.tooltipItem} ${style.green}`}>
            <span>Lucro do Dia:</span>
            <strong>R$ {data.profit.toFixed(2)}</strong>
          </div>
          <div className={`${style.tooltipItem} ${style.red}`}>
            <span>Gasto do Dia:</span>
            <strong>R$ {data.expenses.toFixed(2)}</strong>
          </div>
          <div className={`${style.tooltipItem} ${style.yellow}`}>
            <span>Custo Fixo Restante:</span>
            <strong>R$ {data.fixedRemaining.toFixed(2)}</strong>
          </div>
          {data.expensesList.length > 0 && (
            <div className={style.details}>
              {data.expensesList.map((ex, i) => (
                <div key={i} className={style.expenseItem}>
                  <span>{ex.name}:</span>
                  <span>R$ {ex.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!hasFinancial) return <div className={style.accessDenied}>Acesso Restrito ao Pacote Financeiro</div>;

  return (
    <div className={style.container}>
      <Link to="/admin/admin">
        <Title mainTitle="Corrida do Lucro" />
      </Link>

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

      {stats.overdue.length > 0 && (
        <div className={style.overdueAlert}>
          <h3>⚠️ Atenção: Contas Fixas Atrasadas</h3>
          <ul>
            {stats.overdue.map(exp => (
              <li key={exp.id}>{exp.name} - Venceu em: {exp.dueDate}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={style.chartCard}>
        <h3>🏁 Evolução Diária (Cumulativo)</h3>
        <div className={style.chartContainer}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip content={<CustomTooltipContent />} />
              <Legend verticalAlign="top" height={36}/>
              
              <Line 
                type="monotone" 
                dataKey="profitCum" 
                name="Lucro (Corrida Verde)" 
                stroke="#00ff88" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#00ff88', strokeWidth: 2 }} 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expensesCum" 
                name="Gastos (Corrida Vermelha)" 
                stroke="#ff4d4d" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#ff4d4d', strokeWidth: 2 }} 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="fixedRemaining" 
                name="Custo Fixo (Barreira Amarela)" 
                stroke="#FCA311" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
    </div>
  );
};

export default FinancialSummary;
