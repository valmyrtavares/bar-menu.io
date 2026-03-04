import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import RequestListToBePrepared from './RequestListToBePrepared';
import { fetchInDataChanges } from '../../api/Api';
import '@testing-library/jest-dom';

// Mocks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children }) => <div>{children}</div>
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
    runTransaction: jest.fn(),
}));

jest.mock('../../api/Api', () => ({
    deleteData: jest.fn(),
    getOneItemColleciton: jest.fn(),
    getBtnData: jest.fn().mockResolvedValue([]),
    fetchInDataChanges: jest.fn(() => jest.fn()),
}));


const mockGlobalContext = {
    pdvRequest: false,
    setPdvRequest: jest.fn(),
    authorizated: true,
    setAuthorizated: jest.fn(),
    enableAutoNfce: false,
    orderBeingEdited: null,
    setOrderBeingEdited: jest.fn(),
    setUserNewRequest: jest.fn(),
    processedOrdersGlobal: { current: new Set() }
};

const renderWithContext = (contextValue, props = {}) => {
    return render(
        <GlobalContext.Provider value={contextValue}>
            <BrowserRouter>
                <RequestListToBePrepared title="Pedidos da Cozinha" {...props} />
            </BrowserRouter>
        </GlobalContext.Provider>
    );
};

describe('RequestListToBePrepared - Funcionalidade de Edição', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
        window.alert.mockRestore();
    });

    it('deve renderizar o componente basico', async () => {
        renderWithContext(mockGlobalContext);
        await waitFor(() => {
            expect(screen.getByText(/Pedidos da Cozinha/i)).toBeInTheDocument();
        });
    });

    it('deve exibir o botao de Editar Pedido se estiver no PDV e o pedido nao tiver sido pago', async () => {
        // mock the API call in useEffect
        fetchInDataChanges.mockImplementation((collection, callback) => {
            callback([
                { id: '123', name: 'Zezinho', paymentDone: false, orderDelivered: false, countRequest: 1, dateTime: '12:00', finalPriceRequest: 50, request: [] }
            ]);
            return jest.fn(); // return unsubscribe
        });

        localStorage.setItem('pdv', 'true');

        renderWithContext(mockGlobalContext);

        // we should find the button inside an expanded request (mock expanded by clicking expand)
        const expandBtn = await screen.findByRole('button', { name: /Expandir/i });
        fireEvent.click(expandBtn);

        const editBtn = await screen.findByRole('button', { name: /Editar Pedido/i });
        expect(editBtn).toBeInTheDocument();

        // when clicked, it should call global.setOrderBeingEdited
        fireEvent.click(editBtn);

        await waitFor(() => {
            expect(mockGlobalContext.setOrderBeingEdited).toHaveBeenCalledWith({
                id: '123',
                countRequest: 1,
                dateTime: '12:00',
                discount: 0
            });
            expect(mockGlobalContext.setPdvRequest).toHaveBeenCalledWith(true);
        });
    });

    it('Nao deve exibir Editar Pedido se o pedido ja foi pago mesmo estando no pdv', async () => {
        fetchInDataChanges.mockImplementation((collection, callback) => {
            callback([
                { id: '123', name: 'Zezinho', paymentDone: true, orderDelivered: false, countRequest: 1, dateTime: '12:00', finalPriceRequest: 50, request: [] }
            ]);
            return jest.fn();
        });
        localStorage.setItem('pdv', 'true');

        renderWithContext(mockGlobalContext);

        const expandBtn = await screen.findByRole('button', { name: /Expandir/i });
        fireEvent.click(expandBtn);

        const editBtn = screen.queryByRole('button', { name: /Editar Pedido/i });
        expect(editBtn).not.toBeInTheDocument();
    });
});

