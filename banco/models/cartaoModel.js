import { DataTypes } from "sequelize";
import banco from "../banco.js";

const CartaoModel = banco.define("cartao", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    token: { type: DataTypes.STRING, allowNull: true },
    nome_titular: { type: DataTypes.STRING, allowNull: false },
    cpf_titular: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [11, 14], is: /^\d+$/ },
    },
    bandeira: { type: DataTypes.STRING, allowNull: false },
    endereco: { type: DataTypes.STRING, allowNull: false },
    numero_endereco: { type: DataTypes.STRING, allowNull: false },
    complemento: { type: DataTypes.STRING },
    id_cidade: { type: DataTypes.INTEGER, allowNull: false },
    id_beneficiario: { type: DataTypes.INTEGER, allowNull: false },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

CartaoModel.associate = (models) => {
    CartaoModel.belongsTo(models.Beneficiario, {
        foreignKey: { name: "id_beneficiario", allowNull: false },
    });

    CartaoModel.belongsTo(models.Cidade, {
        foreignKey: { name: "id_cidade", allowNull: false },
    });
};

export default CartaoModel;
