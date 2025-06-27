import React from 'react';
import ReusableInputFields from './ReusableInputFields.tsx';

const inputFields = [
  {
    type: 'text',
    label: 'Nome',
    id: 'name',
    require: true,
    autoComplete: true,
    value: '',
    size: 'small',
  },
  {
    type: 'checkbox',
    label: 'Preferencias',
    id: 'prefer',
    require: true,
    autoComplete: false,
    value: '',
    size: 'small',
  },
  {
    type: 'text',
    label: 'Endereço',
    id: 'address',
    require: false,
    autoComplete: false,
    value: '',
    size: 'small',
  },
  {
    type: 'number',
    label: 'Idade',
    id: 'age',
    require: false,
    autoComplete: false,
    value: '',
    size: 'small',
  },
  {
    type: 'select',
    label: 'Categoria',
    id: 'category',
    require: true,
    value: '',
    size: 'small',
    selectOptions: [
      { id: 1, nome: 'Tecnologia' },
      { id: 2, nome: 'Alimentos' },
      { id: 3, nome: 'Moda' },
    ],
    selectLabel: 'nome',
  },
];

const ReusableInputFieldsFather = () => {
  const handleFormSubmit = (data) => {
    console.log('Dados enviados:', data);
  };
  return (
    <div>
      <h1>sou um teste para o componente de inputs fields</h1>;
      <ReusableInputFields fields={inputFields} onSubmit={handleFormSubmit} />
    </div>
  );
};

export default ReusableInputFieldsFather;
