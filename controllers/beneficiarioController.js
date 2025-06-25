import Beneficiario from '../models/beneficiarioModel.js';
import TokenLoginModel from '../models/tokenLoginModel.js';

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

async function login(req, res){
    try {
        const { email, senha } = req.body;

        const beneficiario = await Beneficiario.findOne({
            where: { email }
        });

        if(beneficiario && await beneficiario.compararSenha(senha)){
            const tokenLoginData = {
                id_beneficiario: beneficiario.id,
            };
            const tokenLogin = await TokenLoginModel.create(tokenLoginData);

            if(tokenLogin){
                return res.status(200).json({
                    token: tokenLogin.token
                });
            }
        }

        return res.status(401).json({ mensagem: `E-mail ou senha inválidos` });

    } catch (error) {
        console.error('Erro ao realizar login:');
        console.log(error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
}

export default { listar, login };
