export function processarPagamentoCartao({ tipo, cartao, valor }) {
    // Erros que podem acontecer em qualquer tipo
    const errosComuns = [
        {
            ok: false,
            error: true,
            mensagem: "Operadora fora do ar",
            statusHttp: 503
        },
        {
            ok: false,
            error: true,
            mensagem: "Instabilidade no sistema",
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

    const respostaEscolhida = respostasPossiveis[Math.floor(Math.random() * respostasPossiveis.length)];

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