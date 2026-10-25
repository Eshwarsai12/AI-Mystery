import { randomUUID } from 'node:crypto';

const users = new Map();
const cases = new Map();
export const fixtureId = () => `dev_${randomUUID()}`;
export const getFixtureUser = (id) => users.get(id);
export const findFixtureUser = (email) => [...users.values()].find((u) => u.email === email);
export const putFixtureUser = (user) => { users.set(user.id, user); return user; };
export const listFixtureCases = (owner) => [...cases.values()].filter((c) => c.owner === owner).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getFixtureCase = (id, owner) => { const c = cases.get(id); return c && c.owner === owner ? c : null; };
export const putFixtureCase = (value) => { cases.set(value._id, value); return value; };
export const removeFixtureCase = (id) => cases.delete(id);
