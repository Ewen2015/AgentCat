import { GoogleGenAI, Type } from "@google/genai";
import { AgentResponse } from '../types';

// ========================================
// Gemini AI 服务 - 管理与Google Gemini API的交互
// ========================================

// 延迟初始化 - 直到首次使用时才创建客户端
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    console.log('Gemini Service: 正在初始化 GoogleGenAI 客户端，API Key:', process.env.API_KEY ? '已设置' : '未设置');
    if (!process.env.API_KEY) {
      console.error('Gemini Service: API_KEY 未定义！请检查 .env 文件');
      throw new Error('Gemini API Key not found. Please set GEMINI_API_KEY in .env file');
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * 分析当前页面上下文并发现潜在任务
 * Analyzes the current page context and discovers potential tasks.
 */
export const discoverPageTasks = async (pageContent: string): Promise<string[]> => {
  console.log('Gemini Service: 正在发现页面任务，内容长度:', pageContent.length);
  try {
    const prompt = `
      You are an intelligent browser assistant. 
      Analyze the following web page content (provided as simplified HTML/Text).
      Identify 3-4 distinct, actionable tasks that a user might want to perform on this specific page.
      Keep them short (under 10 words).
      
      Page Content:
      ${pageContent.substring(0, 10000)}
    `;

    console.log('Gemini Service: 正在向 Gemini 发送任务发现提示');
    const response = await getAiClient().models.generateContent({
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
    console.log('Gemini Service: 已接收任务发现响应:', text);
    if (!text) return ["总结此页面", "查找关键信息", "提取链接"];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini Service: 发现任务时出错:", error);
    return ["总结页面", "分析情感", "列出主要话题"];
  }
};

/**
 * 执行页面内容上的特定任务
 * Executes a specific task on the page content.
 */
export const executeAgentTask = async (
  pageContent: string, 
  userTask: string
): Promise<AgentResponse> => {
  console.log('Gemini Service: 执行任务:', userTask, '，页面内容长度:', pageContent.length);
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

    console.log('Gemini Service: 正在向 Gemini 发送执行任务提示');
    const response = await getAiClient().models.generateContent({
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
    console.log('Gemini Service: 已接收执行任务响应:', text);
    if (!text) throw new Error("AI 未返回响应");

    const result = JSON.parse(text) as AgentResponse;
    console.log('Gemini Service: 解析的响应:', result);
    return result;

  } catch (error) {
    console.error("Gemini Service: 代理执行错误:", error);
    return {
      message: "处理该任务时遇到错误。请重试。",
      actions: ["错误: 无法处理请求"]
    };
  }
};