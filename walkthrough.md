# Walkthrough - Implementação de IBS/CBS para NFC-e (Reforma Tributária 2026)

## Alterações Realizadas

Os parâmetros fiscais fornecidos pela contadora foram integrados à geração do payload de cada item das notas fiscais no sistema:

- **cClassTrib:** `000001` (Situações tributadas integralmente pelo IBS e CBS)
- **CST de IBS/CBS:** `000` (Tributação integral)
- **Alíquota CBS:** `0.90%` (`0.90`)
- **Alíquota IBS:** `0.10%` (`0.10`)

### Componente Fiscal

#### [fiscalService.js](file:///c:/Codigo/bar-menu.io/src/services/fiscalService.js)
- Atualizado a função `issueAutoNfce` para incluir automaticamente no grupo de cada item (`nfce.items`) os novos atributos da Reforma Tributária:
  - `cClassTrib: '000001'`
  - `cclass_trib: '000001'`
  - `codigo_classificacao_tributaria: '000001'`
  - `cst_ibs_cbs: '000'`
  - `aliquota_cbs: 0.90`
  - `aliquota_ibs: 0.10`

---

## Plano de Teste / Como Verificar

1. **Emissão de Teste:**
   - Faça um novo pedido no sistema (ou acione a emissão de nota fiscal para um pedido existente).
2. **Resultado na SEFAZ:**
   - A nota fiscal agora conterá os dados do IBS/CBS exigidos pela NT 2025.002 e não deverá mais retornar o erro `"IBS/CBS não informado"`.
3. **Firestore:**
   - Verifique na coleção `taxDocuments` do Firebase se a emissão retorna status `autorizado` com o link `caminho_danfe`.
