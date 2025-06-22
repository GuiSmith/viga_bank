import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';
import banco from "../banco.js";

const BeneficiarioModel = banco.define("beneficiario", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    razao: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fantasia: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cpfCnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [11,14],
            is: /^\d+$/i
        }
    },
    codigoBanco: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nomeBanco: {
        type: DataTypes.STRING,
        allowNull: false
    },
    agencia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numeroConta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigoBeneficiario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_cadastro: { 
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    charge_contador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    nosso_numero_contador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

BeneficiarioModel.beforeUpdate(async (beneficiario, options) => {
    if(beneficiario.changed('senha')) {
        beneficiario.senha = await bcrypt.hash(beneficiario.senha,10);
    }
});

BeneficiarioModel.beforeCreate(async (beneficiario) => {
    beneficiario.senha = await bcrypt.hash(beneficiario.senha,10)
});

BeneficiarioModel.prototype.compararSenha = async (senhaTextoPuro) => {
    return await bcrypt.compare(senhaTextoPuro, this.senha);
}

export default BeneficiarioModel;