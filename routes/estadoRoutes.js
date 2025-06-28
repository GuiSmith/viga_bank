import express from 'express';
import estadoController from '../controllers/estadoController.js';

const router = express.Router();

router.get('/', estadoController.listar);
router.get('/:id', estadoController.selecionar);
router.post('/sincronizar', estadoController.sincronizarEstados);

export default router;