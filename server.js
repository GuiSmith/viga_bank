// Bibliotecas
import express from "express";
import sequelize from "./banco.js";
// import cors from "cors";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Conexão com o banco de dados
let dbConnection = false;
sequelize.authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados estabelecida");
        dbConnection = true;
    })
    .catch(error => {
        console.log("Erro ao se conectar com o banco de dados:", error)
        dbConnection = false;
    });

app.get('/', (req, res) => {
    if (dbConnection) {
        return res.status(200).json({
            mensagem: "Tudo OK"
        });
    }else{
        return res.status(500).json({
            mensagem: "Erro interno, contate o suporte"
        });
    }

});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));