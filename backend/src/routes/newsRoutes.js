import express from 'express';
import { createNews, deleteNews, getPublicPortalNews, getAdminNews, updateNews, getNewsById, updateStatusNews } from '../controllers/newsController.js';
import { verifyToken, isAdmin } from '../middlewares/authmiddleware.js'; // Ajuste conforme seu middleware
import { uploadNews } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
// 1. Rotas Públicas Fixas
router.get('/feed', getPublicPortalNews);

// 2. Rotas Privadas / Administrativas
router.post('/register', verifyToken, isAdmin, uploadNews.fields([{ name: 'banner', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), createNews);
router.get('/admin', verifyToken, isAdmin, getAdminNews); // Para listar todas as notícias no painel admin
router.put('/:id', verifyToken, isAdmin, uploadNews.fields([{ name: 'banner', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), updateNews);
router.delete('/:id', verifyToken, isAdmin, deleteNews);
router.patch("/:id/status", verifyToken, isAdmin, updateStatusNews);


// 3. Rotas Públicas 
router.get('/:id', getNewsById);

export default router;