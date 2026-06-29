const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'حدث خطأ غير متوقع';
    try {
      const data = await response.json();
      if (Array.isArray(data.message)) {
        message = data.message[0];
      } else if (data.message) {
        message = data.message;
      }
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: (url: string) => fetchApi(url, { method: 'GET' }).then(data => ({ data })),
  post: (url: string, body: any) => fetchApi(url, { method: 'POST', body: JSON.stringify(body) }).then(data => ({ data })),
  put: (url: string, body: any) => fetchApi(url, { method: 'PUT', body: JSON.stringify(body) }).then(data => ({ data })),
  patch: (url: string, body: any) => fetchApi(url, { method: 'PATCH', body: JSON.stringify(body) }).then(data => ({ data })),
  delete: (url: string) => fetchApi(url, { method: 'DELETE' }).then(data => ({ data }))
};
