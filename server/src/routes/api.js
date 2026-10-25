import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import env from '../config/env.js';
import User from '../models/User.js';
import Case from '../models/Case.js';
import { authenticate } from '../middleware/auth.js';
import { findFixtureUser, getFixtureCase, listFixtureCases, putFixtureCase, putFixtureUser, removeFixtureCase, fixtureId } from '../services/fixtureStore.js';
import { generateMystery } from '../services/mysteryService.js';

const api = Router();
api.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));
const loginLimit = new Map();
const registerSchema = z.object({ name: z.string().trim().min(1).max(60), email: z.string().trim().email().max(254), password: z.string().min(8).max(128) });
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(128) });
const scenarioSchema = z.object({ scenario: z.string().trim().min(20).max(env.maxScenarioLength), difficulty: z.enum(['EASY','MEDIUM','HARD']).default('MEDIUM'), genre: z.enum(['MYSTERY','MURDER','THEFT','DISAPPEARANCE','SABOTAGE']).default('MYSTERY'), suspectCount: z.coerce.number().int().min(3).max(6).default(4), evidenceCount: z.coerce.number().int().min(6).max(12).default(8) });

function sendSession(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.tokenTtl, issuer: 'casefile-api' });
  res.cookie('casefile_session', token, { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
}
function cleanCase(c, includeAnswer = false) {
  const value = typeof c.toObject === 'function' ? c.toObject() : c;
  const { solution, culpritId, generationError, scenario, owner, notes, ...safe } = value;
  if (includeAnswer && value.answer) { safe.answer = value.answer; safe.solution = solution; }
  else if (value.answer) safe.answer = { submitted: true };
  return safe;
}
function ownerFilter(id, userId) { return env.devFixtures ? getFixtureCase(id, userId) : null; }
async function findCase(id, userId, withSolution = false) {
  if (env.devFixtures) return ownerFilter(id, userId);
  let query = Case.findOne({ _id: id, owner: userId });
  if (withSolution) query = query.select('+solution +culpritId');
  return query;
}
async function saveCase(c) { if (env.devFixtures) return putFixtureCase(c); return c.save(); }
async function updateCase(id, owner, values) {
  if (env.devFixtures) { const c = getFixtureCase(id, owner); if (!c) return null; Object.assign(c, values); return putFixtureCase(c); }
  return Case.findOneAndUpdate({ _id: id, owner }, { $set: values }, { new: true });
}

api.post('/auth/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    if (env.devFixtures ? findFixtureUser(email) : await User.exists({ email })) return res.status(409).json({ error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' } });
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = env.devFixtures ? putFixtureUser({ id: fixtureId(), name: input.name, email, passwordHash }) : await User.create({ name: input.name, email, passwordHash });
    sendSession(res, user.id || user._id);
    return res.status(201).json({ user: { id: String(user.id || user._id), name: user.name, email: user.email } });
  } catch (e) { return next(e); }
});

api.post('/auth/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const key = req.ip;
    const attempt = loginLimit.get(key) || { count: 0, at: Date.now() };
    if (Date.now() - attempt.at > 15 * 60_000) { attempt.count = 0; attempt.at = Date.now(); }
    if (attempt.count >= 20) return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Please wait a little and try again.' } });
    loginLimit.set(key, { ...attempt, count: attempt.count + 1 });
    const email = input.email.toLowerCase();
    const user = env.devFixtures ? findFixtureUser(email) : await User.findOne({ email });
    const ok = user && await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'That email and password combination didn’t match.' } });
    sendSession(res, user.id || user._id);
    return res.json({ user: { id: String(user.id || user._id), name: user.name, email: user.email } });
  } catch (e) { return next(e); }
});

api.post('/auth/logout', (req, res) => { res.clearCookie('casefile_session', { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'lax', path: '/' }); res.json({ loggedOut: true }); });
api.get('/auth/me', authenticate, (req, res) => res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } }));

api.post('/cases', authenticate, async (req, res, next) => {
  try {
    const settings = scenarioSchema.parse(req.body);
    const now = new Date().toISOString();
    const id = env.devFixtures ? fixtureId() : undefined;
    let record;
    if (env.devFixtures) record = putFixtureCase({ _id: id, owner: req.user.id, ...settings, title: 'Case in progress', status: 'GENERATING', stage: 'CREATING_BLUEPRINT', createdAt: now, updatedAt: now, suspects: [], evidence: [], timeline: [], solution: null, culpritId: null, answer: null, notes: '', fixture: false });
    else record = await Case.create({ owner: req.user.id, ...settings, title: 'Case in progress', status: 'GENERATING', stage: 'CREATING_BLUEPRINT' });
    setImmediate(async () => {
      try {
        await updateCase(String(record._id), req.user.id, { stage: 'GENERATING_EVIDENCE' });
        const blueprint = await generateMystery(settings.scenario, settings);
        await updateCase(String(record._id), req.user.id, { ...blueprint, status: 'READY', stage: 'COMPLETED', generationError: undefined, fixture: false });
      } catch (err) {
        console.error(`[case ${record._id}] generation failed: ${err.message}`);
        await updateCase(String(record._id), req.user.id, { status: 'FAILED', stage: 'FAILED', generationError: err.message });
      }
    });
    return res.status(202).json({ caseId: String(record._id), status: 'GENERATING', statusUrl: `/api/v1/cases/${record._id}/status` });
  } catch (e) { return next(e); }
});

api.get('/cases', authenticate, async (req, res, next) => {
  try { const cases = env.devFixtures ? listFixtureCases(req.user.id) : await Case.find({ owner: req.user.id }).select('-solution -culpritId -scenario -notes').sort({ createdAt: -1 }).lean(); res.json({ cases: cases.map((c) => cleanCase(c)) }); }
  catch (e) { return next(e); }
});

api.get('/cases/:caseId/status', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; const result = { caseId: String(value._id), status: value.status, stage: value.stage }; if (value.status === 'FAILED') result.message = value.generationError || 'This case could not be completed. Please try again.'; return res.json(result); }
  catch (e) { return next(e); }
});

api.post('/cases/:caseId/retry-generation', authenticate, async (req, res, next) => {
  try {
    const c = await findCase(req.params.caseId, req.user.id);
    if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } });
    const value = typeof c.toObject === 'function' ? c.toObject() : c;
    if (value.status !== 'FAILED') return res.status(409).json({ error: { code: 'CASE_NOT_READY', message: 'Only an unfinished case can be retried.' } });
    const settings = { difficulty: value.difficulty, genre: value.genre, suspectCount: value.suspectCount || 4, evidenceCount: value.evidenceCount || 8 };
    await updateCase(req.params.caseId, req.user.id, { status: 'GENERATING', stage: 'CREATING_BLUEPRINT', generationError: undefined });
    setImmediate(async () => {
      try { await updateCase(req.params.caseId, req.user.id, { stage: 'GENERATING_EVIDENCE' }); const blueprint = await generateMystery(value.scenario, settings); await updateCase(req.params.caseId, req.user.id, { ...blueprint, status: 'READY', stage: 'COMPLETED', generationError: undefined }); }
      catch (err) { console.error(`[case ${req.params.caseId}] generation retry failed: ${err.message}`); await updateCase(req.params.caseId, req.user.id, { status: 'FAILED', stage: 'FAILED', generationError: err.message }); }
    });
    return res.status(202).json({ caseId: req.params.caseId, status: 'GENERATING', statusUrl: `/api/v1/cases/${req.params.caseId}/status` });
  } catch (e) { return next(e); }
});

api.get('/cases/:caseId', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id, true); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); return res.json({ case: cleanCase(c, true) }); }
  catch (e) { return next(e); }
});

api.get('/cases/:caseId/evidence', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; if (value.status !== 'READY') return res.status(409).json({ error: { code: 'CASE_NOT_READY', message: 'This mystery is not ready yet.' } }); return res.json({ evidence: value.evidence }); }
  catch (e) { return next(e); }
});

api.get('/cases/:caseId/evidence/:evidenceId', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; const item = value.evidence.find((e) => e.id === req.params.evidenceId || e._id === req.params.evidenceId); if (!item) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This exhibit is not in your case file.' } }); return res.json({ evidence: item }); }
  catch (e) { return next(e); }
});

api.post('/cases/:caseId/evidence/:evidenceId/open', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; if (!value.evidence.some((e) => e.id === req.params.evidenceId || e._id === req.params.evidenceId)) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This exhibit is not in your case file.' } }); return res.json({ opened: true }); }
  catch (e) { return next(e); }
});

api.get('/cases/:caseId/progress', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; return res.json({ progress: { openedEvidence: [], notes: value.notes || '', selectedSuspectId: value.answer?.suspectId || null } }); }
  catch (e) { return next(e); }
});

api.put('/cases/:caseId/notes', authenticate, async (req, res, next) => {
  try { const { notes } = z.object({ notes: z.string().max(5000) }).parse(req.body); const updated = await updateCase(req.params.caseId, req.user.id, { notes }); if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); return res.json({ saved: true }); }
  catch (e) { return next(e); }
});

api.post('/cases/:caseId/submit-answer', authenticate, async (req, res, next) => {
  try {
    const { suspectId } = z.object({ suspectId: z.string().min(1).max(80) }).parse(req.body);
    const c = await findCase(req.params.caseId, req.user.id, true);
    if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } });
    const value = typeof c.toObject === 'function' ? c.toObject() : c;
    if (value.status !== 'READY') return res.status(409).json({ error: { code: 'CASE_NOT_READY', message: 'This mystery is not ready to solve yet.' } });
    if (value.answer) return res.status(409).json({ error: { code: 'ANSWER_ALREADY_SUBMITTED', message: 'Your final answer has already been submitted.' } });
    if (!value.suspects.some((s) => s.id === suspectId || s._id === suspectId)) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Choose a suspect from this case file.' } });
    const correct = suspectId === value.culpritId;
    await updateCase(req.params.caseId, req.user.id, { answer: { suspectId, correct, score: correct ? 100 : 0, submittedAt: new Date() } });
    return res.json({ submitted: true, correct, score: correct ? 100 : 0, resultUrl: `/cases/${req.params.caseId}/result` });
  } catch (e) { return next(e); }
});

api.get('/cases/:caseId/result', authenticate, async (req, res, next) => {
  try { const c = await findCase(req.params.caseId, req.user.id, true); if (!c) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); const value = typeof c.toObject === 'function' ? c.toObject() : c; if (!value.answer) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'The solution is sealed until your final answer is submitted.' } }); return res.json({ result: { correct: value.answer.correct, score: value.answer.score, suspectId: value.answer.suspectId, solution: value.solution } }); }
  catch (e) { return next(e); }
});

api.delete('/cases/:caseId', authenticate, async (req, res, next) => {
  try { if (env.devFixtures) { if (!removeFixtureCase(req.params.caseId)) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); } else { const deleted = await Case.findOneAndDelete({ _id: req.params.caseId, owner: req.user.id }); if (!deleted) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.' } }); } return res.json({ deleted: true }); }
  catch (e) { return next(e); }
});

export default api;
