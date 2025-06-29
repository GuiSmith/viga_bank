// Importando bibliotecas
import dotenv from 'dotenv';

// Importando utilitários
import { erroPersonalizado } from '../utils/erros.js';

// Configurando bibliotecas
dotenv.config();

const apiUrl = `https://api.abacatepay.com/v1/pixQrCode`;
const tempoExpiracaoPixSegundos = 3600; // 1 Hora
const defaultHeaders = {
    Authorization: `Bearer ${process.env.ABACATE_PAY_API_KEY}`,
    'Content-Type': 'application/json',
};

const errosTraducao = {
    'Invalid taxId': 'CPF/CNPJ inválido',
    'Pix QRCode not found': 'PIX não encontrado',
    'Unauthorized': 'Não autorizado, contate o suporte'
};

const gerarPix = async ({ valor_decimal, cliente_nome, cliente_email, cliente_cpf_cnpj, cliente_telefone = '' }) => {

    try {
        // Checar se valor é do tipo decimal (0.00), se sim, criar valor_centavos, pois a API só permite centavos
        const valorConvertido = Number(valor_decimal);
        if (!Number.isFinite(valorConvertido) || valorConvertido < 0) {
            throw erroPersonalizado('Valor deve ser decimal: 0.00', 'VALIDACAO');
        }

        // Checar se e-mail informado é válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cliente_email)) {
            throw erroPersonalizado('E-mail inválido', 'VALIDACAO');
        }

        const valor_centavos = Math.round(valor_decimal * 100);

        const bodyObj = {
            amount: valor_centavos,
            expiresIn: tempoExpiracaoPixSegundos,
            customer: {
                name: cliente_nome,
                cellphone: cliente_telefone,
                email: cliente_email,
                taxId: cliente_cpf_cnpj
            }
        };

        const options = {
            method: 'POST',
            headers: { ...defaultHeaders },
            body: JSON.stringify(bodyObj)
        }

        const endpoint = 'create';
        const completeUrl = `${apiUrl}/${endpoint}`;

        const responsePix = await fetch(completeUrl, options);
        const dataPix = await responsePix.json();

        if (!responsePix.ok) {
            if (errosTraducao[data.error]) {
                throw erroPersonalizado('CPF/CNPJ inválido', 'VALIDACAO');
            } else {
                console.log(data.error);
                throw erroPersonalizado('Erro ao criar PIX na integração, contate o suporte', 'OUTRO');
            }
        }

        return {
            ok: true,
            error: false,
            data: dataPix.data,
            mensagem: 'PIX gerado com sucesso'
        }

    } catch (error) {
        console.log(error);
        if (error.tipo) {
            return {
                ok: false,
                error: false,
                data: {},
                mensagem: error.message
            }
        } else {
            return {
                ok: false,
                error: true,
                data: {},
                mensagem: 'Erro interno, contate o suporte'
            }
        }
    }
};

// ID integração da tabela PIX
const selecionarPix = async (id_integracao) => {
    try {
        const endpoint = 'check';
        const completeUrl = `${apiUrl}/${endpoint}?id=${id_integracao}`;

        const options = {
            method: 'GET',
            headers: { ...defaultHeaders }
        };

        const responsePix = await fetch(completeUrl, options);
        const dataPix = await responsePix.json();

        if(responsePix.ok){
            return {
                ok: true,
                error: false,
                data: dataPix.data,
                mensagem: '',
            }
        }

        if(errosTraducao.hasOwnProperty(dataPix.error)){
            return {
                ok: false,
                error: false,
                data: {},
                mensagem: errosTraducao[dataPix.error]
            }
        }else{
            throw new Error(dataPix.error);
        }
    } catch (error) {
        console.error('Erro ao selecionar PIX:', error);
        return {
            ok: false,
            error: true,
            data: {},
            mensagem: 'Erro ao selecionar PIX, contate o suporte'
        };
    }

}

const simularPagamentoPix = async (id_integracao) => {
    try {
        const endpoint = 'simulate-payment';
        const completeUrl = `${apiUrl}/${endpoint}?id=${id_integracao}`;

        const options = {
            method: 'POST',
            headers: { ...defaultHeaders },
            body: JSON.stringify({ id: id_integracao })
        };

        const responsePix = await fetch(completeUrl, options);
        const dataPix = await responsePix.json();
        console.log(dataPix);

        if (responsePix.ok) {
            return {
                ok: true,
                error: false,
                data: dataPix.data,
                mensagem: 'Pagamento simulado com sucesso'
            }
        }else{
            if (errosTraducao.hasOwnProperty(dataPix.error)) {
                return {
                    ok: false,
                    error: false,
                    data: {},
                    mensagem: errosTraducao[dataPix.error]
                }
            } else {
                throw new Error(dataPix.error);
            }
        }
    } catch (error) {
        console.error('Erro ao simular pagamento PIX:', error);
        return {
            ok: false,
            error: true,
            data: {},
            mensagem: 'Erro ao simular pagamento PIX, contate o suporte'
        };
    }
}

export default { gerarPix, selecionarPix, simularPagamentoPix };