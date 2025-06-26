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

export default { listar, };