import React, { useEffect, useRef } from 'react';
import { fetchPendingPrints } from '../api/Api';
import { db } from '../config-firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const FiscalObserver = () => {
    // Mantém registro local dos IDs que já abrimos a janela nesta sessão
    // para evitar "re-abrir" caso o update do Firestore demore um pouco.
    const printedInSessionRef = useRef(new Set());

    useEffect(() => {
        // [Filtro de Função] Só roda se for o browser do PDV
        const isPdv = localStorage.getItem('pdv') === 'true';
        if (!isPdv) return;

        // Usa a Query OTIMIZADA: só traz nfceIssued=true AND nfcePrinted=false
        const unsubscribe = fetchPendingPrints(async (data) => {
            // Se não tiver nada pendente, não faz nada
            if (!data || data.length === 0) return;

            for (const order of data) {
                // Se já mandamos imprimir nesta sessão, ignora
                if (printedInSessionRef.current.has(order.id)) continue;

                // Se por acaso a URL não existir (erro de dados), ignoramos
                if (!order.caminho_danfe) continue;

                try {
                    console.log(`[FiscalObserver] Detectada nova nota para imprimir: ${order.countRequest}`);

                    // 1. Marca localmente como "processado"
                    printedInSessionRef.current.add(order.id);

                    // 2. Solicita a impressão via backend (Servidor Proxy Local)
                    // Isso evita abertura de abas e erros de Cross-Origin
                    try {
                        const printResponse = await fetch('http://localhost:4000/api/print-nfce', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                caminho_danfe: order.caminho_danfe,
                                nfceRef: order.nfceRef || order.ref // Passa a referência da nota
                            })
                        });

                        if (printResponse.ok) {
                            console.log(`[FiscalObserver] Impressão enviada para o backend: ${order.countRequest}`);
                        } else {
                            const errorData = await printResponse.json();
                            console.error('[FiscalObserver] Erro no servidor de impressão:', errorData);
                        }
                    } catch (printErr) {
                        console.error('[FiscalObserver] Falha ao conectar com servidor de impressão:', printErr);
                    }

                    // 3. Atualiza no Banco para "nfcePrinted: true"
                    // Isso retira o documento da Query "fetchPendingPrints",
                    // fazendo ele sumir desta lista automaticamente.
                    await updateDoc(doc(db, 'requests', order.id), {
                        nfcePrinted: true
                    });

                    console.log(`[FiscalObserver] ${order.countRequest} marcado como impresso.`);

                } catch (err) {
                    console.error(`[FiscalObserver] Erro ao processar impressão de ${order.countRequest}:`, err);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return null; // Componente invisível
};

export default FiscalObserver;
