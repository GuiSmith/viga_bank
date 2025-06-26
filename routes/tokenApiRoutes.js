import express from 'express';
import tokenApiController from '../controllers/tokenApiController.js';

const router = express.Router();

router.get('/', tokenApiController.listar);
router.get('/:id',tokenApiController.selecionar)

export default router;