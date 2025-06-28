// Importação de modelos
import CidadeModel from "../models/cidadeModel.js";

// Importação de serviços
import IbgeService from "../services/ibgeService.js";

// Listar estados
const listar = async (req, res) => {
    try {
        const estados = await CidadeModel.findAll();
        if (estados.length === 0) {
            return res.status(204).send(); // No Content
        }
        // Retorna os estados encontrados
        res.status(200).json(estados);
    } catch (error) {
        console.error("Erro ao listar estados:", error);
        res.status(500).json({ mensagem: "Erro interno, contate o suporte" });
    }
}

// Selecionar estado por ID
const selecionar = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(Number(id))) {
            return res.status(400).json({ mensagem: "ID inválido, deve ser um número" });
        }
        const estado = await CidadeModel.findByPk(id);
        if (!estado) {
            return res.status(404).json({ mensagem: "Estado não encontrado" });
        }
        res.status(200).json(estado);
    } catch (error) {
        console.error("Erro ao selecionar estado:", error);
        res.status(500).json({ mensagem: "Erro interno, contate o suporte" });
    }
};

export default { listar, selecionar };