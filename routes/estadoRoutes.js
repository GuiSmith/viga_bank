import express from 'express';
import estadoController from '../controllers/estadoController.js';

const router = express.Router();

router.get('/', estadoController.listar);

export default router;