export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This page has gone cold.' } });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.statusCode || (err.name === 'ZodError' || err instanceof SyntaxError ? 400 : err.name === 'CastError' ? 404 : 500);
  if (status === 400) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err instanceof SyntaxError ? 'The request body must be valid JSON.' : err.name === 'ZodError' ? err.issues?.[0]?.message || 'Check your request and try again.' : err.message, requestId: req.id } });
  if (status === 404 && err.name === 'CastError') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This case is not in your archive.', requestId: req.id } });
  if (status >= 500) console.error(`[${req.id || 'request'}] ${err.message}`);
  res.status(status).json({ error: { code: err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'), message: status === 500 ? 'The case server encountered an error.' : err.message, requestId: req.id } });
}
