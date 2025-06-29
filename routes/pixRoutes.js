import express from 'express';
import pixController from '../controllers/pixController.js';

const router = express.Router();

router.post('/gerar', pixController.gerar);
router.get('/:id', pixController.selecionar);
router.post('/:id/simular-pagamento', pixController.simularPagamento);

export default router;