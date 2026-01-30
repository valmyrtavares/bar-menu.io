import React from 'react';
import { isEmptyObject } from '../Helpers/Helpers';


const useRecipeIngredients = (recipe, productList, customizedPriceObj) => {
    const [ingredientsSimple, setIngredientsSimple] = React.useState([]);
    const [ingredientsBySize, setIngredientsBySize] = React.useState({});
    // --- ATO 1: Inicialização ---
    React.useEffect(() => {
        if (recipe) {
            if (Array.isArray(recipe.FinalingridientsList)) {
                setIngredientsSimple(recipe.FinalingridientsList);
            } else if (recipe.FinalingridientsList) {
                setIngredientsBySize(recipe.FinalingridientsList);
            } else {
                // Caso de receita vazia/nova
                setIngredientsSimple([]);
                setIngredientsBySize({});
            }
        }
    }, [recipe]);
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
            let hasChanges = false;
            Object.entries(ingredientsBySize).forEach(([sizeLabel, ingredientList]) => {
                updatedBySize[sizeLabel] = ingredientList.map((ingredient) => {
                    const updateData = getUpdatedCostData(ingredient);
                    return { ...ingredient, ...updateData };
                });
            });
            setIngredientsBySize(updatedBySize);
        }
    };
    // --- ATO 3: Ação (Adicionar/Remover) ---
    const addIngredient = (ingredient, size) => {
        if (!isEmptyObject(customizedPriceObj)) {
            setIngredientsBySize((prev) => ({
                ...prev,
                [size]: [...(prev[size] || []), ingredient],
            }));
        } else {
            setIngredientsSimple((prev) => [...prev, ingredient]);
        }
    };
    const removeItem = (sizeOrIndex, index) => {
        if (!isEmptyObject(customizedPriceObj) && index !== undefined) {
            setIngredientsBySize((prev) => ({
                ...prev,
                [sizeOrIndex]: prev[sizeOrIndex]?.filter((_, i) => i !== index),
            }));
        } else {
            // Se for simples, sizeOrIndex é o indice
            const updatedList = ingredientsSimple.filter((_, i) => i !== sizeOrIndex);
            setIngredientsSimple(updatedList);
        }
    };
    // --- ATO 4: O Veredito (Cálculos) ---
    const calculateItemCost = (ingredientsListTarget, label) => {
        // Se passar label, calcula baseada no objeto ingredientsBySize (que deve ser passado ou acessado via state se quisermos internalizar)
        // Para simplificar e manter puro, vamos usar o state interno se não passado argumento

        let targetList = ingredientsListTarget;

        // Se o targetList não for passado, tentamos deduzir pelo state interno (flexibilidade)
        if (!targetList) {
            if (label) targetList = ingredientsBySize[label];
            else targetList = ingredientsSimple;
        } else if (label && !Array.isArray(targetList)) {
            // Se foi passado o objeto cheio e um label
            targetList = targetList[label];
        }
        if (!Array.isArray(targetList)) return 0;
        const total = targetList.reduce((sum, item) => {
            const value = parseFloat(item.portionCost) || 0;
            return sum + value;
        }, 0);
        return Number(total.toFixed(2));
    };

    // Função auxiliar para retornar ambos os dados para o componente salvar
    const getRecipeData = () => {
        return {
            ingredientsSimple,
            ingredientsBySize
        }
    };
    return {
        ingredientsSimple,
        ingredientsBySize,
        addIngredient,
        removeItem,
        calculateItemCost,
        getRecipeData,
        isEmptyObject // Útil exportar para o componente usar na renderização condicional
    };
};
export default useRecipeIngredients;