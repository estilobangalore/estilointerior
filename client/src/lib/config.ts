// Base URL for API requests
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://beautiful-interiors.vercel.app' // Replace with your actual Vercel domain
  : ''; // Empty string for local development (same origin) 