import express from "express";
import devolucaoController from "../controllers/devolucaoController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas as rotas de devolução requerem autenticação
router.use(auth);

// Rotas de devolução
router.get("/", devolucaoController.listar);
router.get("/:id", devolucaoController.selecionar);
router.post("/", devolucaoController.criar);
router.put("/:id", devolucaoController.alterar);

export default router;
