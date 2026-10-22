import express from "express";
import { criarArtigo, listarArtigos, getArtigoById, updateArticle, deleteArticle } from '../controllers/articleController.js';
import { verifyToken } from '../middlewares/authmiddleware.js';
import { uploadPdf } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, uploadPdf.single('pdf'), criarArtigo);
router.put('/:id', verifyToken, uploadPdf.single('pdf'), updateArticle);
router.get("/reader", verifyToken, listarArtigos);
router.get('/:id', getArtigoById);
router.delete('/:id', verifyToken, deleteArticle);


export default router;
