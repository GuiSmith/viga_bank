export function processarPagamentoCartao({ tipo, cartao, valor }) {
    // Erros que podem acontecer em qualquer tipo
    const errosComuns = [
        {
            ok: false,
            error: true,
            mensagem: "Operadora de cartão fora do ar",
            statusHttp: 503
        },
        {
            ok: false,
            error: true,
            mensagem: "Instabilidade no sistema de Operadora de Cartão",
            statusHttp: 502
        },
        {
            ok: false,
            error: false,
            mensagem: "Cartão inexistente"
        },
        {
            ok: false,
            error: false,
            mensagem: "Cartão bloqueado"
        }
    ];

    const respostasCredito = [
        {
            ok: false,
            error: false,
            mensagem: "Sem limite disponível"
        },
        {
            ok: true,
            error: false,
            mensagem: "Pagamento aprovado no crédito",
            data: {
                token: gerarToken(),
                tipo: "credito"
            }
        }
    ];

    const respostasDebito = [
        {
            ok: false,
            error: false,
            mensagem: "Saldo insuficiente"
        },
        {
            ok: true,
            error: false,
            mensagem: "Pagamento aprovado no débito",
            data: {
                token: gerarToken(),
                tipo: "debito"
            }
        }
    ];

    let respostasPossiveis = [...errosComuns];

    if (tipo === "credito") {
        respostasPossiveis = respostasPossiveis.concat(respostasCredito);
    } else if (tipo === "debito") {
        respostasPossiveis = respostasPossiveis.concat(respostasDebito);
    } else {
        return {
            ok: false,
            error: true,
            mensagem: "Tipo de cartão inválido",
            statusHttp: 400
        };
    }

    // 65% de chance de sucesso
    const chanceSucesso = 0.65;

    // Filtra as respostas possíveis em sucesso e falha
    const respostasSucesso = respostasPossiveis.filter(r => r.ok === true);
    const respostasFalha = respostasPossiveis.filter(r => r.ok === false);

    // Decide qual grupo sortear
    const usarSucesso = Math.random() < chanceSucesso;
    const grupo = usarSucesso ? respostasSucesso : respostasFalha;

    // Sorteia uma resposta aleatória dentro do grupo
    const respostaEscolhida = grupo[Math.floor(Math.random() * grupo.length)];
    
    return {
        ok: respostaEscolhida.ok,
        error: respostaEscolhida.error,
        mensagem: respostaEscolhida.mensagem,
        data: respostaEscolhida.data || null,
        statusHttp: respostaEscolhida.statusHttp // pode ser undefined, e aí você responde 500
    };
}

function gerarToken() {
    return "FAKE-" + Math.floor(100000 + Math.random() * 900000);
}

export default { processarPagamentoCartao };