import { mockApiFetch } from './mock-api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ENABLE_API_MOCKS = import.meta.env.VITE_ENABLE_API_MOCKS === 'true';

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = ENABLE_API_MOCKS
    ? await mockApiFetch(url, init)
    : await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {})
        },
        ...init
      });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || 'Unexpected API error');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, {
      method: 'GET'
    });
  },
  post<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
