import { DataTypes } from "sequelize";
import banco from "../banco.js";
import { v4 as uuidv4 } from "uuid";
import { validate as uuidValidate } from "uuid";

const TokenLoginModel = banco.define("token_login", {
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
        allowNull: false,
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
    },
    data_ultimo_acesso: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});

TokenLoginModel.beforeCreate(async (tokenInstance) => {
    const newToken = await uuidv4();
    if (!uuidValidate(newToken)) {
        throw new Error("Generated UUID is invalid");
    }
    tokenInstance.token = newToken;
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