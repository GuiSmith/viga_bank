import express from 'express';
import tokenApiController from '../controllers/tokenApiController.js';

const router = express.Router();

router.get('/', tokenApiController.listar);

export default router;