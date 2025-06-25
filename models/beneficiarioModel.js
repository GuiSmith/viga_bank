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
    cpf_cnpj: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [11,14],
            is: /^\d+$/i
        }
    },
    codigo_banco: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nome_banco: {
        type: DataTypes.STRING,
        allowNull: false
    },
    agencia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numero_conta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo_beneficiario: {
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

BeneficiarioModel.prototype.compararSenha = async function(senhaTextoPuro) {
    try {
        return await bcrypt.compare(senhaTextoPuro, this.dataValues.senha);
    } catch (error) {
        console.log(error);
        return false;
    }
}

export default BeneficiarioModel;