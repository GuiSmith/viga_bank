import BeneficiarioModel from "../models/beneficiarioModel.js";

const chargeIdGeradorHook = (model) => {
    model.beforeCreate(async (instance, options) => {
        const t = options.transaction;

        if (!instance.id_beneficiario) {
            throw new Error("Beneficiário não informado");
        }

        const beneficiario = await BeneficiarioModel.findByPk(instance.id_beneficiario, {
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!beneficiario) {
            throw new Error("Beneficiário não encontrado");
        }

        const novoChargeId = beneficiario.contador_charge + 1;

        await beneficiario.update(
            { contador_charge: novoChargeId },
            { transaction: t }
        );

        instance.charge_id = novoChargeId;
    });
};

export default chargeIdGeradorHook;