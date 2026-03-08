// Get session directly from localStorage to bypass SDK hang issues
function getSessionFromStorage(): { access_token: string; refresh_token: string; user: unknown } | null {
  if (typeof window === 'undefined') return null;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  
  // Extract project ID from URL (e.g., https://abc123.supabase.co -> abc123)
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  if (!projectId) return null;
  
  const storageKey = `sb-${projectId}-auth-token`;
  const stored = localStorage.getItem(storageKey);
  
  if (!stored) return null;
  
  try {
    const session = JSON.parse(stored);
    if (session.access_token) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

// Wait for session to be available (with retries for initial load)
async function waitForSession(maxRetries = 5, delayMs = 200): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const session = getSessionFromStorage();
    if (session?.access_token) {
      return session.access_token;
    }
    // Wait before retry
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('No active session');
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const accessToken = await waitForSession();

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

export async function adminGet(url: string): Promise<Response> {
  return adminFetch(url, { method: 'GET' });
}

export async function adminPost(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function adminPut(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function adminPatch(url: string, body: unknown): Promise<Response> {
  return adminFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function adminDelete(url: string): Promise<Response> {
  return adminFetch(url, { method: 'DELETE' });
}
