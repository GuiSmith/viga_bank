import CidadeModel from '../models/cidadeModel.js';

// Listar todas as cidades
const listar = async (req, res) => {
    try {
        const cidades = await CidadeModel.findAll();
        if (cidades.length === 0) {
            return res.status(204).send(); // No Content
        }
        // Retorna as cidades encontradas
        res.status(200).json(cidades);
    } catch (error) {
        console.error('Erro ao listar cidades:', error);
        res.status(500).json({ mensagem: 'Erro interno, contate o suporte' });
    }
};

const selecionar = async (req, res) => {
    try {
        const { id } = req.params;
        const cidade = await CidadeModel.findByPk(id);
        if (!cidade) {
            return res.status(404).json({ mensagem: 'Cidade não encontrada' });
        }
        res.status(200).json(cidade);
    } catch (error) {
        console.error('Erro ao selecionar cidade:', error);
        res.status(500).json({ mensagem: 'Erro interno, contate o suporte' });
    }
};

export default { listar, selecionar };