# Integração VigaBank
Sistema de meios de pagamento para disciplina de Programacão 1 - Sistemas Unoesc

# Configuração de Ambiente

## Banco de Dados - PostgreSQL

Considerando um ambiente Linux Ubuntu:

1. **Instale o PostgreSQL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2. **Verifique se o serviço está em execução:**
```bash
sudo systemctl status postgresql
```

3. **Configurar o Banco de Dados**

3.1 **Conectar ao PostgreSQL como superusuário:**
```bash
psql -U postgres -h localhost
```

3.2 **Criar o banco de dados `viga_bank`:**
```sql
CREATE DATABASE viga_bank;
```

### Conectar ao Banco
Para acessar o banco com o novo usuário:
```bash
psql -U db_user -h localhost -d viga_bank
```

### Configurando migração

1. **Configurar arquivo .env**
Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/viga_bank
```

Altere os valores conforme necessário para o seu ambiente.

2. **Execute a migração**
Utilize a ferramenta de migração do seu projeto:

A migração irá, respectivamente:
1. Destruir todas as views
2. Criar tabelas
3. Criar views
4. Criar funções

OBS: se você identificar comandos de `DROP TABLE IF EXISTS` seguido do nome de alguma view, não se espante.
Isso acontece porque não consegui fazer com que o comando `banco.sync({alter: true})` não crie tabelas com os modelos das views

Comando para executar a migração:
```bash
node migrate.js
```

### Backup BD (alternativa)

Se quiser subir o backup do BD inteiro, pode subir, já até tem alguns dados.

Restaure o arquivo `database_backup.sql`

Não restaure o backup se ele for mais antigo que qualquer arquivo de `models/`. Tudo bem se forem da mesma data/hora

### Node.js
1. **Instale o Node.js e o npm:**
```bash
sudo apt update
sudo apt install nodejs npm
```

2. **Verifique as versões instaladas:**
```bash
node -v
npm -v
```

3. **Instale as dependências do projeto:**
No diretório raiz do projeto, execute:
```bash
npm install
```

4. **Porta da API**
Tenha certeza de que não há nenhum outro serviço escutando a porta no arquivo `server.js`

5. **Inicie o projeto**
```bash
npm start
```

# Documentação API

## Tokens
Neste projeto, temos dois tipos de tokens.

O token disponível nos caminhos `/token` são Tokens API, que são usados para você poder integrar em seu sistema.

O token informado através de `/beneficiarios/login/` é um token de login, que é usado internamente por qualquer um que criar um front-end para o projeto, como nós. Não use este token para integrar em seu sistema

## Rotas
A seguir, você pode ver todas as rotas disponíveis 
### Views
#### Listar `/views` (GET)
Lista todas as views

Exemplo:
``` json
[
    "cobrancas"
]
```
#### Listar `/views/:view` (GET)
Lista os dados de uma view específica

Exemplo:
``` json
    [
        {
            "id": 4,
            "valor": "100.44",
            "status": "A receber",
            "data_cadastro": "2025-06-29T05:19:39.826Z",
            "id_beneficiario": 1,
            "id_integracao": "pix_char_xLTgmeBmCqmGQH10Ucs4u5r2",
            "nosso_numero": null,
            "token": null,
            "tipo_cobranca": "Pix"
        },
        {
            "id": 3,
            "valor": "100.00",
            "status": "A receber",
            "data_cadastro": "2025-06-29T05:19:19.950Z",
            "id_beneficiario": 1,
            "id_integracao": "pix_char_U4uaFHL4GjBpAHKqNGtADdBU",
            "nosso_numero": null,
            "token": null,
            "tipo_cobranca": "Pix"
        }
    ]
```

### Beneficiários
#### Selecionar `/beneficiarios` (GET)
Seleciona um beneficiário por ID

Retorna um objeto com os dados do beneficiário
``` json
{
	"id": 1,
	"razao": "Empresa Teste",
	"fantasia": "Fantasia Teste",
	"cpf_cnpj": "00000000000",
	"codigo_banco": 1,
	"nome_banco": "Banco Teste",
	"agencia": "0001",
	"numero_conta": "12345-6",
	"convenio": null,
	"email": "teste@example.com",
	"data_cadastro": "2025-06-26T16:01:53.471Z",
	"charge_contador": 0,
	"id_parcelamento_contador": 0
}
```
#### Criar `/beneficiarios` (POST)
Criar um novo beneficiário

Dados obrigatórios:

- `razao`
- `fantasia`
- `cpf_cnpj`
- `codigo_banco`
- `nome_banco`
- `agencia`
- `numero_conta`
- `convenio`
- `email`
- `senha`

Campos únicos:

- `cpf_cnpj`
- `email`

Esses campos não podem se repetir entre beneficiários já cadastrados.

``` json
{
	"data_cadastro": "2025-06-30T04:55:34.097Z",
	"charge_contador": 0,
	"id_parcelamento_contador": 0,
	"id": 4,
	"razao": "Tech Solutions LTDA",
	"fantasia": "TechSol",
	"cpf_cnpj": "12345678000192",
	"codigo_banco": 1,
	"nome_banco": "Banco do Brasil",
	"agencia": "1234",
	"numero_conta": "56789-0",
	"convenio": "1234567",
	"email": "financeiro2@techsol.com.br"
}
``` 
#### Login `/beneficiarios/login` (POST)
Realiza o login do beneficiário e retorna um token de autenticação

Dados obrigatórios:
 - `email`
 - `senha`
Exemplo de requisição:
``` json
{
	"email":"guilhermessmith2014@gmail.com"
	"senha":"ewfwjifewe"
}
```

Exemplo de retorno
``` json
{
	"token": "eee894a4-d8fe-4fe0-87de-b589cafe282c"
}
```
### Tokens de API
#### Listar `/token` (GET)
Lista todos os tokens de API
``` json
[
    {
		"id": 2,
		"ativo": true,
		"token": "04c1a738-f1da-42ae-b516-066fc4a52965",
		"id_beneficiario": 1,
		"data_cadastro": "2025-06-26T17:19:59.277Z"
	},
	{
		"id": 1,
		"ativo": false,
		"token": "seu_token_api_aqui",
		"id_beneficiario": 1,
		"data_cadastro": "2025-06-26T17:08:15.050Z"
	}
]
```
#### Selecionar `/token/:id` (GET)
Seleciona um token de API por ID
```json
{
	"id": 1,
	"ativo": false,
	"token": "seu_token_api_aqui",
	"id_beneficiario": 1,
	"data_cadastro": "2025-06-26T17:08:15.050Z"
}
```
#### Criar `/token` (POST)
Cria um novo token de API
```json
{
	"ativo": true,
	"data_cadastro": "2025-06-30T04:58:46.024Z",
	"id": 40,
	"id_beneficiario": 1,
	"token": "5b198f84-a1e2-4e98-8196-8378ce0ed270"
}
```
#### Inativar `/token/:id/inativar` (PUT)
Inativa um token de API por ID
```json
{
	"mensagem": "Token inativado com sucesso"
}
```
### Cidades
#### Listar `/cidades` (GET)
Lista todas as cidades
``` json
[
    {
		"id": 4,
		"nome": "Chapecó",
		"id_estado": 78,
		"cod_ibge": 2,
		"data_cadastro": "2025-06-28T08:02:49.977Z"
	},
	{
		"id": 5,
		"nome": "Alta Floresta D'Oeste",
		"id_estado": 57,
		"cod_ibge": 1100015,
		"data_cadastro": "2025-06-28T16:10:14.266Z"
	}
]
```
#### Selecionar `/cidades/:id` (GET)
Seleciona uma cidade por ID
``` json
{
	"id": 5,
	"nome": "Alta Floresta D'Oeste",
	"id_estado": 57,
	"cod_ibge": 1100015,
	"data_cadastro": "2025-06-28T16:10:14.266Z"
}
```
#### Criar `/cidades` (POST)
Cria uma nova cidade

Dados obrigatórios:
- nome
- id_estado
- cod_ibge

Exemplo de retorno:
``` json
{
	"nome":"Chapecó",
	"id_estado": "78",
	"cod_ibge": "2"
}
```
#### Sincronizar `/cidades/sincronizar` (POST)
Sincroniza as cidades com a API do IBGE

Retorna as cidades que foram criadas ou atualizadas
``` json
[
    {
        "id": 6,
        "nome": "Nova Cidade",
        "id_estado": 78,
        "cod_ibge": 1234567,
        "data_cadastro": "2025-06-30T01:29:34.339Z"
    }
]
```
Pode retornar uma mensagem caso nenhuma cidade nova tenha sido criada:
``` json
{
    "mensagem": "Nenhuma cidade nova a ser criada"
}
```
### Estados
#### Listar `/estados` (GET)
Lista todos os estados
``` json
[
    {
		"id": 57,
		"sigla": "RO",
		"nome": "Rondônia",
		"cod_ibge": 11,
		"data_cadastro": "2025-06-28T07:38:57.732Z"
	},
	{
		"id": 58,
		"sigla": "AC",
		"nome": "Acre",
		"cod_ibge": 12,
		"data_cadastro": "2025-06-28T07:38:57.732Z"
	}
]
```
#### Selecionar `/estados/:id` (GET)
Seleciona um estado por ID
``` json
{
    "id": 57,
    "sigla": "RO",
    "nome": "Rondônia",
    "cod_ibge": 11,
    "data_cadastro": "2025-06-28T07:38:57.732Z"
}
```
#### Sincronizar `/estados/sincronizar` (POST)
Sincroniza os estados com a API do IBGE
Retorna os estados que foram criados ou atualizados
``` json
[
    {
        "id": 78,
        "sigla": "SC",
        "nome": "Santa Catarina",
        "cod_ibge": 42,
        "data_cadastro": "2025-06-30T01:29:34.339Z"
    },
    {
		"id": 58,
		"sigla": "AC",
		"nome": "Acre",
		"cod_ibge": 12,
		"data_cadastro": "2025-06-28T07:38:57.732Z"
	}
]
```
Pode retornar uma mensagem caso nenhum estado novo tenha sido criado:
``` json
{
    "mensagem": "Nenhuma estado novo a ser criado"
}
```
### PIX
#### Gerar PIX `/pix/gerar` (POST)
Gera um novo PIX

Dados obrigatórios:
- `valor_decimal`
- `cliente_nome`
- `cliente_email`
- `cliente_cpf_cnpj`

Exemplo de retorno:
``` json
{
	"status": "A",
	"data_cadastro": "2025-06-30T01:29:34.339Z",
	"id": 6,
	"valor": "4.50",
	"cod_copia_cola": "",
	"id_beneficiario": 1,
	"id_integracao": "pix_char_ewndxmDFdpRjSnarBJChQnHF",
	"cliente_nome": "Gui",
	"cliente_email": "guilhermessmith2025@gmail.com",
	"cliente_cpf_cnpj": "13353707906"
}
```
#### Selecionar PIX `/pix/:id` (GET)
Seleciona um PIX por ID
``` json
{
	"status": "A",
	"data_cadastro": "2025-06-30T01:29:34.339Z",
	"id": 6,
	"valor": "4.50",
	"cod_copia_cola": "",
	"id_beneficiario": 1,
	"id_integracao": "pix_char_ewndxmDFdpRjSnarBJChQnHF",
	"cliente_nome": "Gui",
	"cliente_email": "guilhermessmith2025@gmail.com",
	"cliente_cpf_cnpj": "13353707906"
}
```
#### Simular pagamento PIX `/pix/:id/simular-pagamento` (POST)
Simula o pagamento de um PIX
``` json
{
	"mensagem": "Pagamento simulado com sucesso",
    "pix": {
        "status": "A",
        "data_cadastro": "2025-06-30T01:29:34.339Z",
        "id": 6,
        "valor": "4.50",
        "cod_copia_cola": "",
        "id_beneficiario": 1,
        "id_integracao": "pix_char_ewndxmDFdpRjSnarBJChQnHF",
        "cliente_nome": "Gui",
        "cliente_email": "guilhermessmith2025@gmail.com",
        "cliente_cpf_cnpj": "13353707906"
    }
}
```
### Cobranças/Transações de cartão
#### Criar cobrança cartão `/cobranca-cartao/` (POST)
Cria uma cobrança via cartão de crédito

Dados obrigatórios

 - `tipo`
 - `nome_titular`
 - `cpf_titular`
 - `bandeira`
 - `numero_cartao`
 - `cvv`
 - `vencimento`
 - `valor`
 - `endereco`
 - `numero_endereco`
 - `complemento`
 - `id_cidade`

Exemplo de reposta:
``` json
{
	"data_cadastro": "2025-07-01T03:36:03.341Z",
	"id": 7,
	"tipo": "credito",
	"valor": "150.75",
	"status": "R",
	"id_cartao": 7,
	"id_beneficiario": 1,
	"data_ultima_transacao": "2025-07-01T03:36:03.341Z",
	"retorno_ultima_transacao": "Pagamento aprovado no crédito"
}
```
#### Listar cobranças de cartão `/cobranca-cartao/` (GET)
Lista todas as cobranças de cartão deste beneficiário

Exemplo de retorno:
``` json
[
	{
		"id": 7,
		"tipo": "credito",
		"valor": "150.75",
		"status": "R",
		"retorno_ultima_transacao": "Pagamento aprovado no crédito",
		"data_ultima_transacao": "2025-07-01T03:36:03.341Z",
		"data_cadastro": "2025-07-01T03:36:03.341Z",
		"id_beneficiario": 1,
		"id_cartao": 7
	},
	{
		"id": 6,
		"tipo": "credito",
		"valor": "150.75",
		"status": "A",
		"retorno_ultima_transacao": "Instabilidade no sistema de Operadora de Cartão",
		"data_ultima_transacao": "2025-07-01T03:36:01.413Z",
		"data_cadastro": "2025-07-01T03:36:01.414Z",
		"id_beneficiario": 1,
		"id_cartao": 6
	}
]
```

## Padrão de retornos

### Listagem
1. 200 - OK
``` json
    [
        {...}
        {...}
        {...}
    ]
```

2. 204 - Nenhum registro
``` json
    
```
### Selecionar
1. 200 - OK
``` json
    {...}
```
### Edição
1. 200 - OK
``` json
    {...}
``` 
### Funcionalidade específica
Para cada funcionalidade específica, o retorno esperado será listado a seguir, contate nossos administradores para casos onde o padrão divergir da realidade

OBS: Os erros ainda seguem o padrão de Erros descrito nos tópicos abaixo
#### Login
200 - OK
``` json
    { "token": "..." }
```
#### Sincronizar Estados
1. 201: Para quando algum estado foi criado
``` json
    [
        {...},
        {...}
    ]
```
2. 200: Para quando nenhum estado precisou ser criado
``` json
    {
        "mensagem":"Nenhuma estado novo a ser criado"
    }
```
#### Sincronizar cidades
1. 201: Para quando alguma cidade foi criada
``` json
    [
        {...},
        {...}
    ]
```
2. 200: Para quando nenhuma cidade precisou ser criada
``` json
    {
        "mensagem":"Nenhuma cidade nova a ser criada"
    }
```
#### Gerar PIX
201 - OK
``` json
    {
        "status": "A",
        "data_cadastro": "2025-06-30T01:29:34.339Z",
        "id": 6,
        "valor": "4.50",
        "cod_copia_cola": "...",
        "qrcode_base64": "...",
        "id_beneficiario": 1,
        "id_integracao": "pix_char_ewndxmDFdpRjSnarBJChQnHF",
        "cliente_nome": "Gui",
        "cliente_email": "guilhermessmith2025@gmail.com",
        "cliente_cpf_cnpj": "13353707905"
    }
```
#### Simular pagamento
1. 200 - OK
``` json
    { "mensagem": "Pagamento simulado com sucesso" }
```
#### Gerar cobrança cartão
Deve retornar um objeto com os detalhes da cobrança de cartão de crédito
```json
    {
        "data_cadastro": "2025-06-30T01:43:00.588Z",
        "id": 69,
        "tipo": "credito",
        "valor": "150.75",
        "status": "R",
        "id_cartao": 49,
        "id_beneficiario": 1,
        "data_ultima_transacao": "2025-06-30T01:43:00.588Z",
        "retorno_ultima_transacao": "Pagamento aprovado no crédito"
    }
```
### Deleção
O padrão de resposta para deleção será sempre uma mensagem no modelo a seguir

Exemplo:
``` json
    { "mensagem": "Registro deletado com sucesso" }
```
### Erros
Erros espeados são aqueles onde a API sabe o motivo do erro, geralmente erros de regra de negócio, que podem ser resolvidos pelo usuário API.
Ex: dados faltantes, criar cidade sem criar estado primeiro, etc.

Erros inesperados são aqueles que fogem do controle do usuário API.
Ex: API Serasa indisponível, API IBGE indisponível

#### Erros esperados (4xx)
Erros esperados são ações que não foram realizadas por razões diversas, como regra de negócio, erro de envio da requisição,etc.

O padrão de retorno da API para erros esperados será sempre:
1. body: Será o corpo que foi informado na requisição
2. mensagem: mensagem do porque a ação não foi realizada

OBS: Quando um body não for informado, o body será um objeto vazio
``` bash
{
    body: {...}
    detalhes: {...}
    mensagem: 'mensagem de erro aqui'
}
```
#### Erros Inesperados (5xx)
Erros inesperados são ações que não foram realizadas por erros não conhecidos e previstos pelos desenvolvedores da API.


O Padrão de retorno da API para erros inesperados será SEMPRE:
1. mensagem: erro interno
``` json
    { "mensagem": "Erro interno, contate o suporte" }
```
2. mensagem: erro de comunicação com outras APIs
``` json
    { "mensagem":"Api do AbacatePay indisponível" }
```
