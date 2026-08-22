import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import seedUsers from './utils/seedUsers.js';
import seedTasks from './utils/seedTasks.js';
import seedInventory from './utils/seedInventory.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import seedFinance from './utils/seedFinance.js';
import financeRoutes from './routes/financeRoutes.js';
import seedHarvest from './utils/seedHarvest.js';
import harvestRoutes from './routes/harvestRoutes.js';
import seedContact from './utils/seedContact.js';
import contactRoutes from './routes/contactRoutes.js';
import seedCrops from './utils/seedCrops.js';
import cropRoutes from './routes/cropRoutes.js';
import seedIrrigation from './utils/seedIrrigation.js';
import irrigationRoutes from './routes/irrigationRoutes.js';
import seedFertilizer from './utils/seedFertilizer.js';
import fertilizerRoutes from './routes/fertilizerRoutes.js';
import seedPests from './utils/seedPests.js';
import pestRoutes from './routes/pestRoutes.js';
import seedMaintenance from './utils/seedMaintenance.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json({ limit: '6mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'GardenSphere API is running',
    docs: {
      health: '/api/health',
      auth: '/api/auth',
      tasks: '/api/tasks',
      inventory: '/api/inventory',
      finance: '/api/finance',
      harvest: '/api/harvest',
      contact: '/api/contact',
      maintenance: '/api/maintenance',
      users: '/api/users',
      customer: '/api/customer',
      shop: '/api/shop',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/harvest', harvestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/fertilizers', fertilizerRoutes);
app.use('/api/pests', pestRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/shop', shopRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await seedUsers();
    await seedTasks();
    await seedInventory();
    await seedFinance();
    await seedHarvest();
    await seedContact();
    await seedCrops();
    await seedIrrigation();
    await seedFertilizer();
    await seedPests();
    await seedMaintenance();

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
