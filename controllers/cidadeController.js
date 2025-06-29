// Importação de modelos
import CidadeModel from '../banco/models/cidadeModel.js';
import EstadoModel from '../banco/models/estadoModel.js';

// Importação de serviços
import ibgeService from '../services/ibgeService.js';

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
        if (isNaN(Number(id))) {
            return res.status(400).json({ mensagem: 'ID inválido' });
        }
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

const criar = async (req, res) => {
    try {
        const colunasObrigatorias = ['nome', 'id_estado', 'cod_ibge'];
        const dados = req.body;
        const dadosFaltantes = colunasObrigatorias.filter(colunaObrigatoria => !dados[colunaObrigatoria]);

        if (dadosFaltantes.length > 0) {
            return res.status(400).json({
                body: req.body,
                detalhes: {
                    obrigatorios: colunasObrigatorias,
                },
                mensagem: `Dados obrigatórios não informados`
            });
        }

        const novaCidade = await CidadeModel.create(dados);
        return res.status(201).json(novaCidade);
    } catch (error) {
        console.error('Erro ao criar cidade:', error);
        res.status(500).json({ mensagem: 'Erro interno, contate o suporte' });
    }
};

const sincronizarCidades = async (req, res) => {
    try {
        console.log("Iniciando sincronização de cidades com a API do IBGE");

        // Verificando se API do IBGE está disponível
        const disponivel = await ibgeService.checarDisponibilidade();

        if (!disponivel) {
            return res.status(503).json({ mensagem: "API do IBGE não está disponível no momento" });
        }

        const estados = await EstadoModel.findAll({ attributes: ['id','sigla'] });

        if (estados.length == 0) {
            return res.status(409).json({ menasgem: "Sincronize os estados antes de sincronizar cidades!" });
        }

        let novasCidadesCadastradas = [];

        for (const estado of estados) {
            const [cidadesIbge, cidadesSistema] = await Promise.all([
                ibgeService.listarCidadesPorEstado(estado.sigla),
                CidadeModel.findAll({ where: { id_estado: estado.id }, attributes: ['cod_ibge'] })
            ]);

            const codsIbgeSistema = new Set(cidadesSistema.map(cidadeSistema => cidadeSistema.cod_ibge));

            const novasCidades = cidadesIbge.filter(cidadeIbge => !codsIbgeSistema.has(cidadeIbge.id));

            if (novasCidades.length > 0) {
                const cidadesCriadas = await CidadeModel.bulkCreate(novasCidades.map(novaCidade => ({
                    nome: novaCidade.nome,
                    cod_ibge: novaCidade.id,
                    id_estado: estado.id
                })));
                novasCidadesCadastradas.push(...cidadesCriadas);
            }
        }

        if (novasCidadesCadastradas.length > 0) {
            return res.status(201).json(novasCidadesCadastradas);
        }else{
            return res.status(200).json({ mensagem: "Nenhuma cidade nova a ser criada" });
        }
    } catch (error) {
        console.error('Erro ao sincronizar cidades:', error);
        res.status(500).json({ mensagem: 'Erro interno, contate o suporte' });
    }
};

export default { listar, selecionar, criar, sincronizarCidades };