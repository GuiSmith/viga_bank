# Documentação da API de Devoluções

## Visão Geral

A API de Devoluções permite que usuários com token de API solicitem o estorno de transações realizadas via PIX, boleto ou cartão de crédito.

## Regras de Negócio

### Restrições de Acesso

- Apenas usuários com **Token de API** podem solicitar devoluções
- Tokens de login comuns não têm permissão para acessar esta funcionalidade

### Prazos

- **Prazo para solicitar:** Máximo de 7 dias corridos após a data da cobrança
- **Prazo para processamento:** As devoluções são processadas em até 24 horas após a solicitação

### Limitações

- O valor da devolução não pode exceder o valor original da transação
- Para PIX: Transações com status "R" (Recebido/Pago) podem ser devolvidas
- Para outros tipos: Apenas transações com status "PAGA", "CONCLUIDA" ou "APROVADA" podem ser devolvidas
- Não é possível ter mais de uma solicitação de devolução em andamento para a mesma transação

## Endpoints

### Listar Devoluções

```
GET /devolucoes
```

**Parâmetros de Consulta:**

- `tipo_transacao`: Filtrar por tipo (PIX, BOLETO, CARTAO)
- `status`: Filtrar por status (SOLICITADA, EM_PROCESSAMENTO, CONCLUIDA, REJEITADA, CANCELADA)
- `data_inicio`: Data inicial para filtro
- `data_fim`: Data final para filtro
- `id_transacao`: Filtrar por ID da transação original

**Resposta:**

```json
[
  {
    "id": 1,
    "id_beneficiario": 123,
    "tipo_transacao": "PIX",
    "id_transacao": 456,
    "valor_original": "100.00",
    "valor_devolucao": "50.00",
    "status": "SOLICITADA",
    "data_solicitacao": "2025-06-28T15:30:00Z"
  }
]
```

### Obter Detalhes de uma Devolução

```
GET /devolucoes/:id
```

**Resposta:**

```json
{
  "id": 1,
  "id_beneficiario": 123,
  "tipo_transacao": "PIX",
  "id_transacao": 456,
  "valor_original": "100.00",
  "valor_devolucao": "50.00",
  "status": "SOLICITADA",
  "data_solicitacao": "2025-06-28T15:30:00Z",
  "beneficiario": {
    "id": 123,
    "razao": "Empresa ABC",
    "fantasia": "ABC",
    "cpf_cnpj": "12345678000190",
    "email": "contato@abc.com"
  },
  "transacao_original": {
    "id": 456,
    "valor": "100.00",
    "status": "PAGA"
  }
}
```

### Criar Nova Solicitação de Devolução

```
POST /devolucoes
```

**Corpo da Requisição:**

```json
{
  "tipo_transacao": "PIX",
  "id_transacao": 456,
  "valor_devolucao": 50.0,
  "motivo": "Cliente desistiu da compra",
  "observacao": "Produto não foi enviado"
}
```

**Resposta:**

```json
{
  "mensagem": "Solicitação de devolução criada com sucesso",
  "devolucao": {
    "id": 1,
    "id_beneficiario": 123,
    "tipo_transacao": "PIX",
    "id_transacao": 456,
    "valor_original": "100.00",
    "valor_devolucao": "50.00",
    "status": "SOLICITADA"
  },
  "processamento": {
    "prazo_estimado": "24 horas",
    "data_estimada": "2025-06-29T15:30:00Z",
    "nota": "As devoluções são processadas em até 24 horas após a solicitação"
  }
}
```

### Atualizar uma Solicitação de Devolução

```
PUT /devolucoes/:id
```

**Corpo da Requisição:**

```json
{
  "motivo": "Motivo atualizado",
  "observacao": "Observação atualizada",
  "status": "CANCELADA"
}
```

**Resposta:**

```json
{
  "mensagem": "Solicitação de devolução cancelada com sucesso",
  "devolucao": {
    "id": 1,
    "status": "CANCELADA"
  }
}
```

## Status de Devolução

- **SOLICITADA**: Devolução registrada no sistema, aguardando processamento
- **EM_PROCESSAMENTO**: Devolução em processamento pelo sistema financeiro
- **CONCLUIDA**: Devolução processada e concluída com sucesso
- **REJEITADA**: Devolução rejeitada pelo sistema financeiro
- **CANCELADA**: Devolução cancelada pelo usuário antes do processamento

## Padrão de Resposta de Erro

Para erros esperados (4xx), a API sempre retorna um objeto com a seguinte estrutura:

```json
{
  "body": {}, // Corpo da requisição original
  "detalhes": {}, // Detalhes específicos sobre o erro
  "mensagem": "" // Mensagem amigável explicando o erro
}
```

Exemplos de respostas de erro:

### Token Inválido

```json
{
  "body": { "tipo_transacao": "PIX", "id_transacao": 123 },
  "detalhes": {
    "tipo_token_atual": "login",
    "tipo_token_necessario": "api"
  },
  "mensagem": "Apenas usuários com token API podem solicitar devoluções"
}
```

### Campos Obrigatórios

```json
{
  "body": { "tipo_transacao": "PIX" },
  "detalhes": {
    "campos_faltando": ["id_transacao", "valor_devolucao", "motivo"],
    "campos_obrigatorios": [
      "tipo_transacao",
      "id_transacao",
      "valor_devolucao",
      "motivo"
    ]
  },
  "mensagem": "Campos obrigatórios não informados"
}
```

### Transação Não Encontrada

```json
{
  "body": { "tipo_transacao": "PIX", "id_transacao": 999 },
  "detalhes": {
    "tipo_transacao": "PIX",
    "id_transacao": 999,
    "id_beneficiario": 123
  },
  "mensagem": "PIX com ID 999 não encontrado ou não pertence ao beneficiário"
}
```

Para erros inesperados (5xx), a API retorna:

```json
{
  "mensagem": "Erro interno, contate o suporte"
}
```
