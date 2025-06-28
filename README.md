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

3.2 **Criar o banco de dados `biblioteca`:**
```sql
CREATE DATABASE biblioteca;
```

### Conectar ao Banco
Para acessar o banco com o novo usuário:
```bash
psql -U biblioteca_user -d biblioteca -h localhost -W
```

### Configurando migração

1. **Configurar arquivo .env**
Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://biblioteca_user:sua_senha@localhost:5432/biblioteca
```

Altere os valores conforme necessário para o seu ambiente.

2. **Execute a migração**
Utilize a ferramenta de migração do seu projeto (por exemplo, com o Prisma):

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

# Padrão de resposta da API

## Listagem
O padrão de resposta para listagem será um array de objetos

Exemplo:
``` json
    [
        {...}
        {...}
        {...}
    ]
```
## Selecionar
O padrão de resposta para seleção será sempre um objeto

Exemplo:
``` json
    {...}
```
## Edição
O padrão de resposta para seleção será sempre o objeto atualizado

Exemplo:
``` json
    {...}
``` 
## Funcionalidade específica
Para cada funcionalidade específica, o retorno esperado será listado a seguir, contate nossos administradores para casos onde o padrão divergir da realidade
### Login
Deve retornar um objeto com a chave `token` seguido do token a ser usado nas requisições

Exemplo:
``` json
    { "token": "..." }
```
### Sincronizar Estados
Deve retornar um objeto com a chave `mensagem` informando quantos estados foram criados ou que nenhum estado precisou ser criado.

Possíveis responses HTTP:
1. 201: Para quando algum estado foi criado
2. 200: Para quando nenhum estado precisou ser criado
3. 503: Para quando a API do IBGE estiver indisponível
OBS: em casos de erros ou autorização, segue o padrão descrito em [Erros](##Erros)

Exemplo:
``` json
    { "mensagem": "27 estados foram criados!" }
```
## Deleção
O padrão de resposta para deleção será sempre uma mensagem no modelo a seguir

Exemplo:
``` json
    { "mensagem": "Registro deletado com sucesso" }
```
## Erros

### Erros esperados
Erros esperados são ações que não foram realizadas por razões diversas, como regra de negócio, erro de envio da requisição,etc.

O padrão de retorno da API para erros esperados será sempre:
1. body: Será o corpo que foi informado na requisição
2. mensagem: mensagem do porque a ação não foi realizada

OBS: Quando um body não for informado, o body será um objeto vazio
``` bash
{
    body: {...}
    mensagem: 'mensagem de erro aqui'
}
```
### Erros Inesperados
Erros inesperados são ações que não foram realizadas por erros não conhecidos e previstos pelos desenvolvedores da API.


O Padrão de retorno da API para erros inesperados será SEMPRE:
1. mensagem: erro interno
``` bash
{
    mensagem: 'Erro interno, contate o suporte'
}
```