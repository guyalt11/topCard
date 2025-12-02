export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  history: ChatMessage[];
  prompt: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
  details?: string;
}

const API_URL = 'https://top-card.vercel.app/api/ai';

export const sendChatMessage = async (
  prompt: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        prompt,
      } as ChatRequest),
    });

    const data: ChatResponse = await response.json();

    if (!response.ok) {
      // Throw error with the message from the API
      throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to get AI response');
    }

    return data.response;
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
};
