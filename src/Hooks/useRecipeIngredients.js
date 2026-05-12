import React from 'react';
import { isEmptyObject } from '../Helpers/Helpers';


const useRecipeIngredients = (recipe, productList, customizedPriceObj) => {
    const [ingredientsSimple, setIngredientsSimple] = React.useState([]);
    const [ingredientsBySize, setIngredientsBySize] = React.useState({
        firstPrice: [],
        secondPrice: [],
        thirdPrice: []
    });

    // --- ATO 1: Inicialização e Migração ---
    React.useEffect(() => {
        if (recipe && recipe.FinalingridientsList) {
            const data = recipe.FinalingridientsList;

            if (Array.isArray(data)) {
                setIngredientsSimple(data);
            } else {
                // Lógica de Migração / Mapeamento
                const newBySize = {
                    firstPrice: [],
                    secondPrice: [],
                    thirdPrice: []
                };

                // 1. Tentar carregar chaves fixas (novo padrão)
                if (data.firstPrice) newBySize.firstPrice = data.firstPrice;
                if (data.secondPrice) newBySize.secondPrice = data.secondPrice;
                if (data.thirdPrice) newBySize.thirdPrice = data.thirdPrice;

                // 2. Heurística e Migração de Chaves Antigas
                const oldKeys = Object.keys(data).filter(k => k !== 'firstPrice' && k !== 'secondPrice' && k !== 'thirdPrice');

                if (oldKeys.length > 0) {
                    // Primeiro, tentar casar pelo nome exato (caso o nome não tenha mudado)
                    const labelMap = {
                        [customizedPriceObj?.firstLabel]: 'firstPrice',
                        [customizedPriceObj?.secondLabel]: 'secondPrice',
                        [customizedPriceObj?.thirdLabel]: 'thirdPrice'
                    };
                    
                    const unmappedOldKeys = [];
                    oldKeys.forEach(oldKey => {
                        const targetFixedKey = labelMap[oldKey];
                        if (targetFixedKey && newBySize[targetFixedKey].length === 0) {
                            newBySize[targetFixedKey] = data[oldKey];
                            console.log(`Migrando receita (match exato) de "${oldKey}" para "${targetFixedKey}"`);
                        } else {
                            unmappedOldKeys.push(oldKey);
                        }
                    });

                    // Se sobraram chaves antigas (porque o nome foi alterado e não bateu),
                    // vamos preencher os slots vazios na ordem
                    if (unmappedOldKeys.length > 0) {
                        const availableSlots = ['firstPrice', 'secondPrice', 'thirdPrice'].filter(
                            k => newBySize[k].length === 0 && customizedPriceObj?.[k.replace('Price', 'Label')]
                        );
                        
                        unmappedOldKeys.forEach((oldKey, index) => {
                            if (index < availableSlots.length) {
                                const targetFixedKey = availableSlots[index];
                                newBySize[targetFixedKey] = data[oldKey];
                                console.log(`Migrando receita (forçado/recuperado) de "${oldKey}" para "${targetFixedKey}"`);
                            }
                        });
                    }
                }

                setIngredientsBySize(newBySize);
            }
        } else {
            // Caso de receita vazia/nova
            setIngredientsSimple([]);
            setIngredientsBySize({
                firstPrice: [],
                secondPrice: [],
                thirdPrice: []
            });
        }
    }, [recipe, customizedPriceObj]);
    // --- ATO 2: Atualização pelo Estoque ---
    React.useEffect(() => {
        reloadCurrentRecipesValue();
    }, [productList]);
    const reloadCurrentRecipesValue = () => {
        if (!productList || productList.length === 0) return;
        const getUpdatedCostData = (ingredient) => {
            const matchedProduct = productList.find(
                (product) => product.product.trim() === ingredient.name.trim()
            );
            if (!matchedProduct || matchedProduct.totalVolume === 0)
                return {
                    costPerUnit: 0,
                    portionCost: 0,
                };
            const costPerUnit = matchedProduct.totalCost / matchedProduct.totalVolume;
            const portionCost = parseFloat(ingredient.amount) * costPerUnit;

            const warningAmountRawMaterial =
                matchedProduct.totalVolume > matchedProduct.minimumAmount
                    ? true
                    : false;
            const unavailableRawMaterial =
                matchedProduct.totalVolume === 0 ? true : false;
            return {
                costPerUnit,
                portionCost,
                warningAmountRawMaterial,
                unavailableRawMaterial,
            };
        };
        if (isEmptyObject(customizedPriceObj)) {
            const updatedIngredients = ingredientsSimple.map((ingredient) => {
                const updateData = getUpdatedCostData(ingredient);
                return { ...ingredient, ...updateData };
            });
            // Verifica se houve mudança real antes de setar para evitar loops, mas React lida bem com isso
            if (JSON.stringify(updatedIngredients) !== JSON.stringify(ingredientsSimple)) {
                setIngredientsSimple(updatedIngredients);
            }
        } else {
            const updatedBySize = {};
            Object.entries(ingredientsBySize).forEach(([sizeKey, ingredientList]) => {
                updatedBySize[sizeKey] = ingredientList.map((ingredient) => {
                    const updateData = getUpdatedCostData(ingredient);
                    return { ...ingredient, ...updateData };
                });
            });
            if (JSON.stringify(updatedBySize) !== JSON.stringify(ingredientsBySize)) {
                setIngredientsBySize(updatedBySize);
            }
        }
    };
    // --- ATO 3: Ação (Adicionar/Remover) ---
    const addIngredient = (ingredient, sizeKey) => {
        if (!isEmptyObject(customizedPriceObj)) {
            // sizeKey deve ser 'firstPrice', 'secondPrice' ou 'thirdPrice'
            setIngredientsBySize((prev) => ({
                ...prev,
                [sizeKey]: [...(prev[sizeKey] || []), ingredient],
            }));
        } else {
            setIngredientsSimple((prev) => [...prev, ingredient]);
        }
    };
    const removeItem = (sizeKeyOrIndex, index) => {
        if (!isEmptyObject(customizedPriceObj) && index !== undefined) {
            setIngredientsBySize((prev) => ({
                ...prev,
                [sizeKeyOrIndex]: prev[sizeKeyOrIndex]?.filter((_, i) => i !== index),
            }));
        } else {
            // Se for simples, sizeKeyOrIndex é o indice
            const updatedList = ingredientsSimple.filter((_, i) => i !== sizeKeyOrIndex);
            setIngredientsSimple(updatedList);
        }
    };
    // --- ATO 4: O Veredito (Cálculos) ---
    const calculateItemCost = (ingredientsListTarget, sizeKey) => {
        // Se passar sizeKey, calcula baseada no objeto ingredientsBySize (que deve ser passado ou acessado via state se quisermos internalizar)
        // Para simplificar e manter puro, vamos usar o state interno se não passado argumento

        let targetList = ingredientsListTarget;

        // Se o targetList não for passado, tentamos deduzir pelo state interno (flexibilidade)
        if (!targetList) {
            if (sizeKey) targetList = ingredientsBySize[sizeKey];
            else targetList = ingredientsSimple;
        } else if (sizeKey && !Array.isArray(targetList)) {
            // Se foi passado o objeto cheio e um sizeKey
            targetList = targetList[sizeKey];
        }
        if (!Array.isArray(targetList)) return 0;
        const total = targetList.reduce((sum, item) => {
            const value = parseFloat(item.portionCost) || 0;
            return sum + value;
        }, 0);
        return Number(total.toFixed(2));
    };

    return {
        ingredientsSimple,
        ingredientsBySize,
        addIngredient,
        removeItem,
        calculateItemCost,
        isEmptyObject // Útil exportar para o componente usar na renderização condicional
    };
};
export default useRecipeIngredients;