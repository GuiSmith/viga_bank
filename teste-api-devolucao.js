/**
 * Teste da API de devolução através das chamadas REST
 *
 * Este script testa a API completa de devoluções, simulando
 * chamadas REST como um cliente externo faria:
 *
 * 1. Autenticação e obtenção de token de acesso
 * 2. Configuração do token de API necessário para devoluções
 * 3. Listagem e seleção de transações para devolução
 * 4. Criação de solicitação de devolução
 * 5. Consulta de status e cancelamento da devolução
 *
 * Uso: node teste-api-devolucao.js
 *
 * Requisito: Servidor rodando na porta 5000
 */

import fetch from "node-fetch";
import crypto from "crypto";
import models from "./banco/models/index.js";

// Configuração
const API_URL = "http://localhost:5000";
const EMAIL_TESTE = "ferrari@gabriel.com";
const SENHA_TESTE = "senha123";

// Função auxiliar para facilitar as chamadas de API
async function callAPI(endpoint, method = "GET", data = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  console.log(`Chamando ${method} ${endpoint}...`);
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Verificar o tipo de conteúdo da resposta
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const responseData = await response.json();
      console.log(`Status: ${response.status}`);

      return {
        status: response.status,
        data: responseData,
        ok: response.ok,
      };
    } else {
      // Se não for JSON, obter o texto e mostrar os primeiros 100 caracteres
      const text = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Resposta não-JSON: ${text.substring(0, 100)}...`);

      return {
        status: response.status,
        data: { error: "Resposta não é JSON", preview: text.substring(0, 100) },
        ok: false,
      };
    }
  } catch (error) {
    console.error(`Erro na chamada para ${endpoint}:`, error);
    return {
      status: 500,
      data: { error: error.message },
      ok: false,
    };
  }
}

async function criarTokenAPI(beneficiarioId, loginToken) {
  try {
    // Verificar se já existe um token de API
    const { TokenApi } = models;

    let tokenApi = await TokenApi.findOne({
      where: { id_beneficiario: beneficiarioId, ativo: true },
    });

    if (!tokenApi) {
      console.log("Criando novo token de API via banco de dados...");
      tokenApi = await TokenApi.create({
        id_beneficiario: beneficiarioId,
        token: crypto.randomUUID(), // Usar UUID em vez de string hexadecimal
        ativo: true,
      });
    }

    return tokenApi.token;
  } catch (error) {
    console.error("Erro ao criar token de API:", error);
    throw error;
  }
}

async function testarAPIDevoluacao() {
  try {
    console.log("=== TESTE DA API DE DEVOLUÇÃO ===\n");

    // 1. Login para obter token
    console.log("1. Fazendo login para obter token...");
    const loginResponse = await callAPI("/beneficiarios/login", "POST", {
      email: EMAIL_TESTE,
      senha: SENHA_TESTE,
    });

    if (!loginResponse.ok) {
      console.error("Falha ao fazer login. Verifique as credenciais.");
      console.error(loginResponse.data);
      return;
    }

    const loginToken = loginResponse.data.token;
    console.log(`Token de login obtido: ${loginToken}\n`);

    // 2. Obter dados do beneficiário
    console.log("2. Obtendo dados do beneficiário...");
    const beneficiarioResponse = await callAPI(
      "/beneficiarios",
      "GET",
      null,
      loginToken
    );

    if (!beneficiarioResponse.ok) {
      console.error("Falha ao obter dados do beneficiário.");
      console.error(beneficiarioResponse.data);
      return;
    }

    const beneficiario = beneficiarioResponse.data;
    console.log(
      `Beneficiário: ${beneficiario.fantasia} (ID: ${beneficiario.id})\n`
    );

    // 3. Criar token de API (ou usar existente)
    console.log("3. Criando/verificando token de API...");
    const apiToken = await criarTokenAPI(beneficiario.id, loginToken);
    console.log(`Token de API: ${apiToken}\n`);

    // 4. Listar PIX existentes
    console.log("4. Listando transações PIX disponíveis...");
    const pixResponse = await callAPI("/pix", "GET", null, apiToken);

    if (!pixResponse.ok || !pixResponse.data.length) {
      console.error("Não foram encontrados PIXs ou ocorreu um erro.");

      // Criar um PIX via modelo (não temos endpoint para isso no teste)
      console.log("\nCriando um PIX de teste via banco de dados...");

      const { Pix } = models;
      const pixId = `TEST_${Date.now()}`;
      const pix = await Pix.create({
        id_beneficiario: beneficiario.id,
        valor: 100.0,
        status: "R", // R = Recebido/Pago - Status permitido para devolução
        data_cadastro: new Date(),
        cod_copia_cola: `00020101021226770014BR.GOV.BCB.PIX2555${pixId}520400005303986540510.005802BR5903Pix6008BRASILIA62070503***6304E2CA`,
        qrcode_base64:
          "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACA0lEQVRo3uyYUW6sMAyGXV/g/e9l9QQUp3H4k2YXtJq/C1Qa+PBn43QYDAY2m81ms9lsNpvNZrPZ/kfVISKcp/A4kZB6TeH6fMHDbMgTZEJcn7QAzUr4Lg8Pv4WiHpogAnR6FTbcVvDnwFIcrM9gPcf21lwHyAQJ4LWCp56J66NQCaiV6Ngvb/c15mTQL0tQzyl4kke4eSkHAJXQwu9M3pnjqtQfn4mA67k/xF1MO/5ntkidvJFvB83dlh8A6MAnH98NlN5uIQNU50dxjj8QzCOI738UBISrDvwBSY8/L7+ZA1w3PhMJqI5nSWJA7deiuDeglGu4PrM0QqoD9MszVcCR+3V7UdyaORxn77DpPYD0bFaAXW990b0wfzdALklPxwqwQ5QmwO6Q8R4AJt/t/wYgJOpBcm8OU6vvBBwNMnR+9z+6TgHTv9Wy/TmHeomY+sNJFhL9ZZjfAwDNbQk8Xzj6FtIBSh8Cc9zciSfVgOobPk5Z+BUwkXwOO6ksCTQgxjfsPYBSwVTbBgw/AD5VMDqWcmEEmDer2HsBuGFMulKB6G3rBtih9wFsmzUNSoU+EHvX47VrAEBvj9DVBtI/8hnCJWFV9IBj+YuRdR32AYtFxpRdd6A5uchz3BhwdL2vw0wpPsjAPYCVlWa3YWDDUdtav/fjT9Jms9lsNpvNZrPZbDabvwBx/hbWECHCsQAAAABJRU5ErkJggg==",
        id_integracao: pixId,
        cliente_nome: "Cliente Teste API",
        cliente_email: "cliente.api@teste.com",
        cliente_cpf_cnpj: "12345678900",
      });

      console.log(`PIX criado com ID: ${pix.id}, Valor: R$ ${pix.valor}\n`);

      // Usar este PIX para o teste
      var pixParaDevolver = {
        id: pix.id,
        valor: pix.valor,
      };
    } else {
      // Filtrar PIX com status permitidos para devolução (PAGA ou R)
      const pixPagos = pixResponse.data.filter(
        (p) => p.status === "PAGA" || p.status === "R"
      );

      if (pixPagos.length === 0) {
        console.error(
          "Não foram encontrados PIXs com status permitido para devolução (PAGA ou R)."
        );
        return;
      }

      // Usar o PIX mais recente
      var pixParaDevolver = pixPagos[0];
      console.log(
        `PIX selecionado: ID ${pixParaDevolver.id}, Valor: R$ ${pixParaDevolver.valor}\n`
      );
    }

    // 5. Solicitar devolução
    console.log("5. Solicitando devolução do PIX...");
    const valorDevolucao = parseFloat(pixParaDevolver.valor) / 2; // Devolver metade do valor

    const devolucaoResponse = await callAPI(
      "/devolucoes",
      "POST",
      {
        tipo_transacao: "PIX",
        id_transacao: pixParaDevolver.id,
        valor_devolucao: valorDevolucao,
        motivo: "Teste de API de devolução",
        observacao: "Criado pelo script de teste REST",
      },
      apiToken
    );

    if (!devolucaoResponse.ok) {
      console.error("Falha ao solicitar devolução:");
      // Exibir estrutura de erro com detalhes e mensagem
      console.error(JSON.stringify(devolucaoResponse.data, null, 2));

      // Verificar se o erro está no formato esperado
      if (devolucaoResponse.data.detalhes && devolucaoResponse.data.mensagem) {
        console.log(
          "\nFormato de erro correto detectado com campos: body, detalhes, mensagem"
        );
      } else {
        console.warn(
          "\nATENÇÃO: O formato de erro pode não estar seguindo o padrão requerido"
        );
      }
      return;
    }

    console.log("Devolução solicitada com sucesso:");
    console.log(JSON.stringify(devolucaoResponse.data, null, 2));

    const idDevolucao = devolucaoResponse.data.devolucao.id;

    // 6. Verificar status da devolução
    console.log("\n6. Verificando detalhes da devolução criada...");
    const detalhesResponse = await callAPI(
      `/devolucoes/${idDevolucao}`,
      "GET",
      null,
      apiToken
    );

    if (!detalhesResponse.ok) {
      console.error("Falha ao obter detalhes da devolução.");
      console.error(JSON.stringify(detalhesResponse.data, null, 2));
      return;
    }

    console.log("Detalhes da devolução:");
    console.log(JSON.stringify(detalhesResponse.data, null, 2));

    // 7. Listar todas as devoluções
    console.log("\n7. Listando todas as devoluções...");
    const listagemResponse = await callAPI(
      "/devolucoes",
      "GET",
      null,
      apiToken
    );

    if (!listagemResponse.ok) {
      console.error("Falha ao listar devoluções.");
      console.error(JSON.stringify(listagemResponse.data, null, 2));
      return;
    }

    console.log(`Total de devoluções: ${listagemResponse.data.length}`);

    // 8. Tentar atualizar a devolução
    console.log("\n8. Tentando atualizar a devolução para cancelar...");
    const atualizacaoResponse = await callAPI(
      `/devolucoes/${idDevolucao}`,
      "PUT",
      {
        status: "CANCELADA",
        observacao: "Cancelada pelo script de teste",
      },
      apiToken
    );

    if (!atualizacaoResponse.ok) {
      console.error("Falha ao atualizar devolução:");
      console.error(JSON.stringify(atualizacaoResponse.data, null, 2));
    } else {
      console.log("Devolução atualizada com sucesso:");
      console.log(JSON.stringify(atualizacaoResponse.data, null, 2));
    }

    console.log("\n=== TESTE DA API DE DEVOLUÇÃO CONCLUÍDO COM SUCESSO ===");
  } catch (error) {
    console.error("ERRO NO TESTE DA API:");
    console.error(error);
  }
}

// Antes de executar o teste, verificar se o servidor está rodando
console.log(
  "⚠️ IMPORTANTE: Certifique-se de que o servidor está rodando na porta 5000!"
);
console.log(
  'Se o servidor não estiver rodando, execute "node server.js" em outro terminal.\n'
);

setTimeout(() => {
  testarAPIDevoluacao()
    .then(() => {
      console.log("Script de teste da API finalizado");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erro fatal:", err);
      process.exit(1);
    });
}, 2000); // Aguardar 2 segundos antes de iniciar
