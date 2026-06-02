import express from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import { createPost, readPosts, getPostById, updatePost, deletePost, getPublicFeed
 } from "../controllers/postController.js";

const router = express.Router();

router.post('/register', verifyToken, createPost);
router.get('/reader', verifyToken, readPosts);

router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);

router.get('/feed', getPublicFeed);
router.get('/:id', getPostById);
export default router;