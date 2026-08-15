import { issueAutoNfce, resetFiscalCircuitBreaker } from './fiscalService';
import { doc } from 'firebase/firestore';
import { updateDoc } from '../api/FirestoreInterceptor';

// Mock dependencies
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
}));

jest.mock('../config-firebase/firebase', () => ({
    db: {},
}));

describe('NFCe Safety Lock Verification', () => {
    let globalFetchSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        resetFiscalCircuitBreaker();
        globalFetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'autorizado', success: true, caminho_danfe: '/mock.pdf' }),
        });
        updateDoc.mockResolvedValue();
        const { addDoc } = require('firebase/firestore');
        addDoc.mockResolvedValue({ id: 'mock-doc-id' });
    });

    afterEach(() => {
        globalFetchSpy.mockRestore();
    });

    /**
     * This test simulates the logic inside RequestListToBePrepared.js triggerFiscal
     * It uses a local set to simulate the global.processedOrdersGlobal.current trava.
     */
    it('MUST prevent duplicate issuance even with concurrent "trigger" calls', async () => {
        const mockOrder = {
            id: 'PROVA_SEGURANCA_001',
            countRequest: '1234',
            paymentDone: true,
            nfceIssued: false,
            sendingNfce: false,
            finalPriceRequest: 10.00,
            request: [{ name: 'BIG AÇAI', finalPrice: 10.00, category: 'alimentacao' }]
        };

        // Simula o useRef(new Set()) global do componente
        const processedOrdersLock = new Set();

        // Mock da função trigger que existe no componente
        const triggerFiscalLogic = async (order) => {
            if (order.paymentDone === true && !order.nfceIssued && !order.sendingNfce && !order.nfceStatus && !processedOrdersLock.has(order.id)) {
                // TRAVA IMEDIATA EM MEMÓRIA (Igual ao RequestListToBePrepared.js:101)
                processedOrdersLock.add(order.id);

                try {
                    // Simula o update doc do firestore
                    await updateDoc(doc({}, 'requests', order.id), { sendingNfce: true });

                    // Chama o serviço de emissão
                    await issueAutoNfce(order);
                } catch (err) {
                    // Mantém a trava para evitar loops
                }
            }
        };

        // EXECUTAMOS 10 CHAMADAS SIMULTÂNEAS (Condition Race Simulator)
        await Promise.all([
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder),
            triggerFiscalLogic(mockOrder)
        ]);

        // VERIFICAÇÃO FINAL:
        // O fetch (chamada para API externa) deve ter sido chamado EXATAMENTE UMA VEZ.
        expect(globalFetchSpy).toHaveBeenCalledTimes(1);

        // A trava de memória deve conter o ID
        expect(processedOrdersLock.has(mockOrder.id)).toBe(true);

        console.log('✅ TESTE DE SEGURANÇA PASSOU: Apenas 1 nota emitida após 10 tentativas simultâneas.');
    });

    it('NÃO deve emitir se o pedido já possuir nfceStatus (erro, rejeitado ou autorizado)', async () => {
        const mockOrderWithError = {
            id: 'PROVA_SEGURANCA_002',
            countRequest: '1235',
            paymentDone: true,
            nfceIssued: false,
            sendingNfce: false,
            nfceStatus: 'erro', // Já possui status de erro anterior
            finalPriceRequest: 15.00,
            request: [{ name: 'AÇAI TROPICAL', finalPrice: 15.00, category: 'alimentacao' }]
        };

        const processedOrdersLock = new Set();
        const triggerFiscalLogic = async (order) => {
            if (order.paymentDone === true && !order.nfceIssued && !order.sendingNfce && !order.nfceStatus && !processedOrdersLock.has(order.id)) {
                processedOrdersLock.add(order.id);
                await issueAutoNfce(order);
            }
        };

        await triggerFiscalLogic(mockOrderWithError);

        // Nenhuma requisição HTTP deve ser disparada
        expect(globalFetchSpy).toHaveBeenCalledTimes(0);
    });

    it('deve reutilizar a mesma promessa em memória para chamadas concorrentes diretas a issueAutoNfce (In-Flight Dedup)', async () => {
        const mockOrder = {
            id: 'DEDUP_TEST_001',
            countRequest: '999',
            finalPriceRequest: 20.00,
            request: [{ name: 'CASQUINHA', finalPrice: 20.00, category: 'alimentacao' }]
        };

        // Dispara 5 chamadas diretas a issueAutoNfce sem passar pelo componente
        const results = await Promise.all([
            issueAutoNfce(mockOrder),
            issueAutoNfce(mockOrder),
            issueAutoNfce(mockOrder),
            issueAutoNfce(mockOrder),
            issueAutoNfce(mockOrder),
        ]);

        // Apenas UMA requisição fetch externa deve ocorrer
        expect(globalFetchSpy).toHaveBeenCalledTimes(1);

        // Todas as 5 promessas devem ter retornado o mesmo resultado
        expect(results[0].status).toBe('autorizado');
        expect(results[4].status).toBe('autorizado');
    });
});
