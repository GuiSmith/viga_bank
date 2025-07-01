import { DataTypes } from 'sequelize'
import banco from '../banco.js';

const RequestLogModel = banco.define('requests_logs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    method: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    path: { 
        type: DataTypes.TEXT,
        allowNull: false
    },
    body: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    params: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    query: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    status_code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data_cadastro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

export default RequestLogModel;