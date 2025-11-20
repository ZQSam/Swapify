export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('session');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data as T;
}

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export const AuthAPI = {
  requestCode: (email: string) =>
    post<{ ok: true; message: string }>("/api/auth/request-code", { email }),
  verifyCode: (email: string, code: string) =>
    post<{ ok: true; emailVerifiedToken: string }>("/api/auth/verify-code", { email, code }),
  register: (token: string, nickname: string, password: string) =>
    post<{ ok: true; session: string; user: { id: string; email: string; nickname: string } }>(
      "/api/auth/register", { token, nickname, password }
    ),
  login: (email: string, password: string) =>
    post<{ ok: true; session: string; user: { id: string; email: string; nickname: string } }>(
      "/api/auth/login", { email, password }
    ),
};

export interface Book {
  _id: string;
  seller: {
    _id: string;
    nickname: string;
    averageRating: number;
    ratingCount: number;
  };
  title: string;
  author?: string;
  isbn?: string;
  courseCode: string;
  condition: string;
  price: number;
  images: string[];
  description?: string;
  status: 'available' | 'pending' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface BooksListResponse {
  ok: true;
  books: Book[];
  total: number;
}

export const BookAPI = {
  list: (params?: {
    search?: string;
    courseCode?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.courseCode) queryParams.set('courseCode', params.courseCode);
    if (params?.minPrice !== undefined) queryParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params?.condition) queryParams.set('condition', params.condition);
    if (params?.status) queryParams.set('status', params.status);

    const query = queryParams.toString();
    return get<BooksListResponse>(`/api/books${query ? `?${query}` : ''}`);
  },

  get: (id: string) =>
    get<{ ok: true; book: Book }>(`/api/books/${id}`),
};
