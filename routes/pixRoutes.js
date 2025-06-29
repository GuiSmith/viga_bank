import express from 'express';
import pixController from '../controllers/pixController.js';

const router = express.Router();

router.post('/gerar', pixController.gerar);

export default router;