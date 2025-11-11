export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

const base = () => {
  // Assumes PHP API is deployed under /api at domain root
  return `${window.location.origin}/api`;
};

export async function apiGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${base()}${path}`);
  const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: T; error?: string; message?: string };
  if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
    console.error(`API GET error for ${path}:`, json.error || json.message);
    return null;
  }
  return json.data || null;
}

export async function apiPost<T>(path: string, body: any): Promise<T | null> {
  const res = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { ok?: boolean; success?: boolean; data?: T; error?: string; message?: string };
  if ((json.ok === false || json.success === false) || (!json.ok && !json.success)) {
    console.error(`API POST error for ${path}:`, json.error || json.message);
    return null;
  }
  return json.data || null;
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
  const url = new URL(`${base()}${path}`);
  if (body) {
    Object.keys(body).forEach(key => url.searchParams.append(key, String(body[key])));
  }
  const res = await fetch(url.toString(), { method: 'DELETE' });
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


