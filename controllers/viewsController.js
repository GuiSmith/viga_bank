import Views from "../banco/views/index.js";
import banco from "../banco/banco.js";

const listar = async (req, res) => {
    try {
        const views = Object.keys(Views);

        if(views.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(views);
    } catch (error) {
        console.error("Erro ao listar cobranças:", error);
        res.status(500).json({ error: "Erro interno, contate o suporte" });
    }
};

const listarDados = async (req, res) => {
    const { view } = req.params;

    if (!view || !Views[view]) {
        return res.status(404).json({ error: "View não encontrada" });
    }

    try {
        if(!req.params.view){
            return res.status(400).json({ error: "Informe o nome da view" });
        }

        const { view } = req.params;

        const dados = await Views[view].Model.findAll({
            where: { id_beneficiario: req.beneficiario.id },
            raw: true,
        });
        
        if(dados.length === 0) {
            return res.status(204).send();
        }

        return res.status(200).json(dados);

    } catch (error) {
        console.error("Erro ao selecionar view:", error);
        res.status(500).json({ error: "Erro interno, contate o suporte" });
    }
};

export default { listar, listarDados };