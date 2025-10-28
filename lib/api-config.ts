/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Get the base API URL from environment variables
const getBaseApiUrl = (): string => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use local API in development, production API otherwise
  const baseUrl = isDevelopment 
    ? process.env.NEXT_PUBLIC_LOCAL_BASE_API 
    : process.env.NEXT_PUBLIC_BASE_API;
  
  // Fallback to hardcoded URL if environment variables are not set
  return baseUrl || 'http://54.221.45.105:5000';
};

// API Configuration object
export const apiConfig = {
  baseUrl: getBaseApiUrl(),
  
  // API endpoints
  endpoints: {
    chat: '/chat',
    // Add more endpoints here as needed
  },
  
  // Helper function to get full URL for an endpoint
  getUrl: (endpoint: string): string => {
    return `${apiConfig.baseUrl}${endpoint}`;
  },
  
  // Helper function to get chat endpoint URL
  getChatUrl: (): string => {
    return apiConfig.getUrl(apiConfig.endpoints.chat);
  },
};

// Default fetch options for API calls
export const defaultFetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to make API calls
export const apiCall = async (endpoint: string, data: any, options: RequestInit = {}) => {
  const url = apiConfig.getUrl(endpoint);
  const fetchOptions = {
    ...defaultFetchOptions,
    ...options,
    body: JSON.stringify(data),
  };
  
  return fetch(url, fetchOptions);
};

// Chat API helper
export const chatApi = {
  sendMessage: async (query: string, sessionId: string) => {
    return apiCall(apiConfig.endpoints.chat, { query, session_id: sessionId });
  },
};
