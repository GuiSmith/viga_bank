import CidadeModel from '../models/cidadeModel.js';

// Listar todas as cidades
export const listar = async (req, res) => {
  try {
    const cidades = await CidadeModel.findAll();
    if (cidades.length === 0) {
      return res.status(204).send(); // No Content
    }
    // Retorna as cidades encontradas
    res.status(200).json(cidades);
  } catch (error) {
    console.error('Erro ao listar cidades:', error);
    res.status(500).json({ message: 'Erro interno, contate o suporte' });
  }
};

export default { listar };