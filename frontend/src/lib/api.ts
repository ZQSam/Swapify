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
  courseName?: string;
  term?: string;
  condition: string;
  price: number;
  image?: string;
  images?: string[];
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

async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
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

  getMyBooks: () =>
    get<{ books: Book[] }>('/api/books/my/listings'),

  create: (data: {
    title: string;
    author?: string;
    isbn?: string;
    courseCode: string;
    courseName?: string;
    term?: string;
    price: number;
    condition: 'new' | 'used';
    description?: string;
    image?: string;
  }) =>
    post<{ book: Book }>('/api/books', data),

  update: (id: string, data: Partial<{
    title: string;
    author?: string;
    isbn?: string;
    courseCode: string;
    courseName?: string;
    term?: string;
    price: number;
    condition: 'new' | 'used';
    description?: string;
    image?: string;
  }>) =>
    put<{ book: Book }>(`/api/books/${id}`, data),

  delete: (id: string) =>
    del<{ message: string }>(`/api/books/${id}`),
};

export interface BookTemplateSuggestion {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  edition?: string;
  year?: number;
  coverImage?: string;
  courseInfo?: {
    code: string;
    name: string;
    term: string;
    section: string;
  };
}

export const BookTemplateAPI = {
  search: (query: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set('q', query);
    if (limit) queryParams.set('limit', limit.toString());

    return get<{ suggestions: BookTemplateSuggestion[] }>(
      `/api/book-templates/search?${queryParams.toString()}`
    );
  },
  getAvailableTerms: () =>
    get<{ terms: string[] }>('/api/book-templates/terms'),
};

export interface Course {
  code: string;
  name: string;
}

export const CourseAPI = {
  getByTerm: (term: string) =>
    get<{ courses: Course[] }>(`/api/courses/by-term?term=${encodeURIComponent(term)}`),
};

async function patch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export interface PurchaseRequest {
  _id: string;
  book: {
    _id: string;
    title: string;
    author?: string;
    price: number;
    image?: string;
  };
  buyer: {
    _id: string;
    nickname: string;
  };
  seller: {
    _id: string;
    nickname: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    nickname: string;
    email: string;
  };
  receiver: {
    _id: string;
    nickname: string;
    email: string;
  };
  messageType: 'text' | 'purchase_request';
  content?: string;
  purchaseRequest?: PurchaseRequest;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    id: string;
    nickname: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean;
    messageType: string;
  };
  unreadCount: number;
}

export const MessageAPI = {
  send: (receiverId: string, content: string) =>
    post<{ message: Message }>('/api/messages', { receiverId, content }),

  sendPurchaseRequest: (receiverId: string, purchaseRequestId: string, content?: string) =>
    post<{ message: Message }>('/api/messages/purchase-request', {
      receiverId,
      purchaseRequestId,
      content,
    }),

  getConversations: () =>
    get<{ conversations: Conversation[] }>('/api/messages/conversations'),

  getMessagesWith: (userId: string) =>
    get<{ messages: Message[] }>(`/api/messages/with/${userId}`),

  markAsRead: (messageId: string) =>
    patch<{ message: Message }>(`/api/messages/${messageId}/read`),

  getUnreadCount: () =>
    get<{ unreadCount: number }>('/api/messages/unread-count'),
};

export const PurchaseRequestAPI = {
  accept: (id: string) =>
    patch<{ ok: true; purchaseRequest: PurchaseRequest; message: string }>(
      `/api/purchase-requests/${id}/accept`
    ),

  reject: (id: string) =>
    patch<{ ok: true; purchaseRequest: PurchaseRequest; message: string }>(
      `/api/purchase-requests/${id}/reject`
    ),

  cancel: (id: string) =>
    patch<{ ok: true; purchaseRequest: PurchaseRequest; message: string }>(
      `/api/purchase-requests/${id}/cancel`
    ),
};
