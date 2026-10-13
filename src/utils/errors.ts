import axios from 'axios';

/** Pesan error yang ramah dari respons Laravel ({message, errors}) atau masalah jaringan. */
export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) {
      return e.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : 'Cannot reach the server. Check your internet connection.';
    }
    const body = e.response.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstField = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstField || body?.message || `Request failed (${e.response.status}).`;
  }
  return e instanceof Error ? e.message : 'Something went wrong.';
}

export function getErrorStatus(e: unknown): number | undefined {
  return axios.isAxiosError(e) ? e.response?.status : undefined;
}

export function getErrorData<T>(e: unknown): T | undefined {
  return axios.isAxiosError(e) ? (e.response?.data as { data?: T } | undefined)?.data : undefined;
}
