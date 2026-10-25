import mongoose from 'mongoose';
import app from './app.js';
import env, { validateEnvironment } from './config/env.js';

validateEnvironment();
if (!env.devFixtures) {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000 });
    console.info('Casefile database connected.');
  } catch {
    console.error('Could not connect to MongoDB. Check MONGODB_URI and ensure the database is reachable.');
    process.exit(1);
  }
} else {
  console.warn('Casefile is using the in-memory development fixture mode. Accounts and cases will be lost when the server restarts. Configure MongoDB and disable DEV_FIXTURES for persistent cases.');
}

const server = app.listen(env.port, () => console.info(`Casefile API listening on port ${env.port}.`));
async function shutdown(signal) {
  console.info(`${signal}: closing Casefile API.`);
  server.close(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
