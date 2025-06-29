// Modelos
import CidadeModel from './cidadeModel.js';
import EstadoModel from './estadoModel.js';
import BeneficiarioModel from './beneficiarioModel.js';
import TokenLoginModel from './tokenLoginModel.js';
import TokenApiModel from './tokenApiModel.js';
import PixModel from './pixModel.js';
import CobrancaCartaoModel from './cobrancaCartaoModel.js';
import BoletoModel from './boletoModel.js';
import ParcelamentoModel from './parcelamentoModel.js';
import RequestLogModel from './requestLogsModel.js';

const models = {
    Cidade: CidadeModel,
    Estado: EstadoModel,
    TokenLogin: TokenLoginModel,
    Beneficiario: BeneficiarioModel,
    TokenApi: TokenApiModel,
    Pix: PixModel,
    CobrancaCartao: CobrancaCartaoModel,
    Boleto: BoletoModel,
    Parcelamento: ParcelamentoModel,
    RequestLog: RequestLogModel
};

// Registra associações
Object.values(models).forEach((model) => {
    if (typeof model.associate === 'function') {
        model.associate(models); // <-- Aqui você passa o `models` como argumento!
    }
});

export default models;