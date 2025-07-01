/**
 * Teste simplificado da API de devolução
 * Este script testa apenas a criação e consulta de uma devolução
 */

import fetch from "node-fetch";
import crypto from "crypto";
import models from "./banco/models/index.js";
const { Beneficiario, TokenApi, Pix, Devolucao } = models;

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
  const response = await fetch(`${API_URL}${endpoint}`, options);

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    const text = await response.text();
    console.log(`Resposta não é JSON: ${text.substring(0, 200)}...`);
    responseData = { error: "Não é JSON", text: text.substring(0, 200) };
  }

  console.log(`Status: ${response.status}`);
  return {
    status: response.status,
    data: responseData,
    ok: response.ok,
  };
}

async function testarAPIDevoluacaoSimples() {
  try {
    console.log("=== TESTE SIMPLIFICADO DE DEVOLUÇÃO ===\n");

    // 1. Login para obter token
    console.log("1. Fazendo login para obter token...");
    const loginResponse = await callAPI("/beneficiarios/login", "POST", {
      email: EMAIL_TESTE,
      senha: SENHA_TESTE,
    });

    if (!loginResponse.ok) {
      console.error("Falha ao fazer login. Verifique as credenciais.");
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
      return;
    }

    const beneficiario = beneficiarioResponse.data;
    console.log(
      `Beneficiário: ${beneficiario.fantasia} (ID: ${beneficiario.id})\n`
    );

    // 3. Obter token de API
    console.log("3. Obtendo token de API do banco de dados...");

    let tokenApi = await TokenApi.findOne({
      where: { id_beneficiario: beneficiario.id, ativo: true },
    });

    if (!tokenApi) {
      console.log("Criando novo token de API...");
      tokenApi = await TokenApi.create({
        id_beneficiario: beneficiario.id,
        token: crypto.randomUUID(),
        ativo: true,
      });
    }

    const apiToken = tokenApi.token;
    console.log(`Token de API: ${apiToken}\n`);

    // 4. Criar PIX diretamente no banco
    console.log("4. Criando PIX diretamente no banco de dados...");

    const pixId = `TEST_${Date.now()}`;
    const pix = await Pix.create({
      id_beneficiario: beneficiario.id,
      valor: 100.0,
      status: "R", // Status R = Recebido/Pago
      data_cadastro: new Date(),
      data_pagamento: new Date(), // Importante para a validação de 7 dias
      cod_copia_cola: `00020101021226770014BR.GOV.BCB.PIX2555${pixId}520400005303986540510.005802BR5903Pix6008BRASILIA62070503***6304E2CA`,
      qrcode_base64:
        "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACA0lEQVRo3uyYUW6sMAyGXV",
      id_integracao: pixId,
      cliente_nome: "Cliente Teste API",
      cliente_email: "cliente.api@teste.com",
      cliente_cpf_cnpj: "12345678900",
    });

    console.log(`PIX criado com ID: ${pix.id}, Valor: R$ ${pix.valor}\n`);

    // 5. Solicitar devolução
    console.log("5. Solicitando devolução do PIX...");

    const devolucaoResponse = await callAPI(
      "/devolucoes",
      "POST",
      {
        tipo_transacao: "PIX",
        id_transacao: pix.id,
        valor_devolucao: 50.0, // Metade do valor
        motivo: "Teste simplificado de devolução",
        observacao: "Criado pelo script simplificado",
      },
      apiToken
    );

    if (!devolucaoResponse.ok) {
      console.error("Falha ao solicitar devolução:");
      console.error(JSON.stringify(devolucaoResponse.data, null, 2));

      // Atualizar o status do PIX se necessário
      if (devolucaoResponse.data?.detalhes?.status_atual) {
        console.log("\nAtualizando status do PIX para um valor permitido...");
        await pix.update({ status: "R" });
        console.log(`PIX atualizado para status: R (Recebido/Pago)`);

        // Tentar novamente
        console.log("\nTentando devolução novamente...");
        const novaTentativa = await callAPI(
          "/devolucoes",
          "POST",
          {
            tipo_transacao: "PIX",
            id_transacao: pix.id,
            valor_devolucao: 50.0,
            motivo: "Teste simplificado de devolução",
            observacao: "Criado pelo script simplificado - segunda tentativa",
          },
          apiToken
        );

        if (!novaTentativa.ok) {
          console.error("Falha novamente ao solicitar devolução:");
          console.error(JSON.stringify(novaTentativa.data, null, 2));
          return;
        } else {
          console.log("Devolução solicitada com sucesso na segunda tentativa!");
          console.log(JSON.stringify(novaTentativa.data, null, 2));
          return;
        }
      }

      return;
    }

    console.log("Devolução solicitada com sucesso!");
    console.log(JSON.stringify(devolucaoResponse.data, null, 2));
  } catch (error) {
    console.error("ERRO NO TESTE SIMPLIFICADO:");
    console.error(error);
  }
}

// Verificar se o servidor está rodando
console.log("⚠️ Certifique-se de que o servidor está rodando na porta 5000!\n");

setTimeout(() => {
  testarAPIDevoluacaoSimples()
    .then(() => {
      console.log("\n=== TESTE SIMPLIFICADO CONCLUÍDO ===");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Erro fatal:", err);
      process.exit(1);
    });
}, 1000);
