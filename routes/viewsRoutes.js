import express from 'express';
import viewsController from '../controllers/viewsController.js';

const router = express.Router();

router.get('/', viewsController.listar);
router.get('/:view', viewsController.listarDados);

export default router;
