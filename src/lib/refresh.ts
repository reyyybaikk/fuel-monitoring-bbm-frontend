// src/lib/refresh.ts – helper to silently refresh the access token
export async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // send refresh_token cookie
    });
    return res.ok; // backend will set a new auth_token cookie if successful
  } catch {
    return false;
  }
}
