import TokenLoginModel from "../models/tokenLoginModel.js";
import tokenApiModel from '../models/tokenApiModel.js';
import BeneficiarioModel from "../models/beneficiarioModel.js";

const publicRoutes = [
    { path: '/beneficiarios/login', method: 'POST' },
    { path: '/beneficiarios', method: 'POST' },
];

const tokenLoginExpiracaoHoras = 3;
const tokenLoginExpiracaoMMs = tokenLoginExpiracaoHoras * 60 * 60 * 1000;

const auth = async (req, res, next) => {
    const isPublicRoute = publicRoutes.some(route =>
        route.path === req.path && route.method === req.method
    );

    if (isPublicRoute) {
        return next();
    }

    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensagem: 'Token de autenticação não fornecido' });
    }

    try {
        // Lógica para tokens de login
        const tokenLogin = await TokenLoginModel.findOne({ where: { token } });

        if (tokenLogin) {
            const dataHoraExpiracao = new Date(new Date() - tokenLoginExpiracaoMMs);
            const dataHoraCadastro = new Date(tokenLogin.data_cadastro);

            if (dataHoraCadastro < dataHoraExpiracao || tokenLogin.ativo === false) {
                return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
            }

            const beneficiario = await BeneficiarioModel.findByPk(tokenLogin.id_beneficiario);

            if (!beneficiario) {
                return res.status(404).json({ mensagem: 'Beneficiário não encontrado' });
            }

            req.beneficiario = beneficiario;
            next();
        }

        // Lógica para tokens de API
        const tokenApi = await tokenApiModel.findOne({ where: { token } });

        if (tokenApi) {

            if (tokenApi.ativo === false) {
                return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
            }

            const beneficiario = await BeneficiarioModel.findByPk(tokenApi.id_beneficiario);

            if (!beneficiario) {
                return res.status(404).json({ mensagem: 'Beneficiário não encontrado' });
            }

            req.beneficiario = beneficiario;
            next();
        }

        if (!tokenLogin && !tokenApi) {
            return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
        }

    } catch (error) {
        console.error('Erro ao validar o token:', error);
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

export default auth;