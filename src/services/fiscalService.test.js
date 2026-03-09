import { issueAutoNfce } from './fiscalService';
import { addDoc, updateDoc } from 'firebase/firestore';

// Mock dependencies
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
}));

jest.mock('../config-firebase/firebase', () => ({
    db: {},
}));

describe('issueAutoNfce', () => {
    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();

        // Mock global fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: 'autorizado', success: true, caminho_danfe: '/mock.pdf' }),
            })
        );

        // Mock Firestore responses
        addDoc.mockResolvedValue({ id: 'mock-doc-id' });
        updateDoc.mockResolvedValue();
    });

    it('deve enviar CPF vazio quando order.cpfForInvoice não existir', async () => {
        const mockOrder = {
            id: 'order123',
            paymentMethod: 'CREDIT',
            finalPriceRequest: 100.00,
            paymentDetails: { cardBrandCode: '01' },
            request: [{ name: 'Item Teste', category: 'agua', finalPrice: 10.0 }],
            // cpfForInvoice is undefined here
        };

        await issueAutoNfce(mockOrder);

        // Verify fetch was called
        expect(global.fetch).toHaveBeenCalledTimes(1);

        // Get the arguments passed to fetch
        const [url, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);

        // Verify the CPF field sent to API is empty string
        expect(body.cpf_destinatario).toBe('');

        // Verify other critical fields
        expect(body.cnpj_emitente).toBe('19337953000178');
    });

    it('deve enviar CPF formatado quando order.cpfForInvoice existir', async () => {
        const mockOrder = {
            id: 'order123',
            paymentMethod: 'DEBIT',
            finalPriceRequest: 50.00,
            cpfForInvoice: '123.456.789-00', // CPF with formatting
            request: [],
        };

        await issueAutoNfce(mockOrder);

        const [url, options] = global.fetch.mock.calls[0];
        const body = JSON.parse(options.body);

        // Verify the CPF field sent to API is only digits
        expect(body.cpf_destinatario).toBe('12345678900');
    });

    it('NÃO deve chamar updateDoc no documento do pedido (anti race condition)', async () => {
        const mockOrder = {
            id: 'order123',
            paymentMethod: 'PIX',
            finalPriceRequest: 1.00,
            request: [{ name: 'Água', category: 'agua', finalPrice: 1.0 }],
        };

        await issueAutoNfce(mockOrder);

        // issueAutoNfce NÃO deve atualizar o doc do pedido diretamente.
        // Essa responsabilidade é do triggerFiscal para evitar onSnapshot intermediário.
        expect(updateDoc).not.toHaveBeenCalled();
    });

    it('deve retornar o resultado COM o campo ref para uso pelo triggerFiscal', async () => {
        const mockOrder = {
            id: 'order123',
            paymentMethod: 'PIX',
            finalPriceRequest: 1.00,
            countRequest: 123,
            name: 'Cliente Teste',
            request: [{ name: 'Água', category: 'agua', finalPrice: 1.0 }],
        };

        const result = await issueAutoNfce(mockOrder);

        // Deve conter os campos da API + ref gerado internamente
        expect(result.status).toBe('autorizado');
        expect(result.caminho_danfe).toBe('/mock.pdf');
        expect(result.ref).toBeDefined();
        expect(typeof result.ref).toBe('string');

        // Deve seguir o novo padrão de ref contendo os dados do pedido 'REQ--{pedido}--{nome}--{hash}'
        expect(result.ref.startsWith('REQ--123--CLIENTE-TESTE--')).toBe(true);
    });
});

