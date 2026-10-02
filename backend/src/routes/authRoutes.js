import express  from "express";
import { register, login, getMe, updateProfile, getProfile, getAllMembers, getMemberById } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authmiddleware.js";

const router = express.Router();

//Rotas públicas (não precisam de token)
router.post('/register', register);
router.post('/login', login);
router.get("/members", getAllMembers);
router.get('/members/:id', getMemberById);

//Rotas protegidas (o middleware entra antes do controller)
router.get('/me', verifyToken, getMe);
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);


export default router;