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
                json: () => Promise.resolve({ status: 'processando', success: true }),
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
});
