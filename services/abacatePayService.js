// Importando bibliotecas
import dotenv from 'dotenv';

// Importando utilitários
import { erroPersonalizado } from '../utils/erros.js';

// Configurando bibliotecas
dotenv.config();

const apiUrl = `https://api.abacatepay.com/v1/pixQrCode/create`;
const tempoExpiracaoPixSegundos = 3600; // 1 Hora

const errosTraducao = {
    'Invalid taxId': 'CPF/CNPJ inválido',
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
            headers: {
                Authorization: `Bearer ${process.env.ABACATE_PAY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyObj)
        }

        const responsePix = await fetch(apiUrl, options);
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

export default { gerarPix };