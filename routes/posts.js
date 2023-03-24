import express from 'express';
import { getFeedPosts, getUserPosts, likePost } from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// READ

// Lấy thông tin các post khi ở home page
router.get('/', verifyToken, getFeedPosts);

// Lấy các post khi ở page của user dựa vào userId
router.get('/:userId', verifyToken, getUserPosts);

// UPDATE
router.patch('/:id/like', verifyToken, likePost);

export default router;
