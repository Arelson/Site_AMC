import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postVlogRoutes from './routes/postVlogRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventRoutes from './routes/eventRoutes.js'

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postVlogRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);

export default app;