import { z } from 'zod';
import env from '../config/env.js';
import { caseBlueprintPrompt } from '../prompts/caseBlueprint.js';

const suspectSchema = z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(100), role: z.string().min(1).max(120), description: z.string().min(1).max(1000), statement: z.string().optional(), motive: z.string().optional(), opportunity: z.string().optional(), alibi: z.string().optional() });
const evidenceSchema = z.object({ id: z.string().min(1).max(80), type: z.enum(['DOCUMENT','CHAT','STATEMENT','IMAGE','CCTV','TIMELINE','AUDIO']), title: z.string().min(1).max(160), label: z.string().max(100).optional(), time: z.string().max(100).optional(), location: z.string().max(140).optional(), description: z.string().min(1).max(1200), body: z.string().max(8000).optional(), messages: z.array(z.object({ from: z.string().max(100), time: z.string().max(50).optional(), text: z.string().max(1500) })).max(20).optional(), suspectId: z.string().nullable().optional() });
const blueprintSchema = z.object({ title: z.string().min(1).max(120), summary: z.string().min(1).max(1200), incident: z.string().min(1).max(2000), setting: z.string().max(200).optional(), subtitle: z.string().max(180).optional(), suspects: z.array(suspectSchema).min(3).max(6), culpritId: z.string(), solution: z.object({ culpritName: z.string().min(1).max(100), motive: z.string().min(1).max(1500), reconstruction: z.string().min(1).max(4000), decisiveEvidence: z.array(z.string().max(1000)).min(1).max(12), misleadingEvidence: z.string().max(2000).optional() }), timeline: z.array(z.object({ time: z.string().max(100), event: z.string().min(1).max(1000) })).min(3).max(30), evidence: z.array(evidenceSchema).min(6).max(12) });

export function validateBlueprint(raw, settings) {
  const blueprint = blueprintSchema.parse(raw);
  if (blueprint.suspects.length !== settings.suspectCount || blueprint.evidence.length !== settings.evidenceCount) throw new Error('The generated case didn’t match the requested suspect and evidence counts. Try generating it again.');
  if (!blueprint.suspects.some((s) => s.id === blueprint.culpritId)) throw new Error('The generated case did not contain its selected culprit. Try again.');
  if (new Set(blueprint.suspects.map((s) => s.id)).size !== blueprint.suspects.length) throw new Error('The generated case has duplicate suspect IDs. Try again.');
  if (new Set(blueprint.evidence.map((e) => e.id)).size !== blueprint.evidence.length) throw new Error('The generated case has duplicate evidence IDs. Try again.');
  if (blueprint.evidence.some((e) => e.suspectId && !blueprint.suspects.some((s) => s.id === e.suspectId))) throw new Error('The generated evidence refers to an unknown suspect. Try again.');
  if (blueprint.solution.culpritName !== blueprint.suspects.find((s) => s.id === blueprint.culpritId).name) throw new Error('The generated solution conflicts with the suspect list. Try again.');
  return blueprint;
}

export async function generateMystery(scenario, settings) {
  if (!env.geminiApiKey || !env.geminiModel) throw new Error('Mystery generation is not configured. Add GEMINI_API_KEY and GEMINI_TEXT_MODEL to server/.env, then restart the server.');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;
  let response;
  try {
    response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(env.generationTimeoutMs), body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You generate coherent, entirely fictional mystery cases. Return only valid JSON matching the requested contract.' }] }, contents: [{ role: 'user', parts: [{ text: caseBlueprintPrompt(scenario, settings) }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.75, maxOutputTokens: 11000 } }) });
  } catch (err) { throw new Error(err.name === 'TimeoutError' ? 'Case generation timed out. Please retry.' : 'The mystery provider could not be reached. Please try again.'); }
  if (!response.ok) { const status = response.status; if (status === 429) throw new Error('The mystery service is busy. Please wait a moment and retry.'); throw new Error(status === 400 ? 'The selected mystery model did not accept the request. Check GEMINI_TEXT_MODEL.' : 'The mystery could not be generated. Check your server provider configuration and try again.'); }
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
  if (!text) throw new Error('The mystery provider returned an empty case. Please retry.');
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('The generated case could not be read. Please retry.'); }
  return validateBlueprint(raw, settings);
}

