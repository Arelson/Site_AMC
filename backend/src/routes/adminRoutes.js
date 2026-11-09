import express from "express";
import { generateInviteCode, getInvites, deleteInvite, updateUser, getAllPostsAdmin, updatePostStatusAdmin, deletePostAdmin, criarMembroAdmin, atualizarMembroAdmin, deleteMember } from "../controllers/adminController.js";
import { verifyToken, isAdmin} from "../middlewares/authmiddleware.js";
import { uploadAvatar } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(verifyToken); // Aplica o middleware de verificação de token a todas as rotas
router.use(isAdmin); // Aplica o middleware de verificação de admin a todas as rotas

router.post('/invites', generateInviteCode);
router.get('/invites', getInvites);
router.delete('/invites/:id', deleteInvite);
router.patch('/update', updateUser);
router.get('/posts', isAdmin, getAllPostsAdmin);
router.patch('/posts/:id/status', isAdmin, updatePostStatusAdmin);
router.delete('/posts/:id', isAdmin, deletePostAdmin);
router.post('/members', isAdmin, uploadAvatar.single('foto'), criarMembroAdmin);
router.patch('/members/:id', isAdmin, uploadAvatar.single('foto'), atualizarMembroAdmin);
router.delete('/member/:id',isAdmin, verifyToken, deleteMember);

export default router;