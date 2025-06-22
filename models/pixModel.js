import { DataTypes } from "sequelize";
import banco from '../banco.js';
import chargeIdGeradorHook from "../hooks/chargeIdGeradorHook.js";

const PixModel = banco.define('pix', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pix_type: {
        type: DataTypes.ENUM('cc','qr'),
        allowNull: false,
    },
    cod: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    qrcode_url: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    charge_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
});

PixModel.associate = (models) => {
    PixModel.belongsTo(models.Beneficiario, {
        foreignKey: {
            name: 'id_beneficiario',
            allowNull: false
        }
    });
};

chargeIdGeradorHook(PixModel);

export default PixModel;