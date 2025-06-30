// Modelos
import CidadeModel from './cidadeModel.js';
import EstadoModel from './estadoModel.js';
import BeneficiarioModel from './beneficiarioModel.js';
import TokenLoginModel from './tokenLoginModel.js';
import TokenApiModel from './tokenApiModel.js';
import PixModel from './pixModel.js';
import transacaoCartaoModel from './transacaoCartaoModel.js';
import BoletoModel from './boletoModel.js';
import ParcelamentoModel from './parcelamentoModel.js';
import RequestLogModel from './requestLogsModel.js';
import CartaoModel from './cartaoModel.js';

const models = {
    Cidade: CidadeModel,
    Estado: EstadoModel,
    TokenLogin: TokenLoginModel,
    Beneficiario: BeneficiarioModel,
    TokenApi: TokenApiModel,
    Pix: PixModel,
    TransacaoCartao: transacaoCartaoModel,
    Boleto: BoletoModel,
    Parcelamento: ParcelamentoModel,
    RequestLog: RequestLogModel,
    Cartao: CartaoModel,
};

// Registra associações
Object.values(models).forEach((model) => {
    if (typeof model.associate === 'function') {
        model.associate(models); // <-- Aqui você passa o `models` como argumento!
    }
});

export default models;