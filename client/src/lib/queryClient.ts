import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL, MAX_API_RETRIES } from './config';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      // Clone the response before reading it
      const clonedRes = res.clone();
      // Try to get a more detailed error message from the response
      const errorData = await clonedRes.json();
      errorText = errorData.message || errorData.error || errorText;
    } catch (e) {
      // If parsing fails, try to get the text response
      try {
        // We can safely use res.text() here since res.json() failed
        errorText = await res.text();
      } catch (textError) {
        // Use status text as fallback
        console.error('Error parsing response:', textError);
      }
    }
    throw new Error(`${res.status}: ${errorText}`);
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
    console.log(`Making API ${method} request to:`, apiPath);
    
    // Add timestamp to prevent caching issues
    const urlWithTimestamp = apiPath + (apiPath.includes('?') ? '&' : '?') + '_t=' + Date.now();
    
    const response = await fetch(urlWithTimestamp, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Cache-Control": "no-cache, no-store, max-age=0",
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      
      try {
        // Clone the response before reading
        const errorResponseClone = response.clone();
        // Try to get a more detailed error message from the response
        errorData = await errorResponseClone.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If parsing fails, try to get the text response
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        } catch (textError) {
          console.error('Error parsing error response:', e);
        }
      }
      
      console.error('API error response:', errorMessage);
      console.error('Response status:', response.status);
      console.error('Response URL:', response.url);
      
      // Make sure the error message is a string
      let errorMessageString: string;
      if (errorMessage === null || errorMessage === undefined) {
        errorMessageString = `HTTP error! status: ${response.status}`;
      } else if (typeof errorMessage === 'string') {
        errorMessageString = errorMessage;
      } else if (typeof errorMessage === 'object') {
        try {
          errorMessageString = JSON.stringify(errorMessage);
        } catch (e) {
          errorMessageString = `HTTP error! status: ${response.status}`;
        }
      } else {
        errorMessageString = String(errorMessage);
      }
      
      // Create a custom error object with additional properties
      const error = new Error(errorMessageString);
      Object.assign(error, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: errorData
      });
      
      throw error;
    }

    // For empty responses (like 204 No Content), return empty object
    if (response.status === 204) {
      return {} as T;
    }

    // Handle potential empty response body
    try {
      // Clone the response so we can safely read the body without depleting the stream
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      
      if (!responseText.trim()) {
        console.log('Empty response body received, returning empty object');
        return {} as T;
      }
      
      try {
        // Try to parse as JSON
        const responseData = JSON.parse(responseText);
        console.log('API response data parsed successfully');
        return responseData;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        console.error('Response text was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (streamError) {
      console.error('Error reading response stream:', streamError);
      // If we can't read the response body for any reason, return an empty object
      // rather than failing completely
      return {} as T;
    }
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
    }
    if (error instanceof SyntaxError) {
      throw new Error('Invalid response from server. Please try again later.');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> =>
  async ({ queryKey }) => {
    const { on401: unauthorizedBehavior } = options;
    const apiPath = `${API_BASE_URL}${queryKey[0] as string}`;
    console.log('Making query to:', apiPath);
    
    try {
      const res = await fetch(apiPath, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store, max-age=0",
        },
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as unknown as T;
      }

      await throwIfResNotOk(res);
      
      // Handle empty responses
      const text = await res.text();
      if (!text.trim()) {
        return {} as unknown as T;
      }
      
      const data = JSON.parse(text);
      return data as T;
    } catch (error) {
      console.error('Query error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the server');
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute instead of Infinity
      retry: MAX_API_RETRIES,
    },
    mutations: {
      retry: MAX_API_RETRIES,
    },
  },
});
