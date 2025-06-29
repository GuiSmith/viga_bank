import { DataTypes } from "sequelize";
import banco from '../banco.js';

const Model = banco.define('cobrancas_view', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_cadastro: {
        type: DataTypes.DATE,
        allowNull: false
    },
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_integracao: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nosso_numero: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo_cobranca: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const sql = `
    CREATE OR REPLACE VIEW cobrancas_view AS
    (SELECT
        p.id,
        p.valor,
        CASE p.status
            WHEN 'A' THEN 'A receber'
            WHEN 'R' THEN 'Recebido'
            WHEN 'C' THEN 'Cancelado'
        END AS status,
    --	p.status::text AS status,
        p.data_cadastro,
        p.id_beneficiario,
        p.id_integracao,
        NULL AS nosso_numero,
        NULL AS token,
        'Pix' AS tipo_cobranca
    FROM pix AS p)
    UNION
    (SELECT
        b.id,
        b.valor,
        CASE b.status
            WHEN 'A' THEN 'A receber'
            WHEN 'R' THEN 'Recebido'
            WHEN 'C' THEN 'Cancelado'
        END AS status,
        b.data_emissao AS data_cadastro,
        b.id_beneficiario,
        NULL AS id_integracao,
        b.nosso_numero,
        NULL AS TOKEN,
        'Boleto' AS tipo_cobranca
    FROM boleto AS b)
    UNION
    (SELECT
        cc.id,
        cc.valor,
        CASE cc.status
            WHEN 'A' THEN 'A receber'
            WHEN 'R' THEN 'Recebido'
            WHEN 'C' THEN 'Cancelado'
        END AS status,
        cc.data_cadastro,
        cc.id_beneficiario,
        NULL AS id_integracao,
        NULL AS nosso_numero,
        cc.token,
        'Cartão' AS tipo_cobranca
    FROM cobranca_cartao AS cc);`;

export default { Model, sql };