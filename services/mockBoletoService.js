function gerarNossoNumero() {
    // Gera um número aleatório de 10 dígitos como string
    const numero = Math.floor(1000000000 + Math.random() * 9000000000);
    return `NOSSO-${numero}`;
}

function gerarBoleto() {
    return {
        ok: true,
        mensagem: "Boleto gerado com sucesso",
        data: {
            nosso_numero: gerarNossoNumero(),
            link: "https://drive.google.com/file/d/1LnbHqJ3-OD3EZEb-11DB9N8OnvnvpHsX/view?usp=drive_link"
        }
    };
}

export default { gerarBoleto };