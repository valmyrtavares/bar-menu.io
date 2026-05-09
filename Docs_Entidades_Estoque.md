# Dicionário de Entidades do Produto no Estoque

Este documento descreve todas as entidades (propriedades) contidas no objeto de Produto (`obj`) recebido via `props` no componente de edição de estoque (`EditFormStockProduct.js`). 

### 1. `id`
**Descrição:** É o identificador único e exclusivo do produto no banco de dados (Firebase). Usado para encontrar e atualizar o documento correspondente.

### 2. `product`
**Descrição:** É o nome descritivo do produto cadastrado (Ex: "Banana", "Leite Integral", "Tomate").

### 3. `totalVolume` (Volume Total)
**Descrição:** É a quantidade total e real do produto atualmente disponível no estoque, calculada com base na sua unidade de medida principal. (Ex: `1.08` se for Kilos, `12` se for Litros). 

### 4. `totalCost` (Custo Total)
**Descrição:** É o valor financeiro (em Reais) que representa todo o capital investido na quantidade de produto que está no estoque atual (`totalVolume`). É usado para compor o custo geral e valorização de inventário.

### 5. `amount` (Quantidade de Volumes/Embalagens)
**Descrição:** Representa o número de pacotes, fardos ou caixas associadas ao volume do estoque. 
- *Nota Lógica:* Na edição de estoque, se o `totalVolume` for editado manualmente, o sistema faz um cálculo reverso para atualizar esta entidade (`amount = totalVolume / volumePerUnit`), podendo gerar números fracionados (como 0.57).

### 6. `volumePerUnit` (Volume por Unidade/Embalagem)
**Descrição:** A quantidade de conteúdo (Kilos, Litros, Unidades) contida dentro de apenas 1 pacote ou embalagem de fábrica (`amount`). 
- *Nota:* Serve como um fator multiplicador padrão para quando novas notas fiscais/despesas são cadastradas.

### 7. `CostPerUnit` (Custo Unitário)
**Descrição:** O valor financeiro correspondente a apenas **1 unidade da embalagem** (1 `amount`). Ele é deduzido a partir da divisão entre o valor gasto na nota e a quantidade de embalagens adquiridas.

### 8. `unitOfMeasurement` (Unidade de Medida)
**Descrição:** A grandeza usada para contabilizar o `totalVolume` e o `volumePerUnit`. Normalmente as opções são `kg`, `l` (Litro), `un` (Unidade) ou `g` (Grama).

### 9. `minimumAmount` (Volume Mínimo)
**Descrição:** O limite configurado pelo administrador para alertar o sistema de que o estoque está acabando. Quando o `totalVolume` atinge um valor inferior a este, o sistema passa a emitir alertas de reposição para o produto.

### 10. `disabledDish` (Indisponibilidade a partir de)
**Descrição:** O nível crítico de volume (volume de segurança). Se o estoque de um produto cair abaixo ou igual a este nível, o sistema usa esta propriedade como gatilho para desativar e tornar indisponíveis no cardápio de vendas todos os pratos ou receitas que utilizam essa matéria-prima, evitando vendas de produtos sem insumos.

---
### Entidades Acidentais/Herdadas

### 11. `columePerUnit` (Erro de Digitação)
**Descrição:** É apenas um erro de digitação (typo) histórico que foi salvo no banco (originado na função de baixa de insumos no arquivo `RequestListToBePrepared.js`). Não tem utilidade no sistema atual além de poluir a visualização dos dados. Pode ser ignorado.

### 12. `UsageHistory`
**Descrição:** Uma lista (Array) mantida no banco de dados com todo o histórico e log de eventos desse produto (quando entrou, quando saiu, quem editou, ajuste de notas, etc.).

### 13. `operationSupplies`
**Descrição:** Identificador booleano (true/false) que indica se esse produto é um Insumo Direto/Operacional ou Matéria Prima Indireta.
