import mongoose from 'mongoose';
import { ROLE_LIST, ROLE_LABELS } from '../config/roles.js';

export const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    service: 'GardenSphere API',
    database: {
      name: mongoose.connection.name || 'garden_sphere',
      state: states[dbState] || 'unknown',
      connected: dbState === 1,
    },
    roles: ROLE_LIST.map((role) => ({
      value: role,
      label: ROLE_LABELS[role],
    })),
    timestamp: new Date().toISOString(),
  });
};
