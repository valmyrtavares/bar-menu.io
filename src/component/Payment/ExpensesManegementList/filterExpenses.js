import React, { useState, useEffect } from 'react';
import style from '../../../assets/styles/FilterExpenses.module.scss';
import { getBtnData } from '../../../api/Api';
const FilterExpenses = ({ filterExpenseList, cleanFilter }) => {
  const [form, setForm] = useState({
    initialDate: '',
    finalDate: '',
    expenseName: '',
    supplier: '',
    rawMaterial: '',
    idRawMaterial: '',
    invoice: '',
  });

  const [expensesList, setExpensesList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [providerList, setProviderList] = useState([]);

  React.useEffect(() => {
    const fetchRegisters = async () => {
      const [dataProduct, dataProvider, dataExpenses] = await Promise.all([
        getBtnData('product'),
        getBtnData('provider'),
        getBtnData('expenses'),
      ]);
      if (dataProduct && dataProduct.length > 0) {
        setProductList(sortedData(dataProduct));
      }
      if (dataExpenses && dataExpenses.length > 0) {
        setExpensesList(sortedData(dataExpenses));
      }
      if (dataProvider && dataProvider.length > 0) {
        setProviderList(sortedData(dataProvider));
      }
    };
    fetchRegisters();
  }, []);

  const handleFilter = () => {
    const res = filterExpenseList(form);

    if (!res) {
      setForm((prevForm) => ({
        ...prevForm,
        expenseName: '',
        supplier: '',
        rawMaterial: '',
      }));
    } else {
      setForm({
        initialDate: '',
        finalDate: '',
        expenseName: '',
        supplier: '',
        rawMaterial: '',
        invoice: '',
      });
    }
  };

  const sortedData = (list) => {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'rawMaterial') {
      const selectedProduct = productList[value];
      setForm((prev) => ({
        ...prev,
        [name]: selectedProduct ? selectedProduct.name : '',
        idRawMaterial: selectedProduct ? selectedProduct.idProduct : '',
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const resetFilters = () => {
    setForm({
      initialDate: '',
      finalDate: '',
      expenseName: '',
      supplier: '',
      rawMaterial: '',
      invoice: '',
    });
    cleanFilter();
  };

  return (
    <div className={style.container}>
      <div className={style.row}>
        <div className={style.inputGroup}>
          <label htmlFor="initialDate">Data Inicial</label>
          <input
            type="date"
            id="initialDate"
            name="initialDate"
            value={form.initialDate}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          />
        </div>
        <div className={style.inputGroup}>
          <label htmlFor="finalDate">Data Final</label>
          <input
            type="date"
            id="finalDate"
            name="finalDate"
            value={form.finalDate}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          />
        </div>
        <div className={style.inputGroup}>
          <label htmlFor="expenseName">Nome da depesa</label>
          <select
            id="expenseName"
            name="expenseName"
            value={form.expenseName}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          >
            <option value="">Selecione Despesas</option>
            {expensesList.map((expense) => (
              <option key={expense.id} value={expense.name}>
                {expense.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={style.row}>
        <div className={style.inputGroup}>
          <label htmlFor="rawMaterial">Matéria Prima</label>
          <select
            id="rawMaterial"
            name="rawMaterial"
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          >
            <option value="">Selecione</option>
            {productList.map((product, index) => (
              <option key={product.id} value={index}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className={style.inputGroup}>
          <label htmlFor="supplier">Fornecedor</label>
          <select
            id="supplier"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          >
            <option value="">Selecione</option>
            {providerList.map((provider) => (
              <option key={provider.id} value={provider.name}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div className={style.inputGroup}>
          <label htmlFor="invoice">Nota Fiscal</label>
          <input
            type="text"
            id="invoice"
            name="invoice"
            value={form.invoice}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          />
        </div>
      </div>
      <div className={style.btnContainer}>
        <button onClick={handleFilter}>Filtrar</button>
        <button onClick={resetFilters}>Limpar filtro</button>
      </div>
    </div>
  );
};

export default FilterExpenses;
