import { Request, Response } from 'express';
import { generateContent, chatWithGemini } from '../services/gemini.service';

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { subjects, difficulty, goals } = req.body;
    const prompt = `As an AI study tutor, recommend study plans for a ${difficulty || 'intermediate'} level student interested in ${(subjects || []).join(', ')}. Their goals: ${goals || 'general learning'}.

Return your response as a JSON object with this exact format:
{
  "recommendations": [
    {
      "title": "Plan title",
      "description": "Brief description",
      "subject": "Subject area",
      "difficulty": "${difficulty || 'Intermediate'}",
      "duration": "Estimated duration",
      "topics": ["topic1", "topic2"]
    }
  ]
}

Provide 3-5 recommendations. Return ONLY valid JSON, no markdown or extra text.`;

    const result = await generateContent(prompt);
    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return res.json(parsed);
      }
    } catch (e) { /* fall through */ }
    res.json({ recommendations: [], rawResponse: result });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const generatePlan = async (req: Request, res: Response) => {
  try {
    const { topic, duration, difficulty, goals } = req.body;
    const prompt = `Create a detailed study plan for "${topic}" at ${difficulty || 'intermediate'} level, spanning ${duration || '4 weeks'}.
${goals ? `Goals: ${goals}` : ''}

Return your response as a JSON object with this exact format:
{
  "title": "Study plan title",
  "shortDescription": "A compelling 1-2 sentence summary (max 150 chars)",
  "fullDescription": "A detailed multi-paragraph description of the plan, including weekly breakdown and learning objectives",
  "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
}

Return ONLY valid JSON, no markdown code blocks or extra text.`;

    const result = await generateContent(prompt);
    try {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return res.json(parsed);
      }
    } catch (e) { /* fall through */ }
    // Fallback: return raw text as description
    res.json({
      title: topic,
      shortDescription: `A comprehensive ${duration || ''} study plan for ${topic}`,
      fullDescription: result,
      topics: [topic]
    });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    // Transform history format: frontend sends {role, parts} but our service expects {role, content}
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role || 'user',
      content: msg.parts?.[0]?.text || msg.content || ''
    }));

    const responseText = await chatWithGemini(message, formattedHistory);

    let suggestions: string[] = [];
    try {
      const suggestionsPrompt = `Based on this conversation response: "${String(responseText).substring(0, 400)}", suggest 3 short follow-up questions the user might ask. Return ONLY a JSON array of strings like ["question1", "question2", "question3"].`;
      const suggRaw = await generateContent(suggestionsPrompt);
      if (suggRaw) {
        const match = suggRaw.match(/\[[\s\S]*\]/);
        if (match) {
          suggestions = JSON.parse(match[0]);
        }
      }
    } catch (e) { /* ignore suggestions error */ }

    res.json({ response: responseText, suggestions });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};
