/**
 * Validação de solicitações de devolução
 *
 * Aplicado como hook no modelo de Devolucao, realiza as seguintes verificações:
 * 1. Existência da transação referenciada (PIX, boleto ou cartão)
 * 2. Propriedade da transação (mesma conta do beneficiário)
 * 3. Status da transação (somente PAGA, CONCLUIDA ou APROVADA)
 * 4. Prazo máximo de 7 dias corridos após a data da cobrança
 * 5. Valor da devolução não maior que o valor original
 */

import PixModel from "../banco/models/pixModel.js";
import BoletoModel from "../banco/models/boletoModel.js";
import CobrancaCartaoModel from "../banco/models/cobrancaCartaoModel.js";

async function devolucaoValidacaoHook(devolucao) {
  // Validação para garantir que valor_devolucao não exceda valor_original
  if (
    parseFloat(devolucao.valor_devolucao) > parseFloat(devolucao.valor_original)
  ) {
    throw new Error(
      "O valor da devolução não pode exceder o valor original da transação"
    );
  }

  // Validação do id_transacao com base no tipo_transacao
  await validarTransacaoExistente(devolucao);
}

// Função auxiliar para validar se a transação referenciada existe
async function validarTransacaoExistente(devolucao) {
  let transacao;

  switch (devolucao.tipo_transacao) {
    case "PIX":
      transacao = await PixModel.findByPk(devolucao.id_transacao);
      break;
    case "BOLETO":
      transacao = await BoletoModel.findByPk(devolucao.id_transacao);
      break;
    case "CARTAO":
      transacao = await CobrancaCartaoModel.findByPk(devolucao.id_transacao);
      break;
    default:
      throw new Error("Tipo de transação inválido");
  }

  if (!transacao) {
    throw new Error(
      `Transação ${devolucao.tipo_transacao} com ID ${devolucao.id_transacao} não encontrada`
    );
  }

  // Verifica se a transação pertence ao mesmo beneficiário
  if (transacao.id_beneficiario !== devolucao.id_beneficiario) {
    throw new Error("A transação não pertence ao beneficiário informado");
  }

  // Verifica se a transação está em um status que permite devolução
  // Para PIX: R (Recebido/Pago)
  // Para outros tipos: PAGA, CONCLUIDA ou APROVADA
  const statusPermitidos = ["R", "PAGA", "CONCLUIDA", "APROVADA"];

  // Garantir que o status seja tratado como string antes de comparar
  const statusAtual = String(transacao.status).trim();
  const statusPermite = statusPermitidos.some(
    (s) => String(s).trim().toLowerCase() === statusAtual.toLowerCase()
  );

  if (!statusPermite) {
    throw new Error(
      `Esta transação está com status '${transacao.status}' e não permite devolução`
    );
  }

  // Validação do prazo de 7 dias corridos para solicitação de devolução
  const dataTransacao = new Date(
    transacao.data_pagamento ||
      transacao.data_criacao ||
      transacao.data_aprovacao
  );
  const dataAtual = new Date();
  const diferencaDias = Math.floor(
    (dataAtual - dataTransacao) / (1000 * 60 * 60 * 24)
  );

  if (diferencaDias > 7) {
    throw new Error(
      "O prazo para solicitar a devolução é de no máximo 7 dias corridos após o dia da cobrança"
    );
  }
}

export default devolucaoValidacaoHook;
