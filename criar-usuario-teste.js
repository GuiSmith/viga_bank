/**
 * Script para criar um usuário de teste para as devoluções
 *
 * Este script verifica se o usuário já existe e, caso contrário,
 * cria um novo usuário com todas as informações necessárias.
 *
 * Uso: node criar-usuario-teste.js
 */

import models from "./banco/models/index.js";
import bcrypt from "bcrypt";

async function criarUsuarioTeste() {
  try {
    const { Beneficiario } = models;

    // Verificar se usuário já existe
    let beneficiario = await Beneficiario.findOne({
      where: { email: "ferrari@gabriel.com" },
    });

    if (beneficiario) {
      console.log("Usuário já existe:", beneficiario.id);
      return beneficiario;
    }

    // Criar novo usuário
    beneficiario = await Beneficiario.create({
      razao: "Gabriel Ferrari",
      fantasia: "Ferrari",
      cpf_cnpj: "12345678901",
      codigo_banco: "001",
      nome_banco: "Banco do Brasil",
      agencia: "1234",
      numero_conta: "123456",
      convenio: "12345",
      email: "ferrari@gabriel.com",
      senha: await bcrypt.hash("senha123", 10),
    });

    console.log("Usuário criado com sucesso! ID:", beneficiario.id);
    return beneficiario;
  } catch (error) {
    console.error("Erro ao criar usuário de teste:", error);
  }
}

criarUsuarioTeste()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
