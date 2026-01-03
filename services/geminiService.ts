import { GoogleGenAI, Type } from "@google/genai";
import { AgentResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Analyzes the current page context and discovers potential tasks.
 */
export const discoverPageTasks = async (pageContent: string): Promise<string[]> => {
  try {
    const prompt = `
      You are an intelligent browser assistant. 
      Analyze the following web page content (provided as simplified HTML/Text).
      Identify 3-4 distinct, actionable tasks that a user might want to perform on this specific page.
      Keep them short (under 10 words).
      
      Page Content:
      ${pageContent.substring(0, 10000)}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        }
      }
    });

    const text = response.text;
    if (!text) return ["Summarize this page", "Find key information", "Extract links"];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error discovering tasks:", error);
    return ["Summarize page", "Analyze sentiment", "List main topics"];
  }
};

/**
 * Executes a specific task on the page content.
 */
export const executeAgentTask = async (
  pageContent: string, 
  userTask: string
): Promise<AgentResponse> => {
  try {
    const prompt = `
      You are a browser automation agent. 
      The user wants to perform a task on the current web page.
      
      Page Context:
      ${pageContent.substring(0, 15000)}
      
      User Task: "${userTask}"
      
      Please analyze the page and simulate the execution of this task.
      Return a JSON object with:
      1. 'message': A summary of what you did or the answer to the user's question.
      2. 'actions': A list of simulated steps you took (e.g., "Scrolled to section X", "Extracted price", "Clicked button").
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            actions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["message", "actions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AgentResponse;

  } catch (error) {
    console.error("Agent execution error:", error);
    return {
      message: "I encountered an error trying to process that task. Please try again.",
      actions: ["Error: Failed to process request"]
    };
  }
};