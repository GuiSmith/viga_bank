import Beneficiario from "../models/beneficiarioModel.js";
import TokenLoginModel from "../models/tokenLoginModel.js";

// Lista todos os beneficiários
async function listar(req, res) {
  try {
    const beneficiarios = await Beneficiario.findAll();
    if (beneficiarios.length === 0) {
      return res.status(204).send();
    } else {
      return res.status(200).json(beneficiarios);
    }
  } catch (error) {
    console.error("Erro ao listar beneficiários:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
}

//Selecionar beneficiário por ID
async function selecionar(req, res) {
  try {
    const id = req.params.id;
    const beneficiario = await Beneficiario.findByPk(id);

    if (!beneficiario) {
      return res.status(404).json({
        body: {},
        detalhes: {},
        mensagem: "Beneficiário não encontrado",
      });
    }

    return res.status(200).json(beneficiario);
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
    const colunasObrigatorias = ['razao', 'fantasia', 'cpf_cnpj', 'codigo_banco', 'nome_banco','agencia','numero_conta','convenio', 'email', 'senha'];
    const colunasUnicas = ['cpf_cnpj','email'];
    const dadosRecebidos = req.body;
    
    const chavesRecebidas = Object.keys(dadosRecebidos);
    const chavesExtras = chavesRecebidas.filter(chave => !colunasObrigatorias.includes(chave));
    
    if (chavesExtras.length > 0) {
      return res.status(400).json({
        mensagem: `Campos não permitidos: ${chavesExtras.join(', ')}. Apenas os campos ${colunasObrigatorias.join(', ')} são obrigatórios.`
      });
    }
    
    const camposFaltando = colunasObrigatorias.filter(campo => !chavesRecebidas.includes(campo) || !dadosRecebidos[campo]);
    
    if (camposFaltando.length > 0) {
      return res.status(400).json({
        mensagem: `Campos obrigatórios não informados: ${camposFaltando.join(', ')}`
      });
    }
    
    for (const coluna of colunasUnicas) {
      const valorColuna = dadosRecebidos[coluna];
      const registroExistente = await Beneficiario.findOne({
        where: { [coluna]: valorColuna }
      });
      
      if (registroExistente) {
        return res.status(400).json({
          mensagem: `Já existe um beneficiário com este ${coluna}: ${valorColuna}`
        });
      }
    }
    
    const novoBeneficiario = await Beneficiario.create(dadosRecebidos);
    
    return res.status(201).json(novoBeneficiario);
    
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

export default { listar, selecionar, login, criar };
