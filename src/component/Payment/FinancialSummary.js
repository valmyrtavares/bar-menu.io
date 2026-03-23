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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    // Format: "YYYY-MM-DD" from <input type="date">
    if (dateStr.includes('-') && !dateStr.includes('/')) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    // Format: "DD/MM/YYYY" or "DD/MM/YYYY - HH:mm:ss"
    const [datePart] = dateStr.split(' - ');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
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

    const totalRevenue = monthRevenue.reduce((acc, rev) => acc + (Number(rev.finalPriceRequest) || 0), 0);
    const totalPaid = monthExpenses.reduce((acc, exp) => acc + (Number(exp.confirmation) || 0), 0);
    const estimatedFixed = monthExpenses
      .filter(exp => exp.category === 'fixed')
      .reduce((acc, exp) => acc + (Number(exp.value) || 0), 0);
    
    const netProfit = totalRevenue - totalPaid;

    // Daily data for chart
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      revenue: 0,
      expenses: 0,
      isDue: false,
      dueNames: [],
    }));

    monthRevenue.forEach(rev => {
      const d = parseDate(rev.dateTime);
      if (d) dailyData[d.getDate() - 1].revenue += Number(rev.finalPriceRequest) || 0;
    });

    monthExpenses.forEach(exp => {
      const d = parseDate(exp.paymentDate || exp.dueDate);
      if (d) {
        dailyData[d.getDate() - 1].expenses += Number(exp.confirmation) || 0;
        if (exp.category === 'fixed' && exp.dueDate) {
            const dueD = parseDate(exp.dueDate);
            if (dueD && dueD.getDate() === d.getDate()) {
                dailyData[d.getDate() - 1].isDue = true;
                dailyData[d.getDate() - 1].dueNames.push(exp.name);
            }
        }
      }
    });

    // Overdue alarms
    const today = new Date();
    const overdue = monthExpenses.filter(exp => {
      if (exp.category !== 'fixed' || exp.paymentDate || !exp.dueDate) return false;
      const due = parseDate(exp.dueDate);
      return due < today;
    });

    return { totalRevenue, totalPaid, estimatedFixed, netProfit, dailyData, overdue };
  }, [filteredData, selectedMonth, selectedYear]);

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

  if (!hasFinancial) return <div className={style.accessDenied}>Acesso Restrito ao Pacote Financeiro</div>;

  return (
    <div className={style.container}>
      <Link to="/admin/admin">
        <Title mainTitle="Resumo Financeiro Mensal" />
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
        <h3>Corrida Financeira: Receita vs. Despesas</h3>
        <div className={style.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Receita (Sucesso)" stroke="#00ff88" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expenses" name="Despesas (Custos)" stroke="#ff4d4d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              
              {stats.dailyData.map((d, i) => d.isDue && (
                <ReferenceDot 
                  key={i} 
                  x={d.day} 
                  y={Math.max(d.revenue, d.expenses) + 10} 
                  r={6} 
                  fill="#ffaa00" 
                  stroke="none"
                >
                    <Label value="!" position="center" fill="#000" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                </ReferenceDot>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={style.summaryGrid}>
        <div className={style.tableSection}>
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

        <div className={style.indicators}>
          <div className={style.card}>
            <span>Estimativa de Custo Fixo</span>
            <strong>R$ {stats.estimatedFixed.toFixed(2)}</strong>
          </div>
          <div className={style.card}>
            <span>Custos Totais Pagos</span>
            <strong>R$ {stats.totalPaid.toFixed(2)}</strong>
          </div>
          <div className={`${style.card} ${stats.netProfit >= 0 ? style.profit : style.loss}`}>
            <span>Lucro Líquido (Mês)</span>
            <strong>R$ {stats.netProfit.toFixed(2)}</strong>
            <small>{stats.netProfit >= 0 ? 'Superavit' : 'Deficit'}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
