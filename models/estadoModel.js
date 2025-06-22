import { DataTypes } from "sequelize";
import banco from "../banco.js";

const EstadoModel = banco.define('estado', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    sigla: {
        type: DataTypes.STRING(2),
        allowNull: false,
    },
    nome: {
        type: DataTypes.STRING(100),
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

export default EstadoModel;