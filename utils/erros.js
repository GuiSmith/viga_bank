const erroPersonalizado = (mensagem, tipo) => {
    const error = new Error(mensagem);
    error.tipo = tipo;
    return error;
}

export { erroPersonalizado };