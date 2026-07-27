import { GoogleGenerativeAI } from '@google/generative-ai';

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
};

export const generateContent = async (prompt: string): Promise<string> => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

export const chatWithGemini = async (
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> => {
  const model = getModel();

  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  return response.text();
};

export const streamChatWithGemini = async (
  message: string,
  history: Array<{ role: string; content: string }> = []
) => {
  const model = getModel();

  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
  });

  return await chat.sendMessageStream(message);
};
