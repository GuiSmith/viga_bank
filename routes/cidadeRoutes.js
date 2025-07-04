import express from 'express';
import cidadeController from '../controllers/cidadeController.js';

const router = express.Router();

// Rota para listar todas as cidades
router.get('/', cidadeController.listar);
router.get('/:id', cidadeController.selecionar);
router.post('/', cidadeController.criar);
router.post('/sincronizar', cidadeController.sincronizarCidades);

export default router;