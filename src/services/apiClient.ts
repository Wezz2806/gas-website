// src/services/apiClient.ts

export const AUTH_TOKEN_KEY = 'gas_auth_token';

/**
 * Mengambil token autentikasi yang tersimpan di localStorage.
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Menyimpan token autentikasi ke localStorage.
 */
export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // Abaikan jika localStorage diblokir oleh browser
  }
}

/**
 * Menghapus token autentikasi (saat logout atau session expired).
 */
export function removeAuthToken(): void {
  setAuthToken(null);
}

/**
 * Global fetch interceptor.
 * Menjamin setiap HTTP request ke backend GAS Website (PHP di Railway / Local):
 * 1. Selalu menyertakan credentials: 'include' (untuk browser normal dengan cookies)
 * 2. Selalu menyertakan Authorization: Bearer <token> (untuk browser Incognito / Safari di mana 3rd-party cookie diblokir)
 * 3. Selalu menyertakan X-Session-Token: <token> (fallback jika web server menghapus Authorization header)
 * 4. Selalu menyertakan X-Requested-With: XMLHttpRequest (indikator Ajax)
 */
let interceptorInstalled = false;

export function setupFetchInterceptor(): void {
  if (typeof window === 'undefined' || interceptorInstalled) return;
  interceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const urlString =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request).url;

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const isApiRequest =
      urlString.includes('/api') ||
      urlString.includes('.php') ||
      (typeof apiBase === 'string' && apiBase && urlString.startsWith(apiBase));

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : {}));

    if (!headers.has('X-Requested-With')) {
      headers.set('X-Requested-With', 'XMLHttpRequest');
    }

    const token = getAuthToken();
    if (token) {
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('X-Session-Token')) {
        headers.set('X-Session-Token', token);
      }
    }

    const modifiedInit: RequestInit = {
      ...init,
      credentials: init.credentials || 'include',
      headers,
    };

    return originalFetch(input, modifiedInit);
  };
}

/**
 * Helper fetch mandiri yang sudah terkonfigurasi token & credentials.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : {}));

  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  const token = getAuthToken();
  if (token) {
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('X-Session-Token')) {
      headers.set('X-Session-Token', token);
    }
  }

  return fetch(input, {
    ...init,
    credentials: 'include',
    headers,
  });
}
