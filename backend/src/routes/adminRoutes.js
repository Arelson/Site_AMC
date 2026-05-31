import express from "express";
import { generateInviteCode, getInvites, deleteInvite, updateUser } from "../controllers/adminController.js";
import { verifyToken, isAdmin} from "../middlewares/authmiddleware.js";

const router = express.Router();

router.use(verifyToken); // Aplica o middleware de verificação de token a todas as rotas
router.use(isAdmin); // Aplica o middleware de verificação de admin a todas as rotas

router.post('/invites', generateInviteCode);
router.get('/invites', getInvites);
router.delete('/invites/:id', deleteInvite);
router.patch('/update', updateUser);

export default router;