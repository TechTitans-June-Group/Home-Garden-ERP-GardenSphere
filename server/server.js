import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import seedUsers from './utils/seedUsers.js';
import seedTasks from './utils/seedTasks.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'GardenSphere API is running',
    docs: {
      health: '/api/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await seedUsers();
    await seedTasks();

    const server = app.listen(PORT, () => {
      console.log(`GardenSphere API listening on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
