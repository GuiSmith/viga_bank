import express from "express";
import beneficiarioController from "../controllers/beneficiarioController.js";

const router = express.Router();

// Rota para listar todos os beneficiários
router.get("/", beneficiarioController.listar);
router.post("/login", beneficiarioController.login);

export default router;
