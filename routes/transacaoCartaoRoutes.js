import express from 'express';
import transacaoCartaoController from '../controllers/transacaoCartaoController.js';

const router = express.Router();

// Rota para criar cobrança com cartão
router.post('/', transacaoCartaoController.criarCobranca);
router.get('/cartao/:id_cartao', transacaoCartaoController.selecionarCartao);
router.get('/:id', transacaoCartaoController.selecionarTransacaoCartao);

export default router;