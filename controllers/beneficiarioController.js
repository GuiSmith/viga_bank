import Beneficiario from '../models/beneficiarioModel.js';

// Lista todos os beneficiários
async function listar(req, res) {
    try {
        const beneficiarios = await Beneficiario.findAll();
        if (beneficiarios.length === 0) {
            return res.status(204).send();
        }
        else {
            return res.status(200).json(beneficiarios)
        }
    }
    catch (error) {
        console.error('Erro ao listar beneficiários:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

export default { listar};
