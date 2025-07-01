// Modelos
import BoletoModel from '../banco/models/boletoModel.js';
import CidadeModel from '../banco/models/cidadeModel.js';
import ParcelamentoModel from '../banco/models/parcelamentoModel.js';

// Serviços
import serasaService from '../services/mockSerasaService.js';
import boletoService from '../services/mockBoletoService.js';

// Outros
import banco from '../banco/banco.js';

const criar = async (req, res) => {

    try {

        // Campos obrigatórios conforme o modelo
        const dadosObrigatorios = [
            'valor_total',
            'data_vencimento',
            'especie',
            'observacoes',
            'razao_social_pagador',
            'cpf_cnpj_pagador',
            'endereco_pagador_id_cidade',
            'endereco_beneficiario_id_cidade',
            'quantidade_parcelas',
            "endereco_beneficiario_rua",
            "endereco_beneficiario_numero",
            "endereco_beneficiario_complemento",
            "endereco_beneficiario_bairro",
            "endereco_beneficiario_cep",
            "endereco_pagador_rua",
            "endereco_pagador_numero",
            "endereco_pagador_complemento",
            "endereco_pagador_bairro",
            "endereco_pagador_cep"
        ];

        const body = req.body || {};
        const dadosFaltantes = dadosObrigatorios.filter(campo => !body[campo] && body[campo] !== 0);
        const dadosExtras = Object.keys(body).filter(
            campo => !dadosObrigatorios.includes(campo)
        );

        if (dadosFaltantes.length > 0 || dadosExtras.length > 0) {
            return res.status(400).json({
                mensagem: 'Informe os dados obrigatórios',
                body,
                detalhes: {
                    dadosObrigatorios,
                    dadosFaltantes,
                    dadosExtras
                }
            });
        }

        // Validação de dados do body

        // Validar se valor é decimal 0.00 e maior que zero
        const valor = Number(body.valor_total);
        if (isNaN(valor) || valor <= 0 || !/^\d+(\.\d{1,2})?$/.test(valor.toFixed(2))) {
            return res.status(400).json({
                mensagem: 'O campo valor deve ser um número decimal maior que zero, no formato 0.00',
                body
            });
        }

        // Validar se data_vencimento é no formato yyyy-mm-dd e é pelo menos amanhã
        const dataVencimento = body.data_vencimento;
        const regexData = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexData.test(dataVencimento)) {
            return res.status(400).json({
                mensagem: 'O campo data_vencimento deve estar no formato yyyy-mm-dd',
                body
            });
        }
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataVenc = new Date(dataVencimento + 'T00:00:00');
        const amanha = new Date(hoje.setDate(hoje.getDate() + 1));
        if (dataVenc < amanha) {
            return res.status(400).json({
                mensagem: 'O campo data_vencimento deve ser pelo menos amanhã',
                body
            });
        }

        // criar um array chamado observacoes usando split com ponto e vírgula no body.observacoes
        const observacoes = typeof body.observacoes === 'string'
            ? body.observacoes.split(';').map(obs => obs.trim()).filter(obs => obs.length > 0)
            : [];
        // Verificar se cidade de endereco_pagador_id_cidade existe, usando a model CidadeModel.js
        const cidade = await CidadeModel.findByPk(body.endereco_pagador_id_cidade);
        if (!cidade) {
            return res.status(400).json({
                mensagem: 'Cidade informada em endereco_pagador_id_cidade não encontrada',
                body
            });
        }

        // Monta o objeto bodyBeneficiario a partir de req.beneficiario e req.body
        const beneficiario = req.beneficiario || {};

        const bodyBeneficiario = {
            razao_social_beneficiario: beneficiario.razao,
            cpf_cnpj_beneficiario: beneficiario.cpf_cnpj,
            banco_emissor: beneficiario.nome_banco,
            cod_banco: beneficiario.codigo_banco,
            agencia: beneficiario.agencia,
            numero_conta: beneficiario.numero_conta,
            convenio: beneficiario.convenio,
            id_beneficiario: beneficiario.id,
        };

        // Se o id da cidade do beneficiário for igual ao do pagador, já está validado
        if (body.endereco_beneficiario_id_cidade !== cidade.id) {
            // Se for diferente, buscar no banco
            const cidadeBeneficiario = await CidadeModel.findByPk(body.endereco_beneficiario_id_cidade);
            if (!cidadeBeneficiario) {
                return res.status(400).json({
                    mensagem: 'Cidade informada em endereco_beneficiario_id_cidade não encontrada! ',
                    body
                });
            }
        }

        // Se quantidade_parcelas for maior que 0, consulta o nome no Serasa
        if (body.quantidade_parcelas > 1) {
            const serasaResult = serasaService.consultarNome(body.cpf_cnpj_pagador);
            if (!serasaResult.ok) {
                return res.status(serasaResult.statusHttp || 500).json({
                    mensagem: serasaResult.mensagem || 'Erro ao consultar Serasa, contate o suporte da Viga Bank',
                    detalhes: serasaResult.data || {},
                    body
                });
            }

            if (serasaResult.data.score < 650) {
                return res.status(422).json({
                    mensagem: 'O pagador não passou na análise de crédito para parcelar compras no boleto.',
                    detalhes: {
                        score: serasaResult.data.score,
                        parecer: serasaResult.data.parecer || null
                    },
                    body
                });
            }
        }

        const resultado = await banco.transaction(async (t) => {
            // Cria o registro de parcelamento
            let parcelamento = null;
            if (body.quantidade_parcelas > 1) {
                parcelamento = await ParcelamentoModel.create({
                    id_beneficiario: bodyBeneficiario.id_beneficiario,
                    valor_total: valor,
                    valor_parcela: Number((valor / body.quantidade_parcelas).toFixed(2)),
                    numero_parcelas: body.quantidade_parcelas,
                }, { transaction: t });
            }

            let boletos = [];

            for (let index = 0; index < body.quantidade_parcelas; index++) {

                const boletoServiceResponse = boletoService.gerarBoleto();
                const { nosso_numero, link } = boletoServiceResponse.data;

                // Cria o registro de boleto
                const boleto = await BoletoModel.create({
                    nosso_numero,
                    link,
                    valor: parcelamento ? parcelamento.valor_parcela : valor,
                    data_vencimento: dataVencimento,
                    especie: body.especie,
                    observacoes: observacoes,
                    razao_social_pagador: body.razao_social_pagador,
                    cpf_cnpj_pagador: body.cpf_cnpj_pagador,
                    endereco_pagador_id_cidade: body.endereco_pagador_id_cidade,
                    endereco_beneficiario_id_cidade: body.endereco_beneficiario_id_cidade,
                    id_parcelamento: parcelamento ? parcelamento.id : null,
                    endereco_beneficiario_rua: body.endereco_beneficiario_rua,
                    endereco_beneficiario_numero: body.endereco_beneficiario_numero,
                    endereco_beneficiario_complemento: body.endereco_beneficiario_complemento,
                    endereco_beneficiario_bairro: body.endereco_beneficiario_bairro,
                    endereco_beneficiario_cep: body.endereco_beneficiario_cep,
                    endereco_pagador_rua: body.endereco_pagador_rua,
                    endereco_pagador_numero: body.endereco_pagador_numero,
                    endereco_pagador_complemento: body.endereco_pagador_complemento,
                    endereco_pagador_bairro: body.endereco_pagador_bairro,
                    endereco_pagador_cep: body.endereco_pagador_cep,
                    ...bodyBeneficiario
                }, { transaction: t });
                boletos.push(boleto);
            }

            return { parcelamento, boletos };
        });

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Erro ao gerar boleto:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao criar boleto, contate o suporte' });
    }
};

const listar = async (req, res) => {
    try {

        const boletos = await BoletoModel.findAll({
            where: { id_beneficiario: req.beneficiario.id }
        });

        if (!boletos || boletos.length === 0) {
            return res.status(204).send();
        }

        res.status(200).json(boletos);
    } catch (error) {
        console.error('Erro ao listar boletos:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao listar boletos, contate o suporte' });
    }
};

const selecionar = async (req, res) => {
    try {
        if(!req.params.id){
            return res.status(400).json({ mensagem: 'ID do boleto não informado' });
        }

        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ mensagem: 'ID do boleto deve ser um número' });
        }

        const boleto = await BoletoModel.findOne({
            where: {
                id,
                id_beneficiario: req.beneficiario.id
            }
        });

        if (!boleto) {
            return res.status(404).json({ mensagem: 'Boleto não encontrado' });
        }

        res.status(200).json(boleto);
    } catch (error) {
        console.error('Erro ao selecionar boleto:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao buscar boleto, contate o suporte' });
    }
};

const cancelar = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ mensagem: 'ID do boleto não informado' });
        }

        const { id } = req.params;

        if (isNaN(Number(id))) {
            return res.status(400).json({ mensagem: 'ID do boleto deve ser um número' });
        }

        const boleto = await BoletoModel.findOne({
            where: {
                id,
                id_beneficiario: req.beneficiario.id
            }
        });

        if (!boleto) {
            return res.status(404).json({ mensagem: 'Boleto não encontrado' });
        }

        boleto.dataValues.status = 'C';
        await boleto.save();

        res.status(200).json(boleto);
    } catch (error) {
        console.error('Erro ao cancelar boleto:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao cancelar boleto, contate o suporte' });
    }
};

export default { criar, listar, selecionar, cancelar };