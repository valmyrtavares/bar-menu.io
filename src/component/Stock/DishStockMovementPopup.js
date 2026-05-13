import React, { useState, useEffect } from 'react';
import style from '../../assets/styles/StockMovementPopup.module.scss';
import { getBtnData } from '../../api/Api';

const DishStockMovementPopup = ({ onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [dishesList, setDishesList] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const data = await getBtnData('item');
        setDishesList(data);
      } catch (err) {
        console.error('Erro ao buscar definições de pratos:', err);
      }
    };
    fetchDishes();
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart] = dateStr.split(' - ');
    const parts = datePart.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas inicial e final.');
      return;
    }

    setLoading(true);
    try {
      const requests = await getBtnData('requests');
      
      const [sY, sM, sD] = startDate.split('-').map(Number);
      const [eY, eM, eD] = endDate.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);
      end.setHours(23, 59, 59, 999);

      const filteredResults = [];

      requests.forEach((order) => {
        const orderDate = parseDate(order.dateTime);
        if (orderDate && orderDate >= start && orderDate <= end) {
          (order.request || []).forEach((dish) => {
            const dishInfo = {
              name: dish.product || dish.name,
              dateTime: order.dateTime,
              size: dish.size || '',
              ingredients: [],
              sideDishes: dish.sideDishes || []
            };

            // Get recipe ingredients
            if (dish.recipe && dish.recipe.FinalingridientsList) {
              const list = dish.recipe.FinalingridientsList;
              if (Array.isArray(list)) {
                dishInfo.ingredients = list;
              } else {
                // Determine the correct list based on size label
                const dishDef = dishesList.find(d => d.id === dish.id);
                if (dishDef && dishDef.CustomizedPrice) {
                  const mapping = {
                    [dishDef.CustomizedPrice.firstLabel]: 'firstPrice',
                    [dishDef.CustomizedPrice.secondLabel]: 'secondPrice',
                    [dishDef.CustomizedPrice.thirdLabel]: 'thirdPrice',
                  };
                  const key = mapping[dish.size];
                  dishInfo.ingredients = list[key] || list[dish.size] || []; // Fallback to label if direct mapping fails
                } else {
                  // Fallback: try to find key by label in the object
                  dishInfo.ingredients = list[dish.size] || [];
                }
              }
            }

            filteredResults.push(dishInfo);
          });
        }
      });

      // Sort by dateTime desc
      filteredResults.sort((a, b) => {
        const d1 = parseDate(a.dateTime);
        const d2 = parseDate(b.dateTime);
        return d2 - d1;
      });

      setResults(filteredResults);
    } catch (err) {
      console.error('Erro ao filtrar movimentação por pratos:', err);
      alert('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={style.popup} style={{ maxWidth: '800px', width: '95%' }}>
        <div className={style.header}>
          <h2>Movimentação por pratos</h2>
          <button className={style.closeBtn} onClick={onClose}>X</button>
        </div>

        <div className={style.formGrid} style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          <div className={style.field}>
            <label>Data Inicial</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className={style.field}>
            <label>Data Final</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className={style.field} style={{ alignSelf: 'flex-end' }}>
            <button className={style.filterBtn} onClick={handleFilter} disabled={loading} style={{ margin: 0 }}>
              {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
          </div>
        </div>

        <div className={style.resultsList} style={{ 
          marginTop: '20px', 
          maxHeight: '60vh', 
          overflowY: 'auto', 
          background: '#f9f9f9',
          padding: '10px',
          borderRadius: '8px'
        }}>
          {results.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {loading ? 'Buscando registros...' : 'Nenhum registro encontrado para o período.'}
            </p>
          ) : (
            results.map((item, idx) => (
              <div key={idx} style={{ 
                marginBottom: '15px', 
                padding: '12px', 
                background: '#fff', 
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderLeft: '4px solid #14213D'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#14213D' }}>{item.name} {item.size && `(${item.size})`}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{item.dateTime}</span>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: '#333' }}>
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div style={{ marginBottom: '5px' }}>
                      {item.ingredients.map((ing, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {ing.name}</span>
                          <span style={{ fontWeight: 'bold' }}>-{ing.amount} {ing.unitOfMeasurement}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.sideDishes && item.sideDishes.length > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                      <em style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Acompanhamentos:</em>
                      {item.sideDishes.map((side, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '10px' }}>
                          <span>◦ {side.name}</span>
                          <span style={{ fontWeight: 'bold' }}>-{side.portionUsed} {side.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DishStockMovementPopup;
