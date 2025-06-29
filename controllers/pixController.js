// Importação de Módulos
import PixModel from '../models/pixModel.js';

// Importação de Serviços
import abacatePayService from '../services/abacatePayService.js';

const gerar = async (req, res) => {
    try {
        const dadosObrigatorios = ['valor_decimal', 'cliente_nome', 'cliente_email', 'cliente_cpf_cnpj'];
        const dados = req.body || {};
        const dadosFaltantes = dadosObrigatorios.filter(dadoObrigatorio => !dados[dadoObrigatorio]);

        if (dadosFaltantes.length > 0) {
            return res.status(400).json({
                body: req.body,
                detalhes: {
                    obrigatorios: dadosObrigatorios
                },
                mensagem: `Dados obrigatórios não informados`
            });
        }

        const pixResponse = await abacatePayService.gerarPix(dados);

        // Erro literal
        if (pixResponse.error) {
            throw new Error("Erro ao gerar PIX");
        }

        // Não é erro, mas não foi possível gerar PIX
        if (!pixResponse.error && !pixResponse.ok) {
            return res.status(400).json({
                body: req.body,
                detalhes: {},
                mensagem: pixResponse.mensagem
            })
        }

        const dadosPix = pixResponse.data;

        // PIX gerado com sucesso
        const novoPix = await PixModel.create({
            valor: (dadosPix.amount / 100),
            cod_copia_cola: dadosPix.brCode,
            qrcode_base64: dadosPix.brCodeBase64,
            id_beneficiario: req.beneficiario.id,
            id_integracao: dadosPix.id,
            cliente_nome: dados.cliente_nome,
            cliente_email: dados.cliente_email,
            cliente_cpf_cnpj: dados.cliente_cpf_cnpj
        });

        return res.status(201).json(novoPix);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: 'Erro interno, contate o suporte'
        });
    }
}

const selecionar = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ mensagem: `Informe o ID do PIX` });
        }
        const { id } = req.params;

        // Verificar se ID é número
        if (isNaN(id)) {
            return res.status(400).json({ mensagem: `ID do PIX inválido` });
        }

        const pix = await PixModel.findByPk(id);

        if (!pix) {
            return res.status(404).json({ mensagem: `PIX não encontrado` });
        }

        const pixResponse = await abacatePayService.selecionarPix(pix.id_integracao);

        const integracao = {};

        if (pixResponse.error) {
            integracao.ok = false;
            integracao.mensagem = 'Erro ao buscar dados do PIX na integração';
        }

        if (!pixResponse.error && !pixResponse.ok) {
            integracao.ok = false;
            integracao.mensagem = pixResponse.mensagem;
        }

        if (pixResponse.ok) {
            integracao.ok = true;
            if (pixResponse.data.status == 'PAID') {
                integracao.mensagem = 'PIX pago';
                pix.status = 'R';
                pix.save();
            } else {
                integracao.menasgem = 'Dados PIX selecionados com sucesso';
            }
        }

        return res.status(200).json({
            ...pix.dataValues,
            integracao
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: 'Erro interno, contate o suporte'
        });
    }
};

const simularPagamento = async (req, res) => {
    try {
        if(!req.params.id) {
            return res.status(400).json({ mensagem: 'Informe o ID do PIX' });
        }
        
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ mensagem: 'Informe o ID do PIX' });
        }

        // Verificar se ID é número
        if (isNaN(id)) {
            return res.status(400).json({ mensagem: 'ID do PIX inválido' });
        }

        const pix = await PixModel.findByPk(id);

        if (!pix) {
            return res.status(404).json({ mensagem: 'PIX não encontrado' });
        }

        const pixResponse = await abacatePayService.simularPagamentoPix(pix.id_integracao);

        if (pixResponse.error) {
            throw new Error("Erro ao simular pagamento do PIX");
        }

        if (!pixResponse.ok) {
            return res.status(400).json({ mensagem: pixResponse.mensagem });
        }

        pix.status = 'R'; // Simulando pagamento
        await pix.save();

        return res.status(200).json({ mensagem: 'Pagamento simulado com sucesso', pix });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensagem: 'Erro interno, contate o suporte' });
    }
}

export default { gerar, selecionar, simularPagamento };