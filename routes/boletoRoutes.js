import express from 'express';
import boletoController from '../controllers/boletoController.js';

const router = express.Router();

router.post('/', boletoController.criar);

export default router;