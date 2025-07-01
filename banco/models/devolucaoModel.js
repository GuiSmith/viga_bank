import { DataTypes } from "sequelize";
import banco from "../banco.js";
import BeneficiarioModel from "./beneficiarioModel.js";
import devolucaoValidacaoHook from "../../hooks/devolucaoValidacaoHook.js";

const DevolucaoModel = banco.define("devolucao", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  id_beneficiario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BeneficiarioModel,
      key: "id",
    },
  },
  tipo_transacao: {
    type: DataTypes.ENUM("PIX", "BOLETO", "CARTAO"),
    allowNull: false,
  },
  id_transacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valor_original: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  valor_devolucao: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "SOLICITADA",
      "EM_PROCESSAMENTO",
      "CONCLUIDA",
      "REJEITADA",
      "CANCELADA"
    ),
    allowNull: false,
    defaultValue: "SOLICITADA",
  },
  data_solicitacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  data_processamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  data_conclusao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  codigo_autorizacao: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referencia_externa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  criado_por: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  atualizado_por: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Relacionamentos
DevolucaoModel.belongsTo(BeneficiarioModel, {
  foreignKey: "id_beneficiario",
  as: "beneficiario",
});

// Hooks - Utilizando o hook externo da pasta hooks
DevolucaoModel.beforeCreate(devolucaoValidacaoHook);

export default DevolucaoModel;
