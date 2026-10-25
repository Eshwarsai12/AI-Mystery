import 'dotenv/config';

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  tokenTtl: process.env.JWT_ACCESS_TOKEN_TTL || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_TEXT_MODEL || '',
  devFixtures: process.env.DEV_FIXTURES === 'true',
  maxScenarioLength: Number(process.env.MAX_SCENARIO_LENGTH || 5000),
  generationTimeoutMs: Number(process.env.CASE_GENERATION_TIMEOUT_MS || 60000),
};

export function validateEnvironment() {
  const missing = [];
  if (!env.jwtSecret || env.jwtSecret.length < 32) missing.push('JWT_SECRET (at least 32 characters)');
  if (!env.devFixtures && !env.mongoUri) missing.push('MONGODB_URI');
  if (!env.devFixtures && (!env.geminiApiKey || !env.geminiModel)) missing.push('GEMINI_API_KEY and GEMINI_TEXT_MODEL');
  if (missing.length) throw new Error(`Missing required configuration: ${missing.join(', ')}. Copy server/.env.example to server/.env and configure these values.`);
}

export default env;
