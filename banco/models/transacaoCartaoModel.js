import { DataTypes } from "sequelize";
import banco from "../banco.js";

const TransacaoCartaoModel = banco.define("transacao_cartao", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tipo: { type: DataTypes.ENUM("credito", "debito"), allowNull: false },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0.01 },
    },
    status: {
        type: DataTypes.ENUM("A", "R", "C"),
        allowNull: false,
        defaultValue: "A",
    },
    retorno_ultima_transacao: { type: DataTypes.STRING, allowNull: true },
    data_ultima_transacao: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    id_beneficiario: { type: DataTypes.INTEGER, allowNull: false },
    id_cartao: { type: DataTypes.INTEGER, allowNull: false },
});

TransacaoCartaoModel.associate = (models) => {
    TransacaoCartaoModel.belongsTo(models.Cartao, {
        foreignKey: { name: "id_cartao", allowNull: false },
    });

    TransacaoCartaoModel.belongsTo(models.Beneficiario, {
        foreignKey: { name: "id_beneficiario", allowNull: false },
    });
};


export default TransacaoCartaoModel;