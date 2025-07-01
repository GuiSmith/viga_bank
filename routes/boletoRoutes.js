import express from 'express';
import boletoController from '../controllers/boletoController.js';

const router = express.Router();

router.post('/', boletoController.criar);
router.get('/', boletoController.listar);
router.get('/:id', boletoController.selecionar);
router.put('/:id/cancelar', boletoController.cancelar);

export default router;