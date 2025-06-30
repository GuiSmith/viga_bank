// Modelos
import TransacaoCartaoModel from "../banco/models/transacaoCartaoModel.js";
import CartaoModel from "../banco/models/cartaoModel.js";
import CidadeModel from "../banco/models/cidadeModel.js";

// Serviços
import mockOperadoraCartaoService from "../services/mockOperadoraCartaoService.js";

export const criarCobranca = async (req, res) => {
    const dadosObrigatorios = [
        "tipo",
        "nome_titular",
        "cpf_titular",
        "bandeira",
        "numero_cartao",
        "cvv",
        "vencimento",
        "valor",
        "endereco",
        "numero_endereco",
        "complemento",
        "id_cidade",
    ];

    const body = req.body;

    const camposFaltantes = dadosObrigatorios.filter((campo) => !body[campo]);

    if (camposFaltantes.length > 0) {
        return res.status(400).json({
            body: body,
            mensagem: "Campos obrigatórios ausentes.",
            detalhes: {
                obrigatorios: dadosObrigatorios,
                faltando: camposFaltantes,
            }
        });
    }

    try {

        let cartao;
        // Verifica se o cartão já existe
        if (body.hasOwnProperty("id_cartao")) {
            // Verifica se um id_cartao foi fornecido, se é um número válido

            if (isNaN(body.id_cartao) || body.id_cartao <= 0) {
                return res.status(400).json({
                    body: body,
                    mensagem: "ID do cartão inválido.",
                    detalhes: {}
                });
            }
            cartao = await CartaoModel.findByPk(body.id_cartao);
            if (!cartao) {
                return res.status(404).json({
                    body: body,
                    mensagem: "Cartão não encontrado.",
                    detalhes: {}
                });
            }
        } else {
            // Validar se ID cidade pertence a alguma cidade cadastrada
            const cidade = await CidadeModel.findByPk(body.id_cidade);
            if (!cidade) {
                return res.status(404).json({
                    body: body,
                    mensagem: "Cidade não encontrada.",
                    detalhes: {}
                });
            }
            // 
            const novoCartao = await CartaoModel.create({
                nome_titular: body.nome_titular,
                cpf_titular: body.cpf_titular,
                bandeira: body.bandeira,
                endereco: body.endereco,
                numero_endereco: body.numero_endereco,
                complemento: body.complemento,
                id_cidade: body.id_cidade,
            });

            cartao = novoCartao;
        }

        // Cria a transação com status inicial
        const transacaoCartao = await TransacaoCartaoModel.create({
            tipo: body.tipo,
            valor: body.valor,
            status: 'A',
            id_cartao: cartao.id,
            id_beneficiario: req.beneficiario.id,
            data_ultima_transacao: new Date(),
        });

        // Simula a resposta da operadora
        const responsePagamentoCartao = mockOperadoraCartaoService.processarPagamentoCartao({
            tipo: body.tipo,
            cartao: {
                nome_titular: body.nome_titular,
                cpf_titular: body.cpf_titular,
                bandeira: body.bandeira,
                numero_cartao: body.numero_cartao,
                cvv: body.cvv,
                vencimento: body.vencimento,
            },
            valor: body.valor,
        });

        let returnObj = {};
        // Erro
        if (responsePagamentoCartao.error) {
            returnObj = {
                statusHttp: responsePagamentoCartao.statusHttp || 500,
                json: {
                    mensagem: responsePagamentoCartao.mensagem || "Erro inesperado ao processar o pagamento",
                }
            };
        }

        // Operação não realizada, mas não deu erro
        if (!responsePagamentoCartao.ok && !responsePagamentoCartao.error) {
            returnObj = {
                statusHttp: responsePagamentoCartao.statusHttp || 409,
                json: {
                    body: body,
                    mensagem: responsePagamentoCartao.mensagem || "Operação não realizada, contate o suporte",
                    detalhes: {}
                }
            };
        }

        transacaoCartao.retorno_ultima_transacao = responsePagamentoCartao.mensagem;
        transacaoCartao.status = responsePagamentoCartao.ok ? "R" : "A";
        cartao.token = responsePagamentoCartao.data && responsePagamentoCartao.data.token ? responsePagamentoCartao.data.token : null;
        await transacaoCartao.save();
        await cartao.save();

        // Sucesso na operação
        if (responsePagamentoCartao.ok) {
            returnObj = {
                statusHttp: responsePagamentoCartao.statusHttp || 200,
                json: { ...transacaoCartao.toJSON() }
            };
        }

        return res.status(returnObj.statusHttp).json({
            ...returnObj.json,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            mensagem: "Erro interno ao processar a cobrança. Contate o suporte.",
        });
    }
};

// Função para selecionar um CartaoModel específico, dado o ID
export const selecionarCartao = async (req, res) => {
    try {
        if(!req.params.id_cartao){
            return res.status(400).json({
                mensagem: "ID do cartão não fornecido.",
            });
        }
        const id = req.params.id_cartao;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                mensagem: "ID do cartão inválido.",
            });
        }

        const cartao = await CartaoModel.findByPk(id);
        if (!cartao) {
            return res.status(404).json({
                mensagem: "Cartão não encontrado.",
            });
        }

        const cartaoRetorno = cartao.toJSON();
        delete cartaoRetorno.token;
        return res.status(200).json(cartaoRetorno);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            mensagem: "Erro interno ao buscar o cartão. Contate o suporte.",
        });
    }
};


// Função para selecionar uma transação de cartão específica,

export default { criarCobranca, selecionarCartao };