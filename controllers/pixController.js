// Importação de modelos
import PixModel from '../models/pixModel.js';

// Importação de Serviços
import abacatePayService from '../services/abacatePayService.js';

const gerar = async (req, res) => {
    try {
        const dadosObrigatorios = ['valor_decimal','cliente_nome','cliente_email','cliente_cpf_cnpj'];
        const dados = req.body || {};
        const dadosFaltantes = dadosObrigatorios.filter(dadoObrigatorio => !dados[dadoObrigatorio]);

        if(dadosFaltantes.length > 0){
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
        if(pixResponse.error){
            throw new Error("Erro ao gerar PIX");
        }

        // Não é erro, mas não foi possível gerar PIX
        if(!pixResponse.error && !pixResponse.ok){
            return res.status(400).json({
                body: req.body,
                detalhes: {},
                mensagem: pixResponse.mensagem
            })
        }

        const dadosPix = pixResponse.data;

        // PIX gerado com sucesso
        const novoPix = await PixModel.create({
            valor: dadosPix.amount,
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

export default { gerar };