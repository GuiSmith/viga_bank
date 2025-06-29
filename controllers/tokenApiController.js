import tokenApiModel from '../banco/models/tokenApiModel.js';

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

        // Checando se ID passado é número
        if (isNaN(idToken)) {
            return res.status(400).json({ mensagem: 'ID do token deve ser um número' });

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

// Criar token, recebendo apenas o id beneficiario no body
async function criar (req, res) {
    try {

        const novoToken = await tokenApiModel.create({ id_beneficiario: req.beneficiario.id });

        return res.status(201).json(novoToken);
    } catch (error) {
        console.error('Erro ao criar token de API:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

// Inativar token, recebendo apenas o id no params
async function inativar(req, res) {
    try {
        const idToken = req.params.id || undefined;
        const beneficiario = req.beneficiario;

        if (!idToken) {
            return res.status(400).json({ mensagem: 'ID do token não informado' });
        }

        const token = await tokenApiModel.findOne({
            where: { id: idToken, id_beneficiario: beneficiario.id }
        });

        if (!token) {
            return res.status(404).json({ mensagem: 'Token não encontrado' });
        }

        token.ativo = false;
        await token.save();

        return res.status(200).json({ mensagem: 'Token inativado com sucesso' });
    } catch (error) {
        console.error('Erro ao inativar token de API:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

export default { listar, selecionar, criar, inativar };