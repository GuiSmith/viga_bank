import { DataTypes } from "sequelize";
import banco from "../banco.js";

const CidadeModel = banco.define('cidade', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    id_estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cod_ibge: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data_cadastro: { 
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
});

CidadeModel.associate = (models) => {
    CidadeModel.belongsTo(models.Estado, {
        foreignKey: {
            name: 'id_estado',
            allowNull: false
        }
    });
};

export default CidadeModel;