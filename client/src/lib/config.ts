// Base URL for API requests
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Using a relative URL works in both environments
  : ''; // Empty string for local development (same origin)

// API path mapping for auth endpoints
export const API_PATHS = {
  LOGIN: '/api/login',          // Direct endpoint in the consolidated API
  LOGOUT: '/api/logout',        // Direct endpoint in the consolidated API
  REGISTER: '/api/register',    // Direct endpoint in the consolidated API
  USER: '/api/user',            // Direct endpoint in the consolidated API
};

// Max retries for API requests
export const MAX_API_RETRIES = 2;

// Authentication timeout in milliseconds
export const AUTH_TIMEOUT = 30000; // 30 seconds 