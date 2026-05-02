import type { AuthUser } from '../../features/auth/types';
import type { CheckoutSessionResponse } from '../../features/store/types';

const mockUser: AuthUser = {
  id: 'user_01',
  email: 'player@diguifi.studio',
  name: 'Diguifi Player',
  firstName: 'Player'
};

let hasSession = false;

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });
}

export function resetMockSession() {
  hasSession = false;
}

export async function mockApiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = new URL(input, 'http://localhost');
  const method = init?.method ?? 'GET';

  if (url.pathname === '/api/auth/refresh' && method === 'POST') {
    return hasSession
      ? jsonResponse({ ok: true })
      : new Response('Unauthorized', { status: 401 });
  }

  if (url.pathname === '/api/auth/google' && method === 'POST') {
    hasSession = true;
    return jsonResponse({ ok: true });
  }

  if (url.pathname === '/api/auth/logout' && method === 'POST') {
    hasSession = false;
    return new Response(null, { status: 204 });
  }

  if (url.pathname === '/api/auth/me' && method === 'GET') {
    return hasSession ? jsonResponse(mockUser) : new Response('Unauthorized', { status: 401 });
  }

  if (url.pathname === '/api/produto/checkout-session' && method === 'POST') {
    const response: CheckoutSessionResponse = {
      checkoutUrl: 'https://checkout.stripe.test/session/mock'
    };
    return hasSession ? jsonResponse(response) : new Response('Unauthorized', { status: 401 });
  }

  return new Response('Not found', { status: 404 });
}
