export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

const base = () => {
  // Assumes PHP API is deployed under /api at domain root
  return `${window.location.origin}/api`;
};

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${base()}${path}`);
    const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: T; error?: string; message?: string };
    if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
      console.error(`API GET error for ${path}:`, json.error || json.message);
      return null;
    }
    // If response has data, return it; otherwise return the whole json (some endpoints return data directly)
    return json.data !== undefined ? json.data : (json as any);
  } catch (error) {
    console.error(`API GET fetch error for ${path}:`, error);
    return null;
  }
}

export async function apiPost<T>(path: string, body: any): Promise<T | null> {
  try {
    const url = `${base()}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    // Get response text first to handle both JSON and non-JSON responses
    const text = await res.text();
    let json: any;
    
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      console.error(`API POST: Failed to parse JSON response for ${path}:`, text.substring(0, 200));
      console.error(`API POST: Response status: ${res.status} ${res.statusText}`);
      return null;
    }
    
    // Check HTTP status
    if (!res.ok) {
      console.error(`API POST error for ${path}:`, json.error || json.message || `HTTP ${res.status}`);
      return null;
    }
    
    // Check for explicit errors in response
    if (json.ok === false || json.success === false) {
      console.error(`API POST error for ${path}:`, json.error || json.message);
      return null;
    }
    
    // If response has data field, return it (standard format: {ok: true, data: ...})
    if (json.data !== undefined) {
      return json.data as T;
    }
    
    // If success is true but no data field, return the whole response minus metadata fields
    // This handles responses like {success: true, role: 'admin', email: '...'} from login.php
    if (json.success === true || json.ok === true) {
      const { ok, success, data, error, message, ...rest } = json;
      // If rest has properties, return rest; otherwise return the whole json (shouldn't happen)
      return (Object.keys(rest).length > 0 ? rest : json) as T;
    }
    
    // If no explicit success/ok flags but response has content and no error, return it
    // This handles cases where the response is the data itself
    if (Object.keys(json).length > 0 && !json.error) {
      return json as T;
    }
    
    // If we get here, the response is empty or unexpected
    console.warn(`API POST: Unexpected response format for ${path}:`, json);
    return null;
  } catch (error) {
    console.error(`API POST fetch error for ${path}:`, error);
    return null;
  }
}

export async function apiPut<T>(path: string, body: any): Promise<T | null> {
  const res = await fetch(`${base()}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: T; error?: string; message?: string };
  if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
    console.error(`API PUT error for ${path}:`, json.error || json.message);
    return null;
  }
  return json.data || null;
}

export async function apiDelete<T>(path: string, body?: any): Promise<T | null> {
  const res = await fetch(`${base()}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: T; error?: string; message?: string };
  if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
    console.error(`API DELETE error for ${path}:`, json.error || json.message);
    return null;
  }
  return json.data || null;
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${base()}/upload.php`, { method: 'POST', body: form });
  const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: { path: string }; error?: string; message?: string };
  if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
    throw new Error(json.error || json.message || 'Upload failed');
  }
  return json.data?.path || '';
}


