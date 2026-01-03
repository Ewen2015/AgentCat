import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageRole, AgentResponse } from '../types';
import * as GeminiService from '../services/geminiService';
import { marked } from 'marked';

interface AgentSidebarProps {
  pageContent: string;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ pageContent }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    // Only set initial greeting if chat is empty
    if (messages.length === 0) {
      setMessages([
        {
          id: 'init',
          role: MessageRole.AGENT,
          content: "Hello! I'm ready to help. Use the controls above to assign tasks.",
          timestamp: Date.now(),
        }
      ]);
    }
  }, [messages.length]);

  const addMessage = (role: MessageRole, content: string, actionItems?: string[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: Date.now(),
      actionItems
    }]);
  };

  const executeTask = async (taskDescription: string, isAuto: boolean = false) => {
    if (isLoading) return;
    setIsLoading(true);

    if (!isAuto) {
        addMessage(MessageRole.USER, taskDescription);
    }

    // Add thinking placeholder
    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [...prev, {
        id: thinkingId,
        role: MessageRole.AGENT,
        content: isAuto ? "Analyzing page and identifying key tasks..." : "Processing task...",
        timestamp: Date.now(),
        isThinking: true
    }]);

    try {
        let response: AgentResponse;
        
        if (isAuto) {
            // Auto mode: Discover tasks first, then maybe summarize
            const tasks = await GeminiService.discoverPageTasks(pageContent);
            const autoTask = "Summarize this page and list the most important actions a user can take.";
            // We basically ask the agent to do a general helpful action
            response = await GeminiService.executeAgentTask(pageContent, autoTask);
            
            // Append discovered tasks to the response message for better context
            response.message = `**Analysis Complete.**\n\n${response.message}\n\n**Suggested Follow-up Tasks:**\n${tasks.map(t => `* ${t}`).join('\n')}`;
        } else {
            response = await GeminiService.executeAgentTask(pageContent, taskDescription);
        }
        
        // Remove thinking, add real response
        setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
            id: Date.now().toString(),
            role: MessageRole.AGENT,
            content: response.message,
            actionItems: response.actions,
            timestamp: Date.now()
        }));

    } catch (error) {
        setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
            id: Date.now().toString(),
            role: MessageRole.AGENT,
            content: "Sorry, I encountered an error while processing.",
            timestamp: Date.now()
        }));
    } finally {
        setIsLoading(false);
    }
  };

  const handleManualExecute = () => {
    if (!input.trim()) return;
    executeTask(input);
    setInput('');
  };

  const handleAutoDetect = () => {
    executeTask("Auto-detect", true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualExecute();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 select-text">
      
      {/* 
         === TOP SECTION: Controls === 
         Includes Auto-Detect button and Manual Input Task
      */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col space-y-4 shadow-sm z-10">
         
         {/* 1. Auto Detect Button */}
         <button 
           onClick={handleAutoDetect}
           disabled={isLoading}
           className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
         >
             <span className="text-lg group-hover:animate-pulse">✨</span>
             <span className="font-semibold text-sm">One-Click Auto Analysis</span>
         </button>

         {/* Separator with text */}
         <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>OR CUSTOM TASK</span>
            <div className="flex-1 h-px bg-gray-200"></div>
         </div>

         {/* 2. Manual Task Input */}
         <div className="relative">
            <textarea
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3 pr-10 resize-none shadow-sm transition-shadow"
                placeholder="Type a task (e.g., 'Find the cheapest item')"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            ></textarea>
            
            {/* Execute Button (Icon inside textarea) */}
            <button
                onClick={handleManualExecute}
                disabled={!input.trim() || isLoading}
                className={`absolute bottom-2 right-2 p-2 rounded-md transition-all ${
                    input.trim() && !isLoading 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Execute Task"
            >
                {isLoading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                )}
            </button>
         </div>
      </div>

      {/* 
         === BOTTOM SECTION: Continuous Dialogue === 
         Scrollable area for chat history
      */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
            
            {/* Role Label */}
            <span className={`text-[10px] font-bold text-gray-400 mb-1 px-1 uppercase tracking-wider`}>
                {msg.role === MessageRole.USER ? 'You' : 'Agent'}
            </span>

            {/* Bubble */}
            <div 
              className={`max-w-[95%] rounded-2xl px-5 py-4 text-sm shadow-sm leading-relaxed
                ${msg.role === MessageRole.USER 
                  ? 'bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200' 
                  : 'bg-indigo-50/50 text-gray-800 rounded-tl-none border border-indigo-100'
                }
                ${msg.isThinking ? 'animate-pulse' : ''}
              `}
            >
              <div className="markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}></div>
              
              {/* Action Steps Log */}
              {msg.actionItems && msg.actionItems.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-black/5">
                      <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                          Process Log
                      </p>
                      <div className="bg-white/60 rounded-lg p-2 space-y-1.5 border border-black/5">
                          {msg.actionItems.map((action, idx) => (
                              <div key={idx} className="flex items-start text-xs text-gray-600">
                                  <span className="text-green-500 font-bold mr-2 text-[10px] mt-0.5">●</span>
                                  <span>{action}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AgentSidebar;