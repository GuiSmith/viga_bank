import { DataTypes } from 'sequelize';
import banco from '../banco.js';

const ParcelamentoModel = banco.define('parcelamento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'beneficiario',
            key: 'id'
        }
    },
    data_cadasro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    valor_parcela: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    numero_parcelas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

ParcelamentoModel.associate = (models) => {
    ParcelamentoModel.belongsTo(models.Beneficiario, {
        foreignKey: 'id_beneficiario',
        as: 'beneficiario'
    });
};

export default ParcelamentoModel;