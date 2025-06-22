import BeneficiarioModel from "../models/beneficiarioModel.js";

const nossoNumeroGeradorHook = (model) => {
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

        const novoNossoNumero = beneficiario.contador_noso_numero + 1;

        await beneficiario.update(
            { contador_nosso_numero: novoNossoNumero },
            { transaction: t }
        );

        instance.nosso_numero = novoNossoNumero;
    });
}

export default nossoNumeroGeradorHook;