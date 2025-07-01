import models from "../banco/models/index.js";
import { Op } from "sequelize";

const Devolucao = models.Devolucao;
const Beneficiario = models.Beneficiario;
const Pix = models.Pix;
const Boleto = models.Boleto;
const CobrancaCartao = models.CobrancaCartao;

/**
 * Controller para gerenciamento de devoluções
 *
 * Regras de Negócio:
 * - Somente usuários com API Token podem solicitar devoluções
 * - O prazo máximo para solicitar uma devolução é de 7 dias corridos após a cobrança
 * - O prazo para processamento da devolução é de 24 horas
 */

// Listar devoluções com filtros
async function listar(req, res) {
  try {
    const { tipo_transacao, status, data_inicio, data_fim, id_transacao } =
      req.query;

    // Obtém o beneficiário autenticado
    const beneficiario = req.beneficiario;

    // Constrói as condições de filtro
    const where = { id_beneficiario: beneficiario.id };

    // Aplica filtros se fornecidos
    if (tipo_transacao) {
      where.tipo_transacao = tipo_transacao;
    }

    if (status) {
      where.status = status;
    }

    if (id_transacao) {
      where.id_transacao = id_transacao;
    }

    // Filtro por data
    if (data_inicio || data_fim) {
      where.data_solicitacao = {};

      if (data_inicio) {
        where.data_solicitacao[Op.gte] = new Date(data_inicio);
      }

      if (data_fim) {
        where.data_solicitacao[Op.lte] = new Date(data_fim);
      }
    }

    // Busca as devoluções com os filtros aplicados
    const devolucoes = await Devolucao.findAll({
      where,
      order: [["data_solicitacao", "DESC"]],
    });

    return res.status(200).json(devolucoes);
  } catch (error) {
    console.error("Erro ao listar devoluções:", error);
    return res.status(500).json({
      mensagem: "Erro interno, contate o suporte",
    });
  }
}

// Selecionar devolução por ID
async function selecionar(req, res) {
  try {
    const { id } = req.params;
    const beneficiario = req.beneficiario;

    const devolucao = await Devolucao.findOne({
      where: {
        id,
        id_beneficiario: beneficiario.id,
      },
      include: [
        {
          model: Beneficiario,
          as: "beneficiario",
          attributes: ["id", "razao", "fantasia", "cpf_cnpj", "email"],
        },
      ],
    });

    if (!devolucao) {
      return res.status(404).json({
        body: { id },
        detalhes: {
          id_devolucao: id,
          id_beneficiario: beneficiario.id,
        },
        mensagem:
          "Devolução não encontrada ou não pertence ao beneficiário autenticado",
      });
    }

    // Buscar detalhes da transação original com base no tipo
    let transacaoOriginal;
    switch (devolucao.tipo_transacao) {
      case "PIX":
        transacaoOriginal = await Pix.findByPk(devolucao.id_transacao);
        break;
      case "BOLETO":
        transacaoOriginal = await Boleto.findByPk(devolucao.id_transacao);
        break;
      case "CARTAO":
        transacaoOriginal = await CobrancaCartao.findByPk(
          devolucao.id_transacao
        );
        break;
    }

    // Retornar a devolução com os detalhes da transação original
    const resultado = devolucao.get({ plain: true });
    resultado.transacao_original = transacaoOriginal
      ? transacaoOriginal.get({ plain: true })
      : { mensagem: "Transação original não encontrada" };

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao selecionar devolução:", error);
    return res.status(500).json({
      mensagem: "Erro interno, contate o suporte",
    });
  }
}

// Criar uma nova solicitação de devolução
async function criar(req, res) {
  try {
    const beneficiario = req.beneficiario;
    const tipoToken = req.tipoToken || "login"; // Middleware auth define o tipo do token
    const {
      tipo_transacao,
      id_transacao,
      valor_devolucao,
      motivo,
      observacao,
    } = req.body;

    // Verifica se é um token de API
    // Somente usuários com token de API podem devolver o saldo de uma cobrança
    if (tipoToken !== "api") {
      return res.status(403).json({
        body: req.body,
        detalhes: {
          tipo_token_atual: tipoToken,
          tipo_token_necessario: "api",
        },
        mensagem: "Apenas usuários com token API podem solicitar devoluções",
      });
    }

    // Validações básicas dos campos obrigatórios
    const camposObrigatorios = [
      "tipo_transacao",
      "id_transacao",
      "valor_devolucao",
      "motivo",
    ];
    const camposFaltando = camposObrigatorios.filter(
      (campo) => !req.body[campo]
    );

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          campos_faltando: camposFaltando,
          campos_obrigatorios: camposObrigatorios,
        },
        mensagem: "Campos obrigatórios não informados",
      });
    }

    // Valida o tipo de transação
    const tiposValidos = ["PIX", "BOLETO", "CARTAO"];
    if (!tiposValidos.includes(tipo_transacao)) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          tipo_informado: tipo_transacao,
          tipos_validos: tiposValidos,
        },
        mensagem: "Tipo de transação inválido",
      });
    }

    // Busca a transação original para validar e obter o valor original
    let transacaoOriginal;
    switch (tipo_transacao) {
      case "PIX":
        transacaoOriginal = await Pix.findOne({
          where: { id: id_transacao, id_beneficiario: beneficiario.id },
        });
        break;
      case "BOLETO":
        transacaoOriginal = await Boleto.findOne({
          where: { id: id_transacao, id_beneficiario: beneficiario.id },
        });
        break;
      case "CARTAO":
        transacaoOriginal = await CobrancaCartao.findOne({
          where: { id: id_transacao, id_beneficiario: beneficiario.id },
        });
        break;
    }

    // Verifica se a transação existe e pertence ao beneficiário
    if (!transacaoOriginal) {
      return res.status(404).json({
        body: req.body,
        detalhes: {
          tipo_transacao: tipo_transacao,
          id_transacao: id_transacao,
          id_beneficiario: beneficiario.id,
        },
        mensagem: `${tipo_transacao} com ID ${id_transacao} não encontrado ou não pertence ao beneficiário`,
      });
    }

    // O status "R" (Recebido/Pago) para PIX SEMPRE é permitido para devolução.
    // Esta modificação aceita "R" diretamente para PIX, sem validações adicionais.
    if (tipo_transacao === "PIX" && transacaoOriginal.status === "R") {
      // PIX com status "R" é sempre permitido para devolução
      console.log("PIX com status R aceito para devolução");
    } else {
      // Para outros tipos ou outros status, verificamos os status permitidos
      const statusPermitidos = ["R", "PAGA", "CONCLUIDA", "APROVADA"];

      // Gambiarra para garantir que sempre funcione com trim e case insensitive
      const statusOriginal = String(transacaoOriginal.status).trim();
      const statusPermite = statusPermitidos.some(
        (s) => String(s).trim().toLowerCase() === statusOriginal.toLowerCase()
      );

      if (!statusPermite) {
        return res.status(400).json({
          body: req.body,
          detalhes: {
            status_atual: statusOriginal,
            status_permitidos: statusPermitidos,
            tipo_transacao: tipo_transacao,
          },
          mensagem: `ATUALIZADO: Esta transação está com status '${statusOriginal}' e não permite devolução. Status permitidos: ${statusPermitidos.join(
            ", "
          )}`,
        });
      }
    }

    // Verifica se o valor da devolução não excede o valor original
    const valorOriginal = parseFloat(transacaoOriginal.valor);
    const valorDevolucao = parseFloat(valor_devolucao);

    if (valorDevolucao <= 0) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          valor_informado: valorDevolucao,
        },
        mensagem: "O valor da devolução deve ser maior que zero",
      });
    }

    if (valorDevolucao > valorOriginal) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          valor_original: valorOriginal,
          valor_devolucao: valorDevolucao,
        },
        mensagem:
          "O valor da devolução não pode exceder o valor original da transação",
      });
    }

    // Verifica se já existe uma devolução para esta transação com status pendente
    const devolucaoExistente = await Devolucao.findOne({
      where: {
        tipo_transacao,
        id_transacao,
        status: {
          [Op.notIn]: ["CONCLUIDA", "REJEITADA", "CANCELADA"],
        },
      },
    });

    if (devolucaoExistente) {
      return res.status(409).json({
        body: req.body,
        detalhes: {
          id_devolucao: devolucaoExistente.id,
          status: devolucaoExistente.status,
          data_solicitacao: devolucaoExistente.data_solicitacao,
        },
        mensagem:
          "Já existe uma solicitação de devolução em andamento para esta transação",
      });
    }

    // Calcula a data estimada de processamento (24h)
    const dataProcessamentoEstimada = new Date();
    dataProcessamentoEstimada.setHours(
      dataProcessamentoEstimada.getHours() + 24
    );

    // Cria a nova solicitação de devolução
    const novaDevolucao = await Devolucao.create({
      id_beneficiario: beneficiario.id,
      tipo_transacao,
      id_transacao,
      valor_original: valorOriginal,
      valor_devolucao,
      motivo,
      observacao,
      status: "SOLICITADA",
      criado_por: `${beneficiario.id}-${beneficiario.email}`,
    });

    return res.status(201).json({
      mensagem: "Solicitação de devolução criada com sucesso",
      devolucao: novaDevolucao,
      processamento: {
        prazo_estimado: "24 horas",
        data_estimada: dataProcessamentoEstimada,
        nota: "As devoluções são processadas em até 24 horas após a solicitação",
      },
    });
  } catch (error) {
    console.error("Erro ao criar devolução:", error);
    return res.status(500).json({
      mensagem: "Erro interno, contate o suporte",
      erro: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Atualizar uma solicitação de devolução (apenas para status específicos)
async function alterar(req, res) {
  try {
    const { id } = req.params;
    const beneficiario = req.beneficiario;
    const { motivo, observacao, status } = req.body;

    // Busca a devolução para verificar se pertence ao beneficiário e o status atual
    const devolucao = await Devolucao.findOne({
      where: {
        id,
        id_beneficiario: beneficiario.id,
      },
    });

    if (!devolucao) {
      return res.status(404).json({
        body: req.body,
        detalhes: {
          id_devolucao: id,
          id_beneficiario: beneficiario.id,
        },
        mensagem:
          "Devolução não encontrada ou não pertence ao beneficiário autenticado",
      });
    }

    // Verifica se a devolução pode ser alterada (apenas status SOLICITADA)
    if (devolucao.status !== "SOLICITADA") {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          status_atual: devolucao.status,
          permitido_alterar: false,
          status_permitidos: ["SOLICITADA"],
        },
        mensagem: `Não é possível alterar uma devolução com status '${devolucao.status}'`,
      });
    }

    // Verifica o status fornecido (beneficiário só pode alterar para CANCELADA)
    if (status && status !== "CANCELADA") {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          status_fornecido: status,
          status_permitidos: ["CANCELADA"],
        },
        mensagem: "Beneficiário só pode alterar o status para CANCELADA",
      });
    }

    // Prepara os dados para atualização
    const dadosAtualizacao = {};

    if (motivo) dadosAtualizacao.motivo = motivo;
    if (observacao) dadosAtualizacao.observacao = observacao;

    // Se solicitou cancelamento, atualiza o status
    if (status === "CANCELADA") {
      dadosAtualizacao.status = "CANCELADA";
    }

    // Registra quem fez a alteração
    dadosAtualizacao.atualizado_por = `${beneficiario.id}-${beneficiario.email}`;

    // Atualiza a devolução
    await devolucao.update(dadosAtualizacao);

    return res.status(200).json({
      mensagem:
        status === "CANCELADA"
          ? "Solicitação de devolução cancelada com sucesso"
          : "Solicitação de devolução atualizada com sucesso",
      devolucao: await Devolucao.findByPk(id),
    });
  } catch (error) {
    console.error("Erro ao alterar devolução:", error);
    return res.status(500).json({
      mensagem: "Erro interno, contate o suporte",
      erro: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

export default { listar, selecionar, criar, alterar };
