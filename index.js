import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';
import User from './Models/User.js';
import Post from './Models/Post.js';
import { users, posts } from './data/index.js';

// CONFIGURATIONS

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();

// parse JSON request data from client and assign to req.body
app.use(express.json());

// bất kỳ request nào đến application sẽ đi qua middleware helmet, helmet sẽ set những
// header cần thiết để improve security
app.use(helmet());

// - crossOriginResourcePolicy middleware đc dùng để set header Cross-Origin-Resource-Policy,
// thứ sẽ chỉ ra ai đc phép truy cập vào resource của web page
// - khi 1 request đc gửi đến application, middleware crossOriginResourcePolicy sẽ set
// header Cross-Origin-Resource-Policy thành cross-origin cho response. Header này sẽ
// hướng dẫn browser của người dùng chỉ cho phép các cross-origin request truy cập resource
app.use(
    helmet.crossOriginResourcePolicy({
        // chỉ những cross-origin request đc phép truy cập vào resource
        policy: 'cross-origin'
    })
);
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// FILE STORAGE

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// ROUTES WITH FILES
app.post('/auth/register', upload.single('picture'), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);

// ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// MONGOOSE SETUP

const PORT = process.env.PORT || 6001;
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server PORT: ${PORT}`);
        });

        // ADD DATA ONE TIME
        // User.insertMany(users);
        // Post.insertMany(posts);
    })
    .catch(err => {
        console.log(`err: ${err}`);
    });
