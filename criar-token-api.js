/**
 * Gerador de token de API para testes de devolução
 *
 * Este script encontra ou cria um token de API válido para
 * o usuário de teste, necessário para as operações de devolução.
 *
 * Uso: node criar-token-api.js
 */

import models from "./banco/models/index.js";
import crypto from "crypto";

async function criarTokenAPI() {
  try {
    const { TokenApi, Beneficiario } = models;

    // Encontrar o beneficiário
    const beneficiario = await Beneficiario.findOne({
      where: { email: "ferrari@gabriel.com" },
    });

    if (!beneficiario) {
      console.error("Beneficiário não encontrado!");
      return;
    }

    // Verificar se já existe um token de API
    let tokenApi = await TokenApi.findOne({
      where: { id_beneficiario: beneficiario.id, ativo: true },
    });

    if (tokenApi) {
      console.log("Token API já existe:", tokenApi.token);
      return tokenApi;
    }

    // Criar novo token
    tokenApi = await TokenApi.create({
      id_beneficiario: beneficiario.id,
      token: crypto.randomBytes(32).toString("hex"),
      ativo: true,
    });

    console.log("Token API criado com sucesso:", tokenApi.token);
    return tokenApi;
  } catch (error) {
    console.error("Erro ao criar token API:", error);
  }
}

criarTokenAPI()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
