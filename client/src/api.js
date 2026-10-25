const API = import.meta.env.VITE_API_URL?.trim() || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '');

export async function request(path, options = {}) {
  if (!API) throw new Error('The frontend is published, but no backend API is connected. Set the GitHub Actions variable VITE_API_URL to your deployed API URL.');
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      credentials: 'include',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Can’t reach the case server. Check that the API is running.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || 'Something went wrong. Please try again.');
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  create: (body) => request('/cases', { method: 'POST', body: JSON.stringify(body) }),
  status: (id) => request(`/cases/${id}/status`),
  retry: (id) => request(`/cases/${id}/retry-generation`, { method: 'POST' }),
  cases: () => request('/cases'),
  case: (id) => request(`/cases/${id}`),
  evidence: (id) => request(`/cases/${id}/evidence`),
  progress: (id) => request(`/cases/${id}/progress`),
  saveNotes: (id, notes) => request(`/cases/${id}/notes`, { method: 'PUT', body: JSON.stringify({ notes }) }),
  answer: (id, suspectId) => request(`/cases/${id}/submit-answer`, { method: 'POST', body: JSON.stringify({ suspectId }) }),
  result: (id) => request(`/cases/${id}/result`),
  remove: (id) => request(`/cases/${id}`, { method: 'DELETE' }),
};
