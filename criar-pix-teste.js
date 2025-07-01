import models from "./banco/models/index.js";

async function criarPixTeste() {
  try {
    const { Pix, Beneficiario } = models;

    // Encontrar o beneficiário
    const beneficiario = await Beneficiario.findOne({
      where: { email: "ferrari@gabriel.com" },
    });

    if (!beneficiario) {
      console.error("Beneficiário não encontrado!");
      return;
    }

    // Criar PIX de teste
    const pixId = `TEST_${Date.now()}`;
    const pix = await Pix.create({
      id_beneficiario: beneficiario.id,
      valor: 100.0,
      status: "R", // R = recebido/pago
      data_cadastro: new Date(),
      cod_copia_cola: `00020101021226770014BR.GOV.BCB.PIX2555${pixId}520400005303986540510.005802BR5903Pix6008BRASILIA62070503***6304E2CA`,
      qrcode_base64:
        "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACA0lEQVRo3uyYUW6sMAyGXV/g/e9l9QQUp3H4k2YXtJq/C1Qa+PBn43QYDAY2m81ms9lsNpvNZrPZ/kfVISKcp/A4kZB6TeH6fMHDbMgTZEJcn7QAzUr4Lg8Pv4WiHpogAnR6FTbcVvDnwFIcrM9gPcf21lwHyAQJ4LWCp56J66NQCaiV6Ngvb/c15mTQL0tQzyl4kke4eSkHAJXQwu9M3pnjqtQfn4mA67k/xF1MO/5ntkidvJFvB83dlh8A6MAnH98NlN5uIQNU50dxjj8QzCOI738UBISrDvwBSY8/L7+ZA1w3PhMJqI5nSWJA7deiuDeglGu4PrM0QqoD9MszVcCR+3V7UdyaORxn77DpPYD0bFaAXW990b0wfzdALklPxwqwQ5QmwO6Q8R4AJt/t/wYgJOpBcm8OU6vvBBwNMnR+9z+6TgHTv9Wy/TmHeomY+sNJFhL9ZZjfAwDNbQk8Xzj6FtIBSh8Cc9zciSfVgOobPk5Z+BUwkXwOO6ksCTQgxjfsPYBSwVTbBgw/AD5VMDqWcmEEmDer2HsBuGFMulKB6G3rBtih9wFsmzUNSoU+EHvX47VrAEBvj9DVBtI/8hnCJWFV9IBj+YuRdR32AYtFxpRdd6A5uchz3BhwdL2vw0wpPsjAPYCVlWa3YWDDUdtav/fjT9Jms9lsNpvNZrPZbDabvwBx/hbWECHCsQAAAABJRU5ErkJggg==",
      id_integracao: pixId,
      cliente_nome: "Cliente Teste",
      cliente_email: "cliente@teste.com",
      cliente_cpf_cnpj: "12345678900",
    });

    console.log("PIX de teste criado com sucesso:");
    console.log(`ID: ${pix.id}`);
    console.log(`Valor: R$ ${pix.valor}`);
    console.log(`Status: ${pix.status}`);
    return pix;
  } catch (error) {
    console.error("Erro ao criar PIX de teste:", error);
  }
}

criarPixTeste()
  .then(() => {
    console.log("Script finalizado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erro fatal:", err);
    process.exit(1);
  });
