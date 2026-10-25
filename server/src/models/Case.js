import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'Untitled case', maxlength: 120 },
  scenario: { type: String, required: true, maxlength: 5000 },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  genre: { type: String, default: 'MYSTERY' },
  suspectCount: { type: Number, min: 3, max: 6, default: 4 },
  evidenceCount: { type: Number, min: 6, max: 12, default: 8 },
  subtitle: { type: String, maxlength: 180 },
  status: { type: String, enum: ['GENERATING', 'READY', 'FAILED'], default: 'GENERATING', index: true },
  stage: { type: String, default: 'CREATING_BLUEPRINT' },
  summary: String,
  incident: String,
  setting: String,
  suspects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  evidence: { type: [mongoose.Schema.Types.Mixed], default: [] },
  timeline: { type: [mongoose.Schema.Types.Mixed], default: [] },
  solution: { type: mongoose.Schema.Types.Mixed, select: false },
  culpritId: { type: String, select: false },
  answer: { type: mongoose.Schema.Types.Mixed, default: null },
  notes: { type: String, default: '', maxlength: 5000 },
  fixture: { type: Boolean, default: false },
  generationError: { type: String, select: false },
}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', caseSchema);
