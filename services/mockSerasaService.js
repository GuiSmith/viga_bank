// services/serasaServiceMock.js

function consultarNome(cpf_cnpj) {
    if (typeof cpf_cnpj !== 'string' || cpf_cnpj.length < 11 || cpf_cnpj.length > 14 || !/^\d+$/.test(cpf_cnpj)) {
        return {
            ok: false,
            error: false,
            mensagem: "CPF/CNPJ inválido, deve ser um texto numérico com 11 ou 14 caracteres",
            data: null,
            statusHttp: 400
        };
    }

    try {
        // Simula falha de comunicação com 10% de chance
        if (Math.random() < 0.1) {
            return {
                ok: false,
                error: true,
                mensagem: "Não foi possível se conectar com Serasa, contate nosso suporte",
                data: null,
                statusHttp: 503
            };
        }

        // Simula ausência de resposta com 10% de chance
        if (Math.random() < 0.1) {
            return {
                ok: false,
                error: true,
                mensagem: "Operação não realizada devido falta de retorno da plataforma Serasa, contate nosso suporte",
                data: null,
                statusHttp: 504
            };
        }

        // Gera score de 0 a 1000
        const score = Math.floor(Math.random() * 1001);

        if (score < 1 || score > 1000) {
            return {
                ok: false,
                error: true,
                mensagem: "Operação não realizada devido divergência de score do Serasa, contate nosso suporte",
                data: null,
                statusHttp: 422
            };
        }

        // Define parecer
        let parecer;
        if (score >= 700) {
            parecer = "bom";
        } else if (score >= 400) {
            parecer = "regular";
        } else {
            parecer = "ruim";
        }

        return {
            ok: true,
            error: false,
            mensagem: "Consulta realizada com sucesso",
            data: {
                score,
                parecer
            },
            statusHttp: 200
        };
    } catch (erro) {
        return {
            ok: false,
            error: true,
            mensagem: "Não foi possível se conectar com Serasa, contate nosso suporte",
            data: null,
            statusHttp: 500
        };
    }
}

export default { consultarNome };
