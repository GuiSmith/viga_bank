import { DataTypes } from "sequelize";
import banco from '../banco.js';
import chargeIdGeradorHook from "../hooks/chargeIdGeradorHook.js";

const PixModel = banco.define('pix', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    status: {
        type: DataTypes.ENUM('R','A','C'),
        allowNull: false,
        defaultValue: 'A'
    },
    cod_copia_cola: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false
    },
    qrcode_base64: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    id_integracao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cliente_nome: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    cliente_email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cliente_cpf_cnpj: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

PixModel.associate = (models) => {
    PixModel.belongsTo(models.Beneficiario, {
        foreignKey: {
            name: 'id_beneficiario',
            allowNull: false
        }
    });
};

export default PixModel;