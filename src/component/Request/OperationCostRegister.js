import React, { useState, useEffect } from 'react';
import { getBtnData, deleteData } from '../../api/Api'; // Ajuste o caminho conforme necessário
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from '../../config-firebase/firebase'; // Ajuste o caminho do firebaseConfig conforme necessário
import style from '../../assets/styles/CostOperations.module.scss';
import { Link } from 'react-router-dom';
import Title from '../title';

export default function CostOperations() {
  const db = getFirestore(app);
  const [form, setForm] = useState({
    typeOfOperation: 'pix',
    valueOfOperation: '',
  });

  const [operations, setOperations] = useState([]);

  // Função para buscar dados da coleção
  useEffect(() => {
    async function fetchOperations() {
      const data = await getBtnData('costOperations');
      setOperations(data);
    }
    fetchOperations();
  }, []);

  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'costOperations'), {
        typeOfOperation: form.typeOfOperation,
        valueOfOperation: parseFloat(form.valueOfOperation),
      });
      console.log('Documento adicionado com ID: ', docRef.id);

      // Atualiza a tabela localmente após a submissão
      setOperations((prev) => [...prev, { id: docRef.id, ...form }]);

      // Reseta o formulário
      setForm({ typeOfOperation: 'pix', valueOfOperation: '' });
    } catch (err) {
      console.error('Erro ao adicionar documento: ', err);
    }
  };

  // Função para deletar um documento
  const handleDelete = async (id) => {
    try {
      await deleteData('costOperations', id);
      setOperations((prev) => prev.filter((operation) => operation.id !== id));
    } catch (err) {
      console.error('Erro ao deletar documento: ', err);
    }
  };

  return (
    <div className={`${style.containerOperationCostRegister} p-4`}>
      <Link to="/admin/admin">
        <Title mainTitle="Gerenciar Operações de Custo" />
      </Link>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Tipo de Operação
          </label>
          <select
            value={form.typeOfOperation}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, typeOfOperation: e.target.value }))
            }
            className="border rounded p-2 w-full"
          >
            <option value="pix">Pix</option>
            <option value="credit">Crédito</option>
            <option value="debit">Débito</option>
            <option value="cash">Dinheiro</option>
            <option value="vr">VR</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Valor da Operação
          </label>
          <input
            type="number"
            step="0.01"
            value={form.valueOfOperation}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, valueOfOperation: e.target.value }))
            }
            className="border rounded p-2 w-full"
            required
          />
        </div>

        <button type="submit" className={style.btn}>
          Enviar
        </button>
      </form>

      {/* Tabela */}
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Tipo</th>
            <th className="border border-gray-300 px-4 py-2">
              Taxa da operação
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Excluir operação
            </th>
          </tr>
        </thead>
        <tbody>
          {operations.map((operation) => (
            <tr key={operation.id}>
              <td>{operation.typeOfOperation}</td>
              <td>{operation.valueOfOperation}</td>
              <td onClick={() => handleDelete(operation.id)}>x</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
