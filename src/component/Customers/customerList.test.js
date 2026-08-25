import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { firstNameClient } from '../../Helpers/Helpers';
import { getCustomerName } from './customerList';
import EditCustomerModal from './EditCustomerModal';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, coll, id) => ({ id, path: `${coll}/${id}` })),
}));

jest.mock('../../config-firebase/firebase', () => ({
  db: {},
}));

jest.mock('../../api/FirestoreInterceptor', () => ({
  updateDoc: jest.fn(() => Promise.resolve(true)),
}));

describe('Customer Name Logic & Helpers', () => {
  test('firstNameClient should handle leading spaces, multiple spaces and lowercase/uppercase correctly', () => {
    expect(firstNameClient('   gabriel silva')).toBe('Gabriel');
    expect(firstNameClient('MARIA Clara')).toBe('Maria');
    expect(firstNameClient('  joão  ')).toBe('João');
    expect(firstNameClient('')).toBe('');
    expect(firstNameClient(null)).toBe('');
    expect(firstNameClient(undefined)).toBe('');
  });

  test('getCustomerName should fallback to fantasyName, clientName, nome or empty string', () => {
    expect(getCustomerName({ name: ' Carlos ' })).toBe('Carlos');
    expect(getCustomerName({ name: 'anonimo', fantasyName: 'Lucas Totem' })).toBe('Lucas Totem');
    expect(getCustomerName({ name: '', fantasyName: 'Ana' })).toBe('Ana');
    expect(getCustomerName({ clientName: 'Roberto' })).toBe('Roberto');
    expect(getCustomerName({ nome: 'Juliana' })).toBe('Juliana');
    expect(getCustomerName(null)).toBe('');
  });
});

describe('EditCustomerModal Component', () => {
  const mockCustomer = {
    id: 'user-123',
    name: '  João da Silva  ',
    cpf: '123.456.789-00',
    phone: '11999999999',
    birthday: '15/05/1990',
    email: 'joao@email.com',
  };

  test('should render modal with existing customer data and allow editing', async () => {
    const handleSaved = jest.fn();
    const handleClose = jest.fn();

    render(
      <EditCustomerModal
        customer={mockCustomer}
        isOpen={true}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    );

    expect(screen.getByLabelText(/Nome Completo/i)).toHaveValue('João da Silva');
    expect(screen.getByLabelText(/CPF/i)).toHaveValue('123.456.789-00');
    expect(screen.getByLabelText(/Celular/i)).toHaveValue('11999999999');
    expect(screen.getByLabelText(/Data de Aniversário/i)).toHaveValue('15/05/1990');

    // Change input
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { name: 'name', value: 'João Pedro Silva' },
    });
    fireEvent.change(screen.getByLabelText(/Celular/i), {
      target: { name: 'phone', value: '11988887777' },
    });

    fireEvent.click(screen.getByText(/Salvar Alterações/i));

    await waitFor(() => {
      expect(handleSaved).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          name: 'João Pedro Silva',
          fantasyName: 'João Pedro Silva',
          phone: '11988887777',
        })
      );
    });
  });
});
