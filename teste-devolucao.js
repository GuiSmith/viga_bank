/**
 * Teste de fluxo completo do sistema de devoluções
 *
 * Este script simula o processo completo de devoluções, desde
 * a preparação do ambiente até o processamento da solicitação:
 *
 * 1. Cria ou reutiliza um beneficiário de teste
 * 2. Configura um token de API válido
 * 3. Cria uma transação PIX de teste
 * 4. Marca a transação como PAGA
 * 5. Solicita a devolução do valor
 * 6. Simula o processamento da devolução
 *
 * Execução: node teste-devolucao.js
 */

import models from "./banco/models/index.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

const { Beneficiario, TokenApi, Pix, Devolucao } = models;

// Função auxiliar para gerar um token aleatório
function gerarToken(tamanho = 32) {
  return crypto.randomBytes(tamanho).toString("hex");
}

async function testarFluxoDevolucao() {
  try {
    console.log("=== TESTE DE FLUXO DE DEVOLUÇÃO ===");

    // 1. Verificar/criar um beneficiário de teste
    console.log("\n1. Criando/verificando beneficiário de teste...");

    const emailTeste = "teste-devolucao@example.com";

    let beneficiario = await Beneficiario.findOne({
      where: { email: emailTeste },
    });

    if (!beneficiario) {
      console.log("Criando novo beneficiário de teste...");
      beneficiario = await Beneficiario.create({
        razao: "Empresa Teste Devolução",
        fantasia: "Teste Devolução",
        cpf_cnpj: Math.floor(
          10000000000000 + Math.random() * 90000000000000
        ).toString(),
        codigo_banco: 123,
        nome_banco: "Banco Teste",
        agencia: "1234",
        numero_conta: "123456",
        convenio: "12345",
        email: emailTeste,
        senha: await bcrypt.hash("senha123", 10),
      });
      console.log(`Beneficiário criado com ID: ${beneficiario.id}`);
    } else {
      console.log(`Beneficiário encontrado com ID: ${beneficiario.id}`);
    }

    // 2. Criar token de API (ou verificar se já existe)
    console.log("\n2. Criando/verificando token de API...");

    let tokenApi = await TokenApi.findOne({
      where: { id_beneficiario: beneficiario.id, ativo: true },
    });

    if (!tokenApi) {
      console.log("Criando novo token de API...");
      tokenApi = await TokenApi.create({
        id_beneficiario: beneficiario.id,
        token: gerarToken(),
        ativo: true,
      });
      console.log(`Token de API criado: ${tokenApi.token}`);
    } else {
      console.log(`Token de API encontrado: ${tokenApi.token}`);
    }

    // 3. Criar uma transação PIX
    console.log("\n3. Criando transação PIX de teste...");

    const valorTransacao = 100.0; // R$ 100,00

    const pixId = `TEST_${Date.now()}`;
    const pix = await Pix.create({
      id_beneficiario: beneficiario.id,
      valor: valorTransacao,
      status: "A", // A = A receber
      data_cadastro: new Date(),
      cod_copia_cola: `00020101021226770014BR.GOV.BCB.PIX2555${pixId}520400005303986540510.005802BR5903Pix6008BRASILIA62070503***6304E2CA`,
      qrcode_base64:
        "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACA0lEQVRo3uyYUW6sMAyGXV/g/e9l9QQUp3H4k2YXtJq/C1Qa+PBn43QYDAY2m81ms9lsNpvNZrPZ/kfVISKcp/A4kZB6TeH6fMHDbMgTZEJcn7QAzUr4Lg8Pv4WiHpogAnR6FTbcVvDnwFIcrM9gPcf21lwHyAQJ4LWCp56J66NQCaiV6Ngvb/c15mTQL0tQzyl4kke4eSkHAJXQwu9M3pnjqtQfn4mA67k/xF1MO/5ntkidvJFvB83dlh8A6MAnH98NlN5uIQNU50dxjj8QzCOI738UBISrDvwBSY8/L7+ZA1w3PhMJqI5nSWJA7deiuDeglGu4PrM0QqoD9MszVcCR+3V7UdyaORxn77DpPYD0bFaAXW990b0wfzdALklPxwqwQ5QmwO6Q8R4AJt/t/wYgJOpBcm8OU6vvBBwNMnR+9z+6TgHTv9Wy/TmHeomY+sNJFhL9ZZjfAwDNbQk8Xzj6FtIBSh8Cc9zciSfVgOobPk5Z+BUwkXwOO6ksCTQgxjfsPYBSwVTbBgw/AD5VMDqWcmEEmDer2HsBuGFMulKB6G3rBtih9wFsmzUNSoU+EHvX47VrAEBvj9DVBtI/8hnCJWFV9IBj+YuRdR32AYtFxpRdd6A5uchz3BhwdL2vw0wpPsjAPYCVlWa3YWDDUdtav/fjT9Jms9lsNpvNZrPZbDabvwBx/hbWECHCsQAAAABJRU5ErkJggg==",
      id_integracao: pixId,
      cliente_nome: "Cliente Teste",
      cliente_email: "cliente@teste.com",
      cliente_cpf_cnpj: "12345678900",
    });

    console.log(`PIX criado com ID: ${pix.id}, Valor: R$ ${pix.valor}`);

    // 4. Atualizar status do PIX para R (recebido/pago)
    console.log("\n4. Atualizando status do PIX para R (recebido/pago)...");

    // Atualiza o status para 'R' (Recebido/Pago)
    await pix.update({
      status: "R",
      data_pagamento: new Date(),
    });

    console.log(`PIX ${pix.id} agora está com status: ${pix.status}`);

    // 5. Criar uma solicitação de devolução
    console.log("\n5. Criando solicitação de devolução...");

    const valorDevolucao = 50.0; // Devolver R$ 50,00 (metade do valor)

    try {
      const devolucao = await Devolucao.create({
        id_beneficiario: beneficiario.id,
        tipo_transacao: "PIX",
        id_transacao: pix.id,
        valor_original: pix.valor,
        valor_devolucao: valorDevolucao,
        motivo: "Teste de devolução parcial",
        observacao: "Criado pelo script de teste",
        status: "SOLICITADA",
        criado_por: `SCRIPT-${beneficiario.id}`,
      });

      console.log(`Devolução criada com sucesso! ID: ${devolucao.id}`);
      console.log(`Status: ${devolucao.status}`);
      console.log(`Valor a devolver: R$ ${devolucao.valor_devolucao}`);

      // 6. Simular o processamento (normalmente seria feito por um serviço externo)
      console.log("\n6. Simulando processamento da devolução...");

      await devolucao.update({
        status: "EM_PROCESSAMENTO",
        data_processamento: new Date(),
      });

      console.log(`Devolução ${devolucao.id} agora está ${devolucao.status}`);

      // Aguardar 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Finalizar o processamento
      await devolucao.update({
        status: "CONCLUIDA",
        data_conclusao: new Date(),
        codigo_autorizacao: `AUTH_${Date.now()}`,
      });

      console.log(`Devolução ${devolucao.id} agora está ${devolucao.status}`);

      // 7. Buscar e exibir os detalhes finais
      console.log("\n7. Detalhes finais da devolução:");

      const devolucaoAtualizada = await Devolucao.findByPk(devolucao.id);
      console.log(
        JSON.stringify(devolucaoAtualizada.get({ plain: true }), null, 2)
      );

      console.log("\n=== TESTE CONCLUÍDO COM SUCESSO ===");
    } catch (error) {
      console.error("\nERRO AO CRIAR DEVOLUÇÃO:");
      console.error(error.message);

      if (error.message.includes("7 dias")) {
        console.log("\nTentando criar uma nova transação com data recente...");

        // Criar um novo PIX com data mais recente
        const pixNovo = await Pix.create({
          id_beneficiario: beneficiario.id,
          chave: beneficiario.email,
          valor: valorTransacao,
          status: "PAGA",
          txid: `TEST_${Date.now()}`,
          data_criacao: new Date(),
          data_pagamento: new Date(),
          status_consulta: "PAGA",
        });

        console.log(`Novo PIX criado com ID: ${pixNovo.id}, data atual`);

        const devolucaoNova = await Devolucao.create({
          id_beneficiario: beneficiario.id,
          tipo_transacao: "PIX",
          id_transacao: pixNovo.id,
          valor_original: pixNovo.valor,
          valor_devolucao: valorDevolucao,
          motivo: "Teste de devolução parcial",
          observacao: "Criado pelo script de teste",
          status: "SOLICITADA",
          criado_por: `SCRIPT-${beneficiario.id}`,
        });

        console.log(
          `Nova devolução criada com sucesso! ID: ${devolucaoNova.id}`
        );
      }
    }
  } catch (error) {
    console.error("ERRO NO TESTE:");
    console.error(error);
  }
}

// Executar o teste
testarFluxoDevolucao()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
