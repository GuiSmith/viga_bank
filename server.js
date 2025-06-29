// Importação de bibliotecas
import express from "express";
import cors from "cors";

// Importação de configurações gerais
import sequelize from "./banco/banco.js";

//Importação de Middlewares
import corsMiddlware from "./middlewares/corsMiddleware.js";
import auth from "./middlewares/authMiddleware.js";
import logMiddleware from "./middlewares/logMiddleware.js";

// Importação de Rotas
import beneficiarioRoutes from "./routes/beneficiarioRoutes.js";
import tokenApiRoutes from './routes/tokenApiRoutes.js';
import cidadeRoutes from './routes/cidadeRoutes.js';
import estadoRoutes from './routes/estadoRoutes.js';
import pixRoutes from './routes/pixRoutes.js';
import viewsRoutes from './routes/viewsRoutes.js'; // Importa as rotas de views

// Configurando express app
const app = express();
app.use(express.json());
app.use(cors(corsMiddlware));
app.use(auth);
app.use(logMiddleware);

const PORT = process.env.PORT || 5000; // Pega porta do processo (se em produção), se não pega porta 5000

// Conexão com o banco de dados
let dbConnection = false;
sequelize
  .authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida");
    dbConnection = true;
  })
  .catch((error) => {
    console.log("Erro ao se conectar com o banco de dados:", error);
    dbConnection = false;
  });

app.get("/", (req, res) => {
  if (dbConnection) {
    return res.status(200).json({
      mensagem: "Tudo OK",
    });
  } else {
    return res.status(500).json({
      mensagem: "Erro interno, contate o suporte",
    });
  }
});

//Rotas
app.use("/beneficiarios", beneficiarioRoutes);
app.use('/token', tokenApiRoutes);
app.use('/cidades', cidadeRoutes);
app.use('/estados', estadoRoutes);
app.use('/pix',pixRoutes);
app.use('/views', viewsRoutes); // Adiciona as rotas de views


app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
