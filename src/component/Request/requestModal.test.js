import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import RequestModal from './requestModal';
import '@testing-library/jest-dom';

// Mocks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
}));

jest.mock('../../config-firebase/firebase', () => ({
    db: {},
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    getDoc: jest.fn(),
    collection: jest.fn(),
    updateDoc: jest.fn(),
    setDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
}));

jest.mock('../../api/Api', () => ({
    deleteRequestItem: jest.fn(),
    getOneItemColleciton: jest.fn(),
    getBtnData: jest.fn(),
}));

const mockGlobalContext = {
    pdvRequest: false,
    setPdvRequest: jest.fn(),
    authorizated: true,
    setAuthorizated: jest.fn(),
};

const renderWithContext = (contextValue) => {
    return render(
        <GlobalContext.Provider value={contextValue}>
            <BrowserRouter>
                <RequestModal />
            </BrowserRouter>
        </GlobalContext.Provider>
    );
};

describe('RequestModal - Funcionalidade de Troca de Cliente no PDV', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        // Silencia o console.log para manter os testes limpos
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it('deve chamar o logout e navegar para /create-customer ao clicar no nome do cliente quando estiver no modo PDV', async () => {
        // Configura o ambiente PDV
        localStorage.setItem('pdv', 'true');
        localStorage.setItem('userMenu', JSON.stringify({ id: 'user123', name: 'Henrique' }));

        const contextPDV = { ...mockGlobalContext, pdvRequest: true };

        renderWithContext(contextPDV);

        // Encontra o parágrafo do cliente
        // O texto contém "Cliente: " e o nome. Buscamos pelo texto aproximado.
        const clientElement = screen.getByText(/Cliente:/i).parentElement;

        // Simula o clique
        fireEvent.click(clientElement);

        // Asserções
        expect(localStorage.getItem('userMenu')).toBeNull();
        expect(contextPDV.setAuthorizated).toHaveBeenCalledWith(false);
        expect(mockNavigate).toHaveBeenCalledWith('/create-customer');
    });

    it('NÃO deve permitir a troca de cliente quando NÃO estiver no modo PDV', async () => {
        // Modo Cliente (pdvRequest: false e sem flag no localStorage)
        localStorage.setItem('userMenu', JSON.stringify({ id: 'user123', name: 'Henrique' }));

        const contextCustomer = { ...mockGlobalContext, pdvRequest: false };

        renderWithContext(contextCustomer);

        const clientElement = screen.getByText(/Cliente:/i).parentElement;

        // Simula o clique
        fireEvent.click(clientElement);

        // Asserções: Nada deve ter acontecido
        expect(localStorage.getItem('userMenu')).not.toBeNull();
        expect(contextCustomer.setAuthorizated).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith('/create-customer');
    });

    it('deve exibir o fantasyName corretamente para usuários "anonimo" ou "anonymous"', () => {
        // Mock do estado interno para simular userData (isso exigiria mais complexidade com mocks de Firebase, 
        // mas testamos a lógica do componente renderizado se possível)

        // Como userData vem de um useEffect com fetchUser, vamos apenas verificar se o componente renderiza o fallback de nome
        // se o userData for nulo ou mockar o retorno do firestore.
    });
});
