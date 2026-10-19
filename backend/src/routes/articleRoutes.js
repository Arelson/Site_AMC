import express from "express";
import { criarArtigo, listarArtigos, getArtigoById } from '../controllers/articleController.js';
import { verifyToken } from '../middlewares/authmiddleware.js';
import { uploadPdf } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, uploadPdf.single('pdf'), criarArtigo);
router.get("/reader", verifyToken, listarArtigos);
router.get('/:id', getArtigoById);

export default router;
