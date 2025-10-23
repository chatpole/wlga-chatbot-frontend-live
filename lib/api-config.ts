// API configuration for WLGA AI Assistant

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const chatApi = {
  async sendMessage(message: string, sessionId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      });

      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};
