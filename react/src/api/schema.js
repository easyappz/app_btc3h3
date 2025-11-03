import instance from './axios';

let memorySchema = null;
let memorySchemaTs = 0;
const LS_KEY = 'api_schema_yaml';
const LS_KEY_TS = 'api_schema_yaml_ts';
const SCHEMA_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch and cache API schema (YAML) from /api/schema/yaml/.
 * Uses in-memory cache first, then localStorage with TTL, then network.
 * @param {boolean} force - if true, bypass caches
 * @returns {Promise<string>} YAML string
 */
export async function fetchApiSchema(force = false) {
  const now = Date.now();

  if (!force && memorySchema && now - memorySchemaTs < SCHEMA_TTL_MS) {
    return memorySchema;
  }

  if (!force) {
    try {
      const cached = localStorage.getItem(LS_KEY);
      const ts = Number(localStorage.getItem(LS_KEY_TS) || '0');
      if (cached && ts && now - ts < SCHEMA_TTL_MS) {
        memorySchema = cached;
        memorySchemaTs = ts;
        return cached;
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  const res = await instance.get('/api/schema/yaml/', {
    responseType: 'text',
    transformResponse: (v) => v,
  });

  const yaml = res.data;
  memorySchema = yaml;
  memorySchemaTs = now;
  try {
    localStorage.setItem(LS_KEY, yaml);
    localStorage.setItem(LS_KEY_TS, String(now));
  } catch (e) {
    // ignore storage errors
  }
  return yaml;
}

export default fetchApiSchema;
