import tokenApiModel from '../models/tokenApiModel.js';

async function listar(req, res) {
    try {
        const tokens = await tokenApiModel.findAll(
            {where: { id_beneficiario: req.beneficiario.id }}
        );
        if (tokens.length === 0) {
            return res.status(204).send();
        } else {
            return res.status(200).json(tokens);
        }
    } catch (error) {
        console.error('Erro ao listar tokens de API:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

async function selecionar (req, res) {
    try {
        const idToken = req.params.id || undefined;
        const beneficiario = req.beneficiario;
        if(!idToken){
            return res.status(400).json({ mensagem: 'ID do token não informado' });
        }

        const token = await tokenApiModel.findOne({
            where: { id: idToken, id_beneficiario: beneficiario.id }
        });

        if (!token) {
            return res.status(404).json({ mensagem: 'Token não encontrado' });
        }

        return res.status(200).json(token);
    } catch(error) {
        console.error('Erro ao selecionar token de API:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

export default { listar, selecionar };