import express from "express";
import beneficiarioController from "../controllers/beneficiarioController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rotas beneficiários
router.get("/", auth, beneficiarioController.selecionar);
router.post("/", beneficiarioController.criar);
router.post("/login", beneficiarioController.login);

export default router;
