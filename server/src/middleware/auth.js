import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { getFixtureUser } from '../services/fixtureStore.js';

export async function authenticate(req, res, next) {
  const token = req.cookies?.casefile_session;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' } });
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (env.devFixtures) {
      const user = getFixtureUser(payload.sub);
      if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Your session has ended. Please sign in again.' } });
      req.user = user;
    } else {
      const { default: User } = await import('../models/User.js');
      const user = await User.findById(payload.sub).select('name email');
      if (!user) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Your session has ended. Please sign in again.' } });
      req.user = { id: user.id, name: user.name, email: user.email };
    }
    next();
  } catch { return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Your session has ended. Please sign in again.' } }); }
}
