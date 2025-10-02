// lib/axiosInstance.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ---- Token plumbing (set by your Auth Context) ----
let getAccessToken: () => string | null = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access');
};
let setAccessToken: (t: string) => void = (t) => {
  if (typeof window !== 'undefined') localStorage.setItem('access', t);
};
let onLogout: () => void = () => {};

// Call this once from your AuthProvider to wire in real getters/setters
export function configureAxiosAuth(opts: {
  getAccessToken?: () => string | null;
  setAccessToken?: (t: string) => void;
  onLogout?: () => void;
} = {}) {
  if (opts.getAccessToken) getAccessToken = opts.getAccessToken;
  if (opts.setAccessToken) setAccessToken = opts.setAccessToken;
  if (opts.onLogout) onLogout = opts.onLogout;
}

// ---- Create instance ----
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive the refresh cookie
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// ---- Request: attach access token ----
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Refresh control (queue while refreshing) ----
let isRefreshing = false;
let waitQueue: Array<(t: string) => void> = [];
let waitRejects: Array<(err: any) => void> = [];

async function refreshAccess(): Promise<string> {
  const res = await axios.post(
    `${API_BASE}/api/accounts/refresh-access-token/`,
    {},
    { withCredentials: true }
  );
  // Your backend returns { token } on success; otherwise { status: '422'|'425' }
  const token = res.data?.token as string | undefined;
  if (!token) {
    const s = res.data?.status;
    throw new Error(s === '425' ? 'NO_REFRESH' : 'REFRESH_INVALID');
  }
  return token;
}

// ---- Response: auto-refresh on 401, retry once ----
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    // Only refresh on 401; 403 means "not admin"—bubble up
    if (status === 401 && original) {
      if (original._retry) {
        onLogout();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccess();
          setAccessToken(newToken);
          waitQueue.forEach((cb) => cb(newToken));
          waitQueue = [];
          waitRejects = [];
        } catch (e) {
          waitRejects.forEach((rej) => rej(e));
          waitQueue = [];
          waitRejects = [];
          onLogout();
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        waitQueue.push((token: string) => {
          original._retry = true;
          original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
          resolve(axiosInstance(original));
        });
        waitRejects.push(reject);
      });
    }

    return Promise.reject(error);
  }
);
