import React, { useState, useImperativeHandle, forwardRef } from 'react';
import style from '../../../assets/styles/FilterExpenses.module.scss';
import { getBtnData } from '../../../api/Api';

const FilterExpenses = forwardRef(({ filterExpenseList, cleanFilter }, ref) => {
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
      const selectedProduct = productList.find((p) => p.idProduct === value);
      setForm((prev) => ({
        ...prev,
        rawMaterial: selectedProduct ? selectedProduct.name : '',
        idRawMaterial: value, // value já é o idProduct selecionado
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const resetFilters = () => {
    clearForm();
    cleanFilter();
  };

  const clearForm = () => {
    setForm({
      initialDate: '',
      finalDate: '',
      expenseName: '',
      supplier: '',
      rawMaterial: '',
      idRawMaterial: '',
      invoice: '',
    });
  };

  useImperativeHandle(ref, () => ({
    clearForm,
  }));

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
        <div
          className={style.inputGroup}
          title="selecione o nome do tipo da depesa que quer verificar, esses
        tipos são registrados pelo próprio administrador no botão abaixo de 'opção de cadastro'"
        >
          <label htmlFor="expenseName">Nome da despesa</label>
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
            value={form.idRawMaterial || ''}
            onChange={handleChange}
            // onBlur={handleFilter}
            className={style.input}
          >
            <option value="">Selecione</option>
            {productList.map((product, index) => (
              <option key={product.id} value={product.idProduct}>
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
        <div
          className={style.inputGroup}
          title="Preencha manualmente a nota fiscal buscada 
          para que possa ser selecionada na tabela abaixo"
        >
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
        <button
          onClick={handleFilter}
          title="Os filtros só são acionados depois de clicar nesse botão"
        >
          Filtrar
        </button>
        <button onClick={resetFilters}>Limpar filtro</button>
      </div>
    </div>
  );
});

export default FilterExpenses;
