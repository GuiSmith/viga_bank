import Beneficiario from "../banco/models/beneficiarioModel.js";
import TokenLoginModel from "../banco/models/tokenLoginModel.js";

//Selecionar beneficiário por ID
async function selecionar(req, res) {
  try {
    const beneficiario = req.beneficiario;
    const dadosBeneficiario = beneficiario.get({ plain: true });
    delete dadosBeneficiario.senha;

    return res.status(200).json(dadosBeneficiario);
  } catch (error) {
    console.error("Erro ao selecionar beneficiário:", error);
    return res
      .status(500)
      .json({ mensagem: "Erro interno, contate o suporte" });
  }
}

// Realiza a criação de um beneficiário
async function criar(req, res) {
  try {
    const colunasObrigatorias = [
      "razao",
      "fantasia",
      "cpf_cnpj",
      "codigo_banco",
      "nome_banco",
      "agencia",
      "numero_conta",
      "convenio",
      "email",
      "senha",
    ];
    const colunasUnicas = ["cpf_cnpj", "email"];
    const dadosRecebidos = req.body;

    const chavesRecebidas = Object.keys(dadosRecebidos);
    const chavesExtras = chavesRecebidas.filter(
      (chave) => !colunasObrigatorias.includes(chave)
    );

    if (chavesExtras.length > 0) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          campos_nao_permitidos: chavesExtras,
          campos_obrigatorios: colunasObrigatorias,
        },
        mensagem: `Sua requisição possui campos não permitidos.`,
      });
    }

    const camposFaltando = colunasObrigatorias.filter(
      (campo) => !chavesRecebidas.includes(campo) || !dadosRecebidos[campo]
    );

    if (camposFaltando.length > 0) {
      return res.status(400).json({
        body: req.body,
        detalhes: {
          campos_faltando: camposFaltando,
          campos_obrigatorios: colunasObrigatorias,
        },
        mensagem: `Sua requisição possui campos obrigatórios não informados`,
      });
    }

    for (const coluna of colunasUnicas) {
      const valorColuna = dadosRecebidos[coluna];
      const registroExistente = await Beneficiario.findOne({
        where: { [coluna]: valorColuna },
      });

      if (registroExistente) {
        return res.status(400).json({
          body: req.body,
          detalhes: {
            campo_duplicado: coluna,
            valor_duplicado: valorColuna,
            campos_unicos: colunasUnicas,
          },
          mensagem: `Já existe um beneficiário cadastrado com estes valores.`,
        });
      }
    }

    const novoBeneficiario = await Beneficiario.create(dadosRecebidos);
    const dadosNovoBeneficiario = novoBeneficiario.get({ plain: true });
    delete dadosNovoBeneficiario.senha;

    return res.status(201).json({
      body: dadosNovoBeneficiario,
      detalhes: {
        id: novoBeneficiario.id,
        data_cadastro: novoBeneficiario.data_cadastro,
      },
      mensagem: "Beneficiário criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar beneficiário:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

// Realiza o login do beneficiário
async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const beneficiario = await Beneficiario.findOne({
      where: { email },
    });

    if (beneficiario && (await beneficiario.compararSenha(senha))) {
      const tokenLoginData = {
        id_beneficiario: beneficiario.id,
      };
      const tokenLogin = await TokenLoginModel.create(tokenLoginData);

      if (tokenLogin) {
        return res.status(200).json({
          token: tokenLogin.token,
        });
      }
    }

    return res.status(401).json({
      body: req.body,
      mensagem: `E-mail ou senha inválidos`,
    });
  } catch (error) {
    console.error("Erro ao realizar login:");
    console.log(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

export default { selecionar, login, criar };
