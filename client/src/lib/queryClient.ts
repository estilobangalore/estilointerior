import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from './config';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: any
): Promise<T> {
  try {
    // Add domain when in production
    const apiPath = `${API_BASE_URL}${path}`;
    console.log('Making API request to:', apiPath);
    
    const response = await fetch(apiPath, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check if the server is running or try again later.');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const apiPath = `${API_BASE_URL}${queryKey[0] as string}`;
    console.log('Making query to:', apiPath);
    
    const res = await fetch(apiPath, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('Query response data:', data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});
