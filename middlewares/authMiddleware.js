import TokenLoginModel from "../banco/models/tokenLoginModel.js";
import tokenApiModel from "../banco/models/tokenApiModel.js";
import BeneficiarioModel from "../banco/models/beneficiarioModel.js";

const publicRoutes = [
  { path: "/beneficiarios/login", method: "POST" },
  { path: "/beneficiarios", method: "POST" },
];

// Debug routes
const debugRoutes = [
  { path: "/pix", method: "GET" }, // Para depuração
];

const tokenLoginExpiracaoHoras = 3;
const tokenLoginExpiracaoMMs = tokenLoginExpiracaoHoras * 60 * 60 * 1000;

const auth = async (req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.path}`);

  const isPublicRoute = publicRoutes.some(
    (route) => route.path === req.path && route.method === req.method
  );

  if (isPublicRoute) {
    console.log(`Rota pública: ${req.method} ${req.path}`);
    return next();
  }

  const isDebugRoute = debugRoutes.some(
    (route) => route.path === req.path && route.method === req.method
  );

  if (isDebugRoute) {
    console.log(`Rota de depuração: ${req.method} ${req.path}`);
    console.log(`Headers: ${JSON.stringify(req.headers)}`);
  }

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ mensagem: "Token de autenticação não fornecido" });
  }

  try {
    // Lógica para tokens de login
    const tokenLogin = await TokenLoginModel.findOne({ where: { token } });

    if (tokenLogin) {
      const dataHoraExpiracao = new Date(new Date() - tokenLoginExpiracaoMMs);
      const dataHoraCadastro = new Date(tokenLogin.data_cadastro);

      if (dataHoraCadastro < dataHoraExpiracao || tokenLogin.ativo === false) {
        return res.status(401).json({ mensagem: "Token inválido ou expirado" });
      }

      const beneficiario = await BeneficiarioModel.findByPk(
        tokenLogin.id_beneficiario
      );

      if (!beneficiario) {
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado" });
      }

      req.beneficiario = beneficiario;
      req.tipoToken = "login"; // Identifica que é um token de login
      return next();
    }

    // Lógica para tokens de API
    const tokenApi = await tokenApiModel.findOne({ where: { token } });

    if (tokenApi) {
      console.log(
        `Token API encontrado: ${token.substring(0, 10)}... (${req.method} ${
          req.path
        })`
      );

      if (tokenApi.ativo === false) {
        console.log(`Token API inativo: ${token.substring(0, 10)}...`);
        return res.status(401).json({ mensagem: "Token inválido ou expirado" });
      }

      const beneficiario = await BeneficiarioModel.findByPk(
        tokenApi.id_beneficiario
      );

      if (!beneficiario) {
        console.log(
          `Beneficiário não encontrado para token API: ${token.substring(
            0,
            10
          )}...`
        );
        return res
          .status(404)
          .json({ mensagem: "Beneficiário não encontrado" });
      }

      req.beneficiario = beneficiario;
      req.tipoToken = "api"; // Identifica que é um token de API
      console.log(
        `Autenticação com token API bem-sucedida para beneficiário ID: ${beneficiario.id} (${req.method} ${req.path})`
      );
      return next();
    }

    if (!tokenLogin && !tokenApi) {
      return res.status(401).json({ mensagem: "Token inválido ou expirado" });
    }
  } catch (error) {
    console.error("Erro ao validar o token:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

export default auth;
