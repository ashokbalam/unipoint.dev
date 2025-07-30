/**
 * API Configuration
 * 
 * This file provides configuration for API endpoints.
 * It uses environment variables when available and falls back to sensible defaults.
 */

// Check if we have an environment variable for the API URL
const envApiUrl = import.meta.env.VITE_API_URL;

// Determine the base URL based on environment
export const API_BASE_URL = envApiUrl 
  ? envApiUrl 
  : import.meta.env.PROD 
    ? '/api' // In production, use /api which will be handled by nginx proxy
    : 'http://localhost:4000'; // In development, use localhost directly

/**
 * Helper function to get a full API URL for a given endpoint
 * 
 * @param endpoint - The API endpoint (without leading slash)
 * @returns The complete API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Ensure base URL ends with a slash if it's not empty and doesn't already end with one
  const base = API_BASE_URL.endsWith('/') || API_BASE_URL === '' 
    ? API_BASE_URL 
    : `${API_BASE_URL}/`;
  
  return `${base}${cleanEndpoint}`;
};
