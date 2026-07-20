# Plano de Implementação - Correção de Rejeição IBS/CBS (Reforma Tributária 2026)

Este plano descreve as alterações necessárias no payload de emissão de NFC-e para incluir as novas tags e campos de **IBS/CBS** exigidos pela SEFAZ a partir de 2026.

## Problema

As notas fiscais enviadas para a API Focus NFe estão sendo rejeitadas pela SEFAZ com o erro:
> **"Rejeição: IBS/CBS não informado [nItem: 1]"**

Isso ocorre porque o leiaute das notas fiscais foi atualizado pela Nota Técnica NT 2025.002 (Reforma Tributária do Consumo), tornando obrigatório informar a classificação e situação tributária do IBS/CBS para cada item da nota. Atualmente, o frontend do bar-menu.io envia apenas os tributos antigos (ICMS) no arquivo [fiscalService.js](file:///c:/Codigo/bar-menu.io/src/services/fiscalService.js).

---

## Open Questions

Para que possamos implementar a correção exata, precisamos que você consulte o seu **contador** para obter as seguintes definições fiscais:

> [!IMPORTANT]
> 1. **Regime Tributário:** Qual é o regime tributário da empresa configurado na SEFAZ/Focus NFe (Simples Nacional ou Regime Normal)?
> 2. **Código de Classificação Tributária (cClassTrib):** Qual o código `cClassTrib` (de 6 dígitos) que devemos usar para cada categoria de produto vendida?
>    * Para Bebidas (Água/Refrigerante)
>    * Para Comidas/Lanches (como o TROPICAL-X)
> 3. **CST do IBS/CBS:** Qual é o CST específico de IBS e CBS aplicável aos produtos?
> 4. **Abordagem da Implementação:** Deseja mapear esses novos códigos de forma estática no código-fonte do frontend (assim como é feito hoje com o código NCM por categoria) ou prefere que criemos campos no banco de dados para que você possa editá-los pelo painel de estoque no futuro?

---

## Proposed Changes

Faremos as alterações diretamente no mapeamento de itens do frontend (que é onde o JSON da nota é construído).

### [Componente Fiscal]

#### [MODIFY] [fiscalService.js](file:///c:/Codigo/bar-menu.io/src/services/fiscalService.js)
* Criar uma função mapeadora (ex: `fillingIbsCbsFields(category)`) semelhante à `fillingNcmCode(category)`.
* Atualizar a montagem de cada item no array `nfce.items` (linhas 170-188) para incluir a nova estrutura do grupo `IBSCBS` contendo:
  * `cst` ou `cClassTrib` e alíquotas conforme mapeado pela API da Focus NFe.

#### [MODIFY] [FiscalAttributes.js](file:///c:/Codigo/bar-menu.io/src/component/Request/FiscalAttributes.js)
* Atualizar a montagem manual da nota fiscal para incluir os novos campos no envio manual, mantendo sincronia com o serviço automático.

---

## Verification Plan

### Manual Verification
1. Fazer uma emissão de teste no ambiente de homologação (sandbox) com o produto "TROPICAL-X" e verificar se a nota é autorizada pela SEFAZ.
2. Conferir no console do Firestore se a resposta gravada no banco de dados (`taxDocuments`) passou a vir com status `autorizado` e o link do PDF `caminho_danfe`.
