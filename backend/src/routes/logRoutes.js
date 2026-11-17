import express from 'express'
import { getActionsLog } from "../controllers/logController.js";
import { verifyToken, isAdmin } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getActionsLog);

export default router;
