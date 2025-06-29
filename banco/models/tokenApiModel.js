import { DataTypes } from "sequelize";
import banco from "../banco.js";
import { v4 as uuidv4 } from "uuid";
import { validate as uuidValidate } from "uuid";

const TokenLoginModel = banco.define("token_api", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true
        }
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

TokenLoginModel.beforeCreate(async (tokenInstance) => {
    // Verificar se o token já existe
    while (true) {
        const newToken = uuidv4();
        if (!uuidValidate(newToken)) {
            throw new Error("UUID gerado é inválido");
        }
        const existingToken = await TokenLoginModel.findOne({ where: { token: newToken } });
        if (!existingToken) {
            tokenInstance.token = newToken;
            break;
        }
    }
});

TokenLoginModel.associate = (models) => {
    TokenLoginModel.belongsTo(models.Beneficiario, {
        foreignKey: {
            name: 'id_beneficiario',
            allowNull: false
        }
    });
};

export default TokenLoginModel;