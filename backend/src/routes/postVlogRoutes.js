import express from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import { createPost, readPosts, getPostById, updatePost, deletePost } from "../controllers/postController.js";

const router = express.Router();

router.post('/register', verifyToken, createPost);
router.get('/reader', verifyToken, readPosts);
router.get('/:id', verifyToken, getPostById);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

export default router;