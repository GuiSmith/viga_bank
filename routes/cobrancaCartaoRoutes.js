import express from 'express';
import cobrancaCartaoController from '../controllers/cobrancaCartaoController.js';

const router = express.Router();

// Rota para criar cobrança com cartão
router.post('/', cobrancaCartaoController.criar);

export default router;