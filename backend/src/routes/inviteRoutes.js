import express from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import { createInvite, getInvites, deleteInvite } from "../controllers/InviteController.js";

const router = express.Router();

router.post('/', verifyToken, createInvite);
router.get('/', verifyToken, getInvites);
router.delete('/:id', verifyToken, deleteInvite);


export default router;