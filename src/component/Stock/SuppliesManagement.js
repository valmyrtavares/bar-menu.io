import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import Table from '../Table';
import Title from '../title';
import { Link } from 'react-router-dom';
import style from '../../assets/styles/TrackStockProduct.module.scss'; // using existing stock styles

const RegularityCell = ({ item, onUpdate }) => {
  const [val, setVal] = useState(item.regularityDays || '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
      <input
        type="number"
        min="1"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{
          width: '60px',
          padding: '4px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          textAlign: 'center'
        }}
      />
      <span style={{ fontSize: '0.9rem', color: '#555' }}>dias</span>
      <button
        onClick={() => onUpdate(item.id, val)}
        style={{
          padding: '4px 12px',
          backgroundColor: '#14213D',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.8rem'
        }}
      >
        Atualizar
      </button>
    </div>
  );
};

const SuppliesManagement = () => {
  const [supplies, setSupplies] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stock'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filtrar apenas insumos
      const suppliesList = items.filter(item => item.operationSupplies === true && (item.activityStatus === undefined || item.activityStatus === false));
      setSupplies(suppliesList);
    });

    return () => unsub();
  }, []);

  const handleUpdateRegularity = async (id, days) => {
    try {
      const docRef = doc(db, 'stock', id);
      await updateDoc(docRef, {
        regularityDays: days === '' ? null : Number(days)
      });
      alert('Regularidade atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar regularidade:', error);
      alert('Erro ao atualizar. Tente novamente.');
    }
  };

  const handleDeleteSupply = async (item) => {
    if (window.confirm(`Tem certeza que deseja remover "${item.product}" da lista de insumos de uso contínuo? Ele voltará para a lista geral do estoque.`)) {
      try {
        const docRef = doc(db, 'stock', item.id);
        await updateDoc(docRef, {
          operationSupplies: false,
          regularityDays: null // Opcional: limpar a regularidade se voltar para o estoque comum
        });
        alert('Insumo removido da lista de uso contínuo com sucesso!');
      } catch (error) {
        console.error('Erro ao remover insumo:', error);
        alert('Erro ao remover. Tente novamente.');
      }
    }
  };

  const parseToDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    if (typeof dateVal.toDate === 'function') return dateVal.toDate();
    if (typeof dateVal.seconds === 'number') return new Date(dateVal.seconds * 1000);
    if (typeof dateVal === 'number') {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateVal === 'string') {
      const str = dateVal.trim();
      if (!str) return null;
      if (str.includes('/')) {
        const parts = str.split(' - ')[0].split(' ')[0].split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
      }
      if (str.includes('-')) {
        const parts = str.split('T')[0].split(' ')[0].split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          } else {
            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          }
        }
      }
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateToDMY = (dateStr) => {
    const d = parseToDate(dateStr);
    if (!d) return '-';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formattedSupplies = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return supplies.map(item => {
      let isOverdue = false;
      
      const purchaseDate = parseToDate(item.lastUpdate || item.date || item.createdAt);
      if (purchaseDate && item.regularityDays) {
        const limitDate = new Date(purchaseDate);
        limitDate.setDate(limitDate.getDate() + Number(item.regularityDays));
        limitDate.setHours(0, 0, 0, 0);
        
        if (limitDate < today) {
          isOverdue = true;
        }
      }

      return {
        ...item,
        productDisplay: (
          <span style={{ color: isOverdue ? '#dc3545' : 'inherit', fontWeight: isOverdue ? 'bold' : 'normal' }}>
            {item.product}
          </span>
        ),
        costDisplay: `R$ ${Number(item.totalCost || 0).toFixed(2)}`,
        volumeDisplay: `${item.totalVolume || 0} ${item.unitOfMeasurement || ''}`,
        dateDisplay: formatDateToDMY(item.lastUpdate || item.date || item.createdAt),
        regularityControl: <RegularityCell item={item} onUpdate={handleUpdateRegularity} />
      };
    }).sort((a, b) => (a.product || '').localeCompare(b.product || ''));
  }, [supplies]);

  const columns = [
    { nomeDaColuna: 'Insumo', valorDaColuna: 'productDisplay' },
    { nomeDaColuna: 'Preço Total', valorDaColuna: 'costDisplay' },
    { nomeDaColuna: 'Volume Total', valorDaColuna: 'volumeDisplay' },
    { nomeDaColuna: 'Data da Compra', valorDaColuna: 'dateDisplay' },
    { nomeDaColuna: 'Regularidade', valorDaColuna: 'regularityControl' },
  ];

  return (
    <div className={style.containerTrackStockproduct}>
      <Link to="/admin/admin" className={style.btnBack} style={{ color: '#FCA311' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className={style.titleTable}>
        <Title mainTitle="Gerenciamento de Insumos" />
      </div>

      <div style={{ padding: '0 20px', marginBottom: '20px', color: '#555', fontSize: '0.9rem' }}>
        <p>Abaixo estão listados todos os seus Insumos (itens que não vão na receita). Adicione a <b>Regularidade</b> em dias para receber um alerta quando chegar a hora de comprar novamente. A contagem de dias se baseia na Data da Compra exibida na tabela.</p>
      </div>

      <div className={style.tableStockContainer}>
        <Table
          title="Lista de Insumos (Uso Contínuo)"
          data={formattedSupplies}
          columns={columns}
          hideEditButton={true}
          onDelete={handleDeleteSupply}
        />
      </div>
    </div>
  );
};

export default SuppliesManagement;
