const JWT_KEY = 'exstasia_jwt';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(JWT_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(JWT_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(JWT_KEY);
  document.cookie = `${JWT_KEY}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
