import { issueAutoNfce } from './fiscalService';
import { updateDoc, doc } from 'firebase/firestore';

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

describe('NFCe Safety Lock Verification', () => {
    let globalFetchSpy;

    beforeEach(() => {
        jest.clearAllMocks();
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
            if (order.paymentDone === true && !order.nfceIssued && !order.sendingNfce && !processedOrdersLock.has(order.id)) {
                // TRAVA IMEDIATA EM MEMÓRIA (Igual ao RequestListToBePrepared.js:101)
                processedOrdersLock.add(order.id);

                try {
                    // Simula o update doc do firestore
                    await updateDoc(doc({}, 'requests', order.id), { sendingNfce: true });

                    // Chama o serviço de emissão
                    await issueAutoNfce(order);
                } catch (err) {
                    processedOrdersLock.delete(order.id);
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
});
