# Sistema de Devoluções - Viga Bank

Esta seção contém informações sobre o sistema de devoluções implementado no Viga Bank.

## Visão Geral

O sistema de devoluções permite o estorno total ou parcial de transações realizadas via PIX, boleto ou cartão, seguindo regras de negócio específicas.

## Scripts de Teste

Para facilitar a validação e testes do sistema de devoluções, foram criados os seguintes scripts:

### 1. Configuração Inicial do Banco de Dados

Para criar ou atualizar as tabelas necessárias no banco de dados:

```bash
node migrate.js
```

Este comando cria as tabelas necessárias, incluindo a tabela de devoluções e suas relações.

### 2. Criar Usuário de Teste

Para criar um usuário de teste com as configurações necessárias:

```bash
node criar-usuario-teste.js
```

Este script cria um usuário com o e-mail `ferrari@gabriel.com` e senha `senha123`, caso ele ainda não exista no sistema.

### 3. Configurar Token de API

Para gerar um token de API (necessário para solicitar devoluções):

```bash
node criar-token-api.js
```

### 4. Criar PIX de Teste

Para criar uma transação PIX fictícia que pode ser usada nos testes:

```bash
node criar-pix-teste.js
```

### 5. Testar o Modelo de Devolução

Para testar o fluxo completo do modelo de devolução (sem API):

```bash
node teste-devolucao.js
```

Este script executa um fluxo completo de devolução, desde a criação dos dados necessários até o processamento da devolução.

### 6. Testar a API de Devolução

Para testar a API REST de devoluções (requer servidor rodando):

```bash
# Primeiro terminal: iniciar o servidor
node server.js

# Segundo terminal: executar o teste da API
node teste-api-devolucao.js
```

Este script testa todas as operações da API de devoluções: listar, selecionar, criar e atualizar.

### 7. Teste Final Simplificado

Para executar um teste completo e simplificado de toda a funcionalidade de devolução:

```bash
node teste-devolucao-final.js
```

Este script demonstra o fluxo completo de devolução usando o modelo diretamente, sem depender da API.

## Fluxo de Testes Recomendado

Para um teste completo do sistema, recomenda-se seguir esta ordem:

1. Execute `node migrate.js` para garantir que o banco de dados está atualizado
2. Execute `node criar-usuario-teste.js` para criar o usuário de teste
3. Execute `node criar-token-api.js` para gerar um token de API
4. Execute `node criar-pix-teste.js` para criar uma transação de teste
5. Execute `node teste-devolucao.js` para testar o modelo diretamente
6. Execute `node teste-devolucao-final.js` para um teste simplificado e completo
7. Inicie o servidor com `node server.js` e em outro terminal execute `node teste-api-devolucao.js`

## Documentação da API

A documentação completa da API de devoluções, incluindo endpoints, parâmetros e exemplos, está disponível em:

`docs/devolucoes.md`
