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
#### Listar `/views`
Lista todas as views

Exemplo:
``` json
[
    "cobrancas"
]
```
#### Listar `/views/:view`
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