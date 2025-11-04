import instance from './axios';

function saveTokens(tokens) {
  try {
    if (tokens?.access) localStorage.setItem('token', tokens.access);
    if (tokens?.refresh) localStorage.setItem('refreshToken', tokens.refresh);
  } catch (e) {
    // ignore storage errors
  }
}

export async function register(payload) {
  const { data } = await instance.post('/api/auth/register/', payload);
  if (data?.tokens) {
    saveTokens(data.tokens);
  }
  return data;
}

export async function login(payload) {
  const { data } = await instance.post('/api/auth/login/', payload);
  if (data?.tokens) {
    saveTokens(data.tokens);
  }
  return data;
}

// According to api_schema.yaml: body expects { access: string }
// We'll pass refresh token in the "access" field to comply with schema and backend flexibility.
export async function refresh(refreshToken) {
  const body = { access: refreshToken || localStorage.getItem('refreshToken') || '' };
  const { data } = await instance.post('/api/auth/refresh/', body);
  if (data?.access) {
    saveTokens({ access: data.access });
  }
  return data;
}

export async function getMe() {
  const { data } = await instance.get('/api/profile/me/');
  return data;
}

export async function updateMe(patch) {
  const { data } = await instance.patch('/api/profile/me/', patch);
  return data;
}

export default { register, login, refresh, getMe, updateMe };
