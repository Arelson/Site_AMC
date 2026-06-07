import express from 'express';
import { createNews, deleteNews, getPublicPortalNews, getAdminNews, updateNews, getNewsById } from '../controllers/newsController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js'; // Ajuste conforme seu middleware

const router = express.Router();
// 1. Rotas Públicas Fixas
router.get('/feed', getPublicPortalNews);

// 2. Rotas Privadas / Administrativas
router.post('/register', verifyToken, isAdmin, createNews);
router.get('/admin', verifyToken, isAdmin, getAdminNews); // Para listar todas as notícias no painel admin
router.put('/:id', verifyToken, updateNews);
router.delete('/:id', verifyToken, isAdmin, deleteNews);


// 3. Rotas Públicas 
router.get('/:id', getNewsById);

export default router;