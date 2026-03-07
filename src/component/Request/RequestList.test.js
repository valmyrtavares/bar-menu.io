import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RequestList from './RequestList';
import * as Api from '../../api/Api';
import '@testing-library/jest-dom';

// Mocks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Link: ({ children }) => <div>{children}</div>
}));

// Mock the API functions
jest.mock('../../api/Api', () => ({
    getPaginatedData: jest.fn(),
    updateCollection: jest.fn(),
}));

// Mock Helers to avoid issues with requestSorter
jest.mock('../../Helpers/Helpers.js', () => ({
    getFirstFourLetters: (str) => str.substring(0, 4),
    requestSorter: (list) => list // Pass through mock
}));

// Generate 40 items to ensure the 'Next' button enables properly
const createMockPage = (startId, namePrefix) => {
    const data = [];
    for (let i = 0; i < 40; i++) {
        const id = startId + i;
        data.push({
            id: String(id),
            name: `${namePrefix} ${i}`,
            countRequest: 1000 - id,
            orderDelivered: i % 2 === 0, // Toggle some as delivered
            finalPriceRequest: 50
        });
    }
    return {
        data,
        firstVisible: { id: String(startId) },
        lastVisible: { id: String(startId + 39) },
        empty: false
    };
};

const mockDataFirstPage = createMockPage(1, 'TargetName1');
const mockDataSecondPage = createMockPage(41, 'TargetName2');

describe('RequestList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. useEffect carrega os iniciais: verifica se getPaginatedData é chamado com init', async () => {
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);

        render(
            <BrowserRouter>
                <RequestList />
            </BrowserRouter>
        );

        // Esperar inicialização
        await waitFor(() => {
            expect(Api.getPaginatedData).toHaveBeenCalledWith('requests', 'countRequest', 'desc', 40, null, 'init');
        });

        // Validar custom text matchers porque o nome é interpolado junto do <span>Nome</span> no DOM
        expect(await screen.findByText((content, node) => node.textContent === 'Nome TargetName1 0')).toBeInTheDocument();
    });

    test('2. Botão de Próximos 40: verifica clique e nova requisição next', async () => {
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);

        render(
            <BrowserRouter>
                <RequestList />
            </BrowserRouter>
        );

        // Espera o botão de Próximos ficar ativo
        const btnNext = await screen.findByText(/Próximos 40/i);
        await waitFor(() => expect(btnNext).not.toBeDisabled());

        Api.getPaginatedData.mockResolvedValueOnce(mockDataSecondPage);

        fireEvent.click(btnNext);

        await waitFor(() => {
            // O mockDataFirstPage.lastVisible vai ser evocado aqui como cursorDoc
            expect(Api.getPaginatedData).toHaveBeenNthCalledWith(2, 'requests', 'countRequest', 'desc', 40, mockDataFirstPage.lastVisible, 'next');
        });

        expect(await screen.findByText((content, node) => node.textContent === 'Nome TargetName2 0')).toBeInTheDocument();
        expect(screen.getByText(/Página 2/i)).toBeInTheDocument();
    });

    test('3. Botão de Anteriores: verifica retorno para a página 1 (prev)', async () => {
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);

        render(
            <BrowserRouter>
                <RequestList />
            </BrowserRouter>
        );

        // Avança para página 2
        const btnNext = await screen.findByText(/Próximos 40/i);
        await waitFor(() => expect(btnNext).not.toBeDisabled());

        Api.getPaginatedData.mockResolvedValueOnce(mockDataSecondPage);
        fireEvent.click(btnNext);

        const btnPrev = await screen.findByText(/Anteriores/i);
        await waitFor(() => expect(btnPrev).not.toBeDisabled());

        // Retorna para página 1
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);
        fireEvent.click(btnPrev);

        await waitFor(() => {
            expect(Api.getPaginatedData).toHaveBeenNthCalledWith(3, 'requests', 'countRequest', 'desc', 40, mockDataSecondPage.firstVisible, 'prev');
        });

        expect(screen.getByText(/Página 1/i)).toBeInTheDocument();
    });

    test('4. Botão de recuperar request: dispara updateCollection, loading e redirect', async () => {
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);
        Api.updateCollection.mockResolvedValueOnce();

        render(
            <BrowserRouter>
                <RequestList />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/TargetName1 0/i)).toBeInTheDocument());

        const restoreButtons = screen.getAllByRole('button', { name: /Recuperar pedido/i });

        // O primeiro (index 0) tem orderDelivered: true, logo não está desabilitado
        const targetButton = restoreButtons[0];
        expect(targetButton).not.toBeDisabled();

        fireEvent.click(targetButton);

        expect(targetButton).toHaveTextContent('Trazendo pedido na tela...');
        expect(targetButton).toBeDisabled();

        await waitFor(() => {
            expect(Api.updateCollection).toHaveBeenCalledWith('requests', '1', { orderDelivered: false });
            expect(mockNavigate).toHaveBeenCalledWith('/admin/requestlist');
        });
    });

    test('5. Desabilitamento de "Recuperar pedido" caso orderDelivered seja false', async () => {
        Api.getPaginatedData.mockResolvedValueOnce(mockDataFirstPage);

        render(
            <BrowserRouter>
                <RequestList />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByText(/TargetName1 0/i)).toBeInTheDocument());

        const restoreButtons = screen.getAllByRole('button', { name: /Recuperar pedido/i });

        // O segundo (index 1) tem orderDelivered: false
        expect(restoreButtons[1]).toBeDisabled();
    });
});
