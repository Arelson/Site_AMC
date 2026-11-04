import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.use(verifyToken); // Aplica o middleware de verificação de token a todas as rotas

router.get('/', getAllUsers);
router.get('/me/:id', verifyToken, getUserById);

export default router;