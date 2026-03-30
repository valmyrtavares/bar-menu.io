import React, { useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { db } from '../../config-firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { GlobalContext } from '../../GlobalContext';
import { Link } from 'react-router-dom';
import { fetchCategoriesItem } from '../../api/Api';
import Title from '../title';
import style from '../../assets/styles/ExcelManagement.module.scss';

const ExcelManagement = () => {
  const { hasRawMaterial } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Mapeamento de colunas para campos do Firestore
  const mappings = {
    item: {
      headers: ['Título', 'Categoria', 'Comentário', 'Preço', 'Link da Imagem'],
      fields: ['title', 'category', 'comment', 'price', 'image'],
      collection: 'item'
    },
    stock: {
      headers: ['Produto', 'Unidade de Medida', 'Volume Total', 'Custo Total', 'Volume Mínimo'],
      fields: ['product', 'unitOfMeasurement', 'totalVolume', 'totalCost', 'minimumAmount'],
      collection: 'stock'
    }
  };

  const downloadTemplate = async (key) => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Prerparando template, verificando categorias...' });

    try {
      const { headers } = mappings[key];
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');
      
      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };
      
      worksheet.columns.forEach(column => {
        column.width = 25;
      });

      if (key === 'item') {
        const categories = await fetchCategoriesItem('button');
        const validCategories = categories && categories.length > 0 ? categories : ['Principal'];

        const hiddenSheetName = 'ValoresOcultos';
        const hiddenSheet = workbook.addWorksheet(hiddenSheetName, { state: 'hidden' });
        
        validCategories.forEach((cat, index) => {
          hiddenSheet.getCell(`A${index + 1}`).value = cat;
        });

        let endRow = validCategories.length;
        if (endRow === 0) endRow = 1;

        for (let rowNum = 2; rowNum <= 1000; rowNum++) {
          worksheet.getCell(`B${rowNum}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`'${hiddenSheetName}'!$A$1:$A$${endRow}`],
            showErrorMessage: true,
            errorStyle: 'stop',
            errorTitle: 'Categoria Inválida',
            error: 'Você deve selecionar uma categoria existente a partir do menu suspenso ou edita-la no admin.'
          };
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${key}_template.xlsx`);
      
      setMessage({ type: 'success', text: 'Template baixado com sucesso!' });
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      setMessage({ type: 'error', text: 'Erro ao gerar o template.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: 'info', text: 'Processando arquivo...' });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Remover cabeçalho
        const rows = data.slice(1);
        const { fields, collection: collName } = mappings[key];

        let count = 0;
        for (const row of rows) {
          if (!row[0]) continue; // Pular linhas vazias (sem título/nome)

          const docData = {};
          fields.forEach((field, index) => {
            let val = row[index];
            // Conversão de tipos básica
            if (field === 'price' || field === 'totalVolume' || field === 'totalCost' || field === 'minimumAmount') {
              val = Number(String(val).replace(',', '.'));
            }
            docData[field] = val || (typeof val === 'number' ? 0 : '');
          });

          // Campos padrão obrigatórios para 'item'
          if (key === 'item') {
            docData.display = true;
            docData.carrossel = false;
            docData.sideDishesElementList = [];
            docData.recipe = {};
          }

          await addDoc(collection(db, collName), docData);
          count++;
        }

        setMessage({ type: 'success', text: `${count} registros importados com sucesso para ${collName}!` });
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Erro ao processar arquivo. Verifique se o formato está correto.' });
      } finally {
        setLoading(false);
        // Limpar input de arquivo
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className={style.container}>
      <Link to="/admin/admin">
        <Title mainTitle="Gestão via Excel" />
      </Link>

      <div className={style.info}>
        <p>Use esta ferramenta para cadastrar múltiplos itens de uma vez. Baixe o template, preencha as colunas e faça o upload.</p>
      </div>

      {message.text && (
        <div className={`${style.message} ${style[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={style.grid}>
        <div className={style.card}>
          <h3>Cardápio (Pratos)</h3>
          <p>Mínimo necessário: Título e Preço.</p>
          <div className={style.actions}>
            <button onClick={() => downloadTemplate('item')} className={style.btnTemplate}>
              📥 Baixar Template
            </button>
            <label className={style.btnUpload}>
              📤 Enviar Planilha
              <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'item')} hidden />
            </label>
          </div>
        </div>

        {hasRawMaterial && (
          <div className={style.card}>
            <h3>Estoque (Matéria Prima)</h3>
            <p>Mínimo necessário: Produto e Unidade.</p>
            <div className={style.actions}>
              <button onClick={() => downloadTemplate('stock')} className={style.btnTemplate}>
                📥 Baixar Template
              </button>
              <label className={style.btnUpload}>
                📤 Enviar Planilha
                <input type="file" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, 'stock')} hidden />
              </label>
            </div>
          </div>
        )}
      </div>

      {loading && <div className={style.loader}>Enviando dados... Por favor, aguarde.</div>}
    </div>
  );
};

export default ExcelManagement;
