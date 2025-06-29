// Importação de modelos
import EstadoModel from "../banco/models/estadoModel.js";

// Importação de serviços
import IbgeService from "../services/ibgeService.js";

// Listar estados
const listar = async (req, res) => {
    try {
        const estados = await EstadoModel.findAll();
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
        const estado = await EstadoModel.findByPk(id);
        if (!estado) {
            return res.status(404).json({ mensagem: "Estado não encontrado" });
        }
        res.status(200).json(estado);
    } catch (error) {
        console.error("Erro ao selecionar estado:", error);
        res.status(500).json({ mensagem: "Erro interno, contate o suporte" });
    }
};

// Sincronizar estados com a API do IBGE
const sincronizarEstados = async (req, res) => {
    try {
        console.log("Iniciando sincronização de estados com a API do IBGE...");
        // Verifica se a API do IBGE está disponível
        const disponivel = await IbgeService.checarDisponibilidade();
        if (!disponivel) {
            return res.status(503).json({ mensagem: "API do IBGE não está disponível no momento" });
        }

        const [estadosIBGE, estadosSistema ] = await Promise.all([
            IbgeService.listarEstados(),
            EstadoModel.findAll({ attributes: ['id', 'cod_ibge'] })
        ]);

        const codsIbgeSistema = new Set(estadosSistema.map(estadoSistema => estadoSistema.cod_ibge));

        const novosEstados = estadosIBGE.filter(estadoIbge => !codsIbgeSistema.has(estadoIbge.id));

        if(novosEstados.length == 0){
            return res.status(200).json({ mensagem: "Nenhum estado novo a ser adicionado" });
        }

        const novosEstadosCriados = await EstadoModel.bulkCreate(novosEstados.map(novoEstado => ({
            sigla: novoEstado.sigla,
            cod_ibge: novoEstado.id,
            nome: novoEstado.nome
        })));

        return res.status(201).json(novosEstadosCriados); 

    } catch (error) {
        console.error("Erro ao sincronizar estados:", error);
    }

}

export default { listar, selecionar, sincronizarEstados };