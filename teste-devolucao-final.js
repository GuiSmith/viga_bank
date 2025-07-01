/**
 * Teste final e completo de devolução - Criação e consulta direta
 * Este script demonstra o fluxo completo do sistema de devoluções
 */

import models from "./banco/models/index.js";
const { Beneficiario, TokenApi, Pix, Devolucao } = models;

// Função principal que testa todo o fluxo
async function testarFluxoCompletoDevoluções() {
  try {
    console.log("=== TESTE FINAL DE DEVOLUÇÃO ===\n");

    // 1. Obter um beneficiário
    console.log("1. Obtendo beneficiário de teste...");

    const beneficiario = await Beneficiario.findOne({
      where: { email: "ferrari@gabriel.com" },
    });

    if (!beneficiario) {
      throw new Error("Beneficiário de teste não encontrado!");
    }

    console.log(
      `Beneficiário: ${beneficiario.fantasia} (ID: ${beneficiario.id})\n`
    );

    // 2. Criar um PIX de teste com status 'R'
    console.log("2. Criando PIX de teste com status 'R'...");

    const pixId = `FINAL_${Date.now()}`;
    const pix = await Pix.create({
      id_beneficiario: beneficiario.id,
      valor: 150.0,
      status: "R", // Status 'R' = Recebido/Pago
      data_cadastro: new Date(),
      data_pagamento: new Date(),
      cod_copia_cola: `00020101021226770014BR.GOV.BCB.PIX2555${pixId}520400005303986540510.005802BR5903Pix6008BRASILIA62070503***6304E2CA`,
      qrcode_base64:
        "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACA0lEQVRo3uyYUW",
      id_integracao: pixId,
      cliente_nome: "Cliente Teste Final",
      cliente_email: "cliente.final@teste.com",
      cliente_cpf_cnpj: "12345678900",
    });

    console.log(
      `PIX criado com ID: ${pix.id}, Valor: R$ ${pix.valor}, Status: ${pix.status}\n`
    );

    // 3. Criar uma devolução diretamente no modelo
    console.log("3. Criando devolução...");

    const devolucao = await Devolucao.create({
      id_beneficiario: beneficiario.id,
      tipo_transacao: "PIX",
      id_transacao: pix.id,
      valor_original: pix.valor,
      valor_devolucao: 50.0, // Devolução parcial
      motivo: "Teste final de devolução",
      observacao: "Criado pelo script de teste final",
      status: "SOLICITADA",
      criado_por: `SCRIPT-${beneficiario.id}`,
    });

    console.log(`Devolução criada com sucesso! ID: ${devolucao.id}`);
    console.log(`Status inicial: ${devolucao.status}\n`);

    // 4. Simular o processamento da devolução
    console.log("4. Simulando processamento...");

    // Em processamento
    await devolucao.update({
      status: "EM_PROCESSAMENTO",
      data_processamento: new Date(),
    });

    console.log(`Status atualizado para: ${devolucao.status}`);

    // Aguardar 1 segundo para simular processamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Devolução concluída
    await devolucao.update({
      status: "CONCLUIDA",
      data_conclusao: new Date(),
      codigo_autorizacao: `AUTH_${Date.now()}`,
    });

    console.log(`Status final: ${devolucao.status}\n`);

    // 5. Buscar a devolução com todos os detalhes
    console.log("5. Detalhes completos da devolução:");

    const devolucaoCompleta = await Devolucao.findByPk(devolucao.id);

    console.log(
      JSON.stringify(devolucaoCompleta.get({ plain: true }), null, 2)
    );

    console.log("\n=== TESTE FINAL CONCLUÍDO COM SUCESSO ===");

    return {
      pix,
      devolucao: devolucaoCompleta,
    };
  } catch (error) {
    console.error("ERRO NO TESTE:", error);
    throw error;
  }
}

// Executar o teste
testarFluxoCompletoDevoluções()
  .then((resultado) => {
    console.log(
      `\nResumo: Devolução ${resultado.devolucao.id} para o PIX ${resultado.pix.id} concluída com sucesso!`
    );
    process.exit(0);
  })
  .catch((erro) => {
    console.error("Erro fatal:", erro);
    process.exit(1);
  });
