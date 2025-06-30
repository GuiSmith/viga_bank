import express from 'express';
import cobrancaCartaoController from '../controllers/cobrancaCartaoController.js';

const router = express.Router();

// Rota para criar cobrança com cartão
router.post('/', cobrancaCartaoController.criarCobranca);
router.get('/cartao/:id_cartao', cobrancaCartaoController.selecionarCartao);

export default router;