import { DataTypes } from "sequelize";
import banco from '../banco.js';
import chargeIdGerador from '../../hooks/chargeIdGeradorHook.js';

const cobrancaCartaoModel = banco.define('cobranca_cartao', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipo: { type: DataTypes.ENUM('credito', 'debito'), allowNull: false },
    token: { type: DataTypes.STRING, allowNull: true },
    valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { isDecimal: true, min: 0.01 } },
    status_requisicao: { type: DataTypes.ENUM('processando', 'pendente', 'sucesso', 'falha'), allowNull: false, defaultValue: 'processando' },
    status: { type: DataTypes.ENUM('A','R','C'), allowNull: false, defaultValue: 'A'},
    motivo_erro_requisicao: { type: DataTypes.STRING, allowNull: true },
    nomeTitular: { type: DataTypes.STRING, allowNull: false },
    cpfTitular: { type: DataTypes.STRING, allowNull: false, validate: { len: [11,14], is: /^\d+$/ } },
    bandeira: { type: DataTypes.STRING, allowNull: false },
    endereco: { type: DataTypes.STRING, allowNull: false },
    numero_endereco: { type: DataTypes.STRING, allowNull: false },
    complemento: { type: DataTypes.STRING },
    id_cidade: { type: DataTypes.INTEGER, allowNull: false },
    data_cadastro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    data_ultima_transacao: { type: DataTypes.DATE, allowNull: true },
    id_beneficiario: { type: DataTypes.INTEGER, allowNull: false, },
    charge_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
});

cobrancaCartaoModel.associate = (models) => {
    cobrancaCartaoModel.belongsTo(models.Beneficiario, {
        foreignKey: {
            name: 'id_beneficiario',
            allowNull: false,
        }
    })

    cobrancaCartaoModel.belongsTo(models.Cidade, {
        foreignKey: {
            name: 'id_cidade',
            allowNull: false,
        }
    })
};

chargeIdGerador(cobrancaCartaoModel);

export default cobrancaCartaoModel;
