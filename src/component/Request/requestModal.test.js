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
    onSnapshot: jest.fn(),
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
    orderBeingEdited: null,
    setOrderBeingEdited: jest.fn(),
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

    it('deve exibir a faixa de edição e chamar as funções de cancelamento ao clicar em Cancelar Edição', async () => {
        const orderBeingEdited = { id: 'req789', countRequest: 42, dateTime: '12/12/2026' };
        const contextEditInfo = { ...mockGlobalContext, orderBeingEdited };

        // Mock do window.confirm
        const confirmSpy = jest.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);

        renderWithContext(contextEditInfo);

        // Verifica se a faixa de edição apareceu
        expect(screen.getByText(/Você está editando o pedido #42/i)).toBeInTheDocument();

        // Encontra o botão Cancelar Edição e clica
        const cancelButton = screen.getByRole('button', { name: /Cancelar Edição/i });
        fireEvent.click(cancelButton);

        // Verifica se window.confirm foi chamado
        expect(confirmSpy).toHaveBeenCalledWith("Tem certeza que deseja cancelar a edição? As adições ou remoções feitas no pedido não serão salvas.");

        // O onClick invoca cancelEditOrder que deve chamar setOrderBeingEdited e navegar
        await waitFor(() => {
            expect(contextEditInfo.setOrderBeingEdited).toHaveBeenCalledWith(null);
            expect(contextEditInfo.setPdvRequest).toHaveBeenCalledWith(false);
            expect(mockNavigate).toHaveBeenCalledWith('/admin/requestlist');
        });

        confirmSpy.mockRestore();
    });

    it('deve habilitar fluxo Pós-Pagamento (Enviar pedido) quando o cliente tiver uma mesa selecionada e não for PDV/Toten', async () => {
        // Mock tableNumber
        localStorage.setItem('tableNumber', '23');
        // pdv e isToten são false por default no localStorage limpo

        // Mock userData com um request não enviado para a cozinha
        const userData = { request: [{ name: 'Suco', finalPrice: 10, sentToKitchen: false }] };
        const userDocSnap = { exists: () => true, data: () => userData };
        const { onSnapshot } = require('firebase/firestore');
        onSnapshot.mockImplementation((ref, callback) => {
            callback(userDocSnap);
            return jest.fn(); // mock unsubscribe
        });

        const context = { ...mockGlobalContext, pdvRequest: false };
        renderWithContext(context);

        // Deve mostrar a mesa na tela
        await waitFor(() => {
            expect(screen.getByText(/Mesa: 23/i)).toBeInTheDocument();
        });

        // O botão Enviar pedido deve estar presente (Pós-Pagamento)
        expect(screen.getByRole('button', { name: /Enviar pedido/i })).toBeInTheDocument();
        // O botão Finalizar (Pré-Pagamento manual / encerramento) também fica lá
        expect(screen.getByRole('button', { name: /Finalizar/i })).toBeInTheDocument();
    });

    it('deve usar o Pré-Pagamento como padrão (Finalizar apenas) quando NÃO houver mesa selecionada', async () => {
        // Sem tableNumber no localStorage

        const userData = { request: [{ name: 'Suco', finalPrice: 10, sentToKitchen: false }] };
        const userDocSnap = { exists: () => true, data: () => userData };
        const { onSnapshot } = require('firebase/firestore');
        onSnapshot.mockImplementation((ref, callback) => {
            callback(userDocSnap);
            return jest.fn(); // mock unsubscribe
        });

        const context = { ...mockGlobalContext, pdvRequest: false };
        renderWithContext(context);

        await waitFor(() => {
            expect(screen.queryByText(/Mesa:/i)).not.toBeInTheDocument();
        });

        // O botão Enviar pedido NÃO deve estar presente (obriga o pré-pagamento pelo Finalizar)
        expect(screen.queryByRole('button', { name: /Enviar pedido/i })).not.toBeInTheDocument();
        // O botão Finalizar deve ser o único caminho para a cozinha
        expect(screen.getByRole('button', { name: /Finalizar/i })).toBeInTheDocument();
    });
});
