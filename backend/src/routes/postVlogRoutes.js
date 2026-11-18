import express from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import { createPost, readPosts, getPostById, updatePost, deletePost, getPublicFeed } from "../controllers/postController.js";
import { uploadPost } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post('/register', verifyToken, uploadPost.fields([{ name: 'banner', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), createPost);
router.get('/reader', verifyToken, readPosts);

router.put('/:id', verifyToken, uploadPost.fields([{ name: 'banner', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), updatePost);
router.delete('/:id', verifyToken, deletePost);

router.get('/feed', getPublicFeed);
router.get('/:id', getPostById);
export default router;