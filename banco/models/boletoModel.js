import { DataTypes } from 'sequelize';
import banco from '../banco.js';

//Modelos
import CidadeModel from './cidadeModel.js';
import EstadoModel from './estadoModel.js';

const BoletoModel = banco.define('boleto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    // Identificação e valores
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    data_vencimento: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    data_emissao: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('A', 'R', 'C'),
        allowNull: false,
        defaultValue: 'A'
    },
    id_parcelamento: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    numero_parcela: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Informações do boleto
    especie: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nosso_numero: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    observacoes: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
    },

    // Snapshot do beneficiário
    razao_social_beneficiario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf_cnpj_beneficiario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endereco_beneficiario_rua: DataTypes.STRING,
    endereco_beneficiario_numero: DataTypes.STRING,
    endereco_beneficiario_complemento: DataTypes.STRING,
    endereco_beneficiario_bairro: DataTypes.STRING,
    endereco_beneficiario_cidade: DataTypes.STRING,
    endereco_beneficiario_id_cidade: DataTypes.INTEGER,
    endereco_beneficiario_uf: DataTypes.CHAR(2),
    endereco_beneficiario_cep: DataTypes.STRING,

    // Snapshot do pagador
    razao_social_pagador: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf_cnpj_pagador: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endereco_pagador_rua: DataTypes.STRING,
    endereco_pagador_numero: DataTypes.STRING,
    endereco_pagador_complemento: DataTypes.STRING,
    endereco_pagador_bairro: DataTypes.STRING,
    endereco_pagador_cidade: DataTypes.STRING,
    endereco_pagador_id_cidade: DataTypes.INTEGER,
    endereco_pagador_uf: DataTypes.CHAR(2),
    endereco_pagador_cep: DataTypes.STRING,

    // Dados do banco emissor
    banco_emissor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cod_banco: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    agencia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    numero_conta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    convenio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    link: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    // Relacionamento
    id_beneficiario: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

BoletoModel.beforeCreate(async (boleto, options) => {
    const { transaction } = options;

    if (boleto.endereco_beneficiario_id_cidade) {
        const cidadeBeneficiario = await CidadeModel.findByPk(boleto.endereco_beneficiario_id_cidade, { transaction });
        if (cidadeBeneficiario) {
            boleto.endereco_beneficiario_cidade = cidadeBeneficiario.nome;

            if (cidadeBeneficiario.id_estado) {
                const estadoBeneficiario = await EstadoModel.findByPk(cidadeBeneficiario.id_estado, { transaction });
                if (estadoBeneficiario) {
                    boleto.endereco_beneficiario_uf = estadoBeneficiario.sigla;
                }
            }
        }
    }

    if (boleto.endereco_pagador_id_cidade) {
        const cidadePagador = await CidadeModel.findByPk(boleto.endereco_pagador_id_cidade, { transaction });
        if (cidadePagador) {
            boleto.endereco_pagador_cidade = cidadePagador.nome;

            if (cidadePagador.id_estado) {
                const estadoPagador = await EstadoModel.findByPk(cidadePagador.id_estado, { transaction });
                if (estadoPagador) {
                    boleto.endereco_pagador_uf = estadoPagador.sigla;
                }
            }
        }
    }
});


BoletoModel.associate = (models) => {
    BoletoModel.belongsTo(models.Beneficiario, {
        foreignKey: {
            name: 'id_beneficiario',
            allowNull: false
        }
    });

    BoletoModel.belongsTo(models.Cidade, {
        foreignKey: {
            name: 'endereco_beneficiario_id_cidade',
            allowNull: false
        }
    });

    BoletoModel.belongsTo(models.Cidade, {
        foreignKey: {
            name: 'endereco_pagador_id_cidade',
            allowNull: false
        }
    });

    BoletoModel.belongsTo(models.Parcelamento, {
        foreignKey: {
            name: 'id_parcelamento',
            allowNull: true
        }
    });
};

export default BoletoModel;
