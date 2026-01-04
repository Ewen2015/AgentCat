import React, { useState, useRef } from 'react';
import { Message, MessageRole } from '../types';
import * as GeminiService from '../services/geminiService';
import { marked } from 'marked';

// ========================================
// AgentSidebar 组件 - 侧边栏主体
// 显示自动分析按钮、任务输入框和聊天消息
// ========================================

interface AgentSidebarProps {
  pageContent: string; // 从App传入的页面内容
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ pageContent }) => {
  console.log('AgentSidebar: 组件正在渲染，页面内容长度:', pageContent.length);
  
  // ========== 状态管理 ==========
  const [input, setInput] = useState(''); // 用户输入的任务
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: MessageRole.AGENT,
      content: "你好! 我已准备好帮助你。使用上面的控件来分配任务。",
      timestamp: Date.now(),
    }
  ]); // 聊天消息列表
  const messagesEndRef = useRef<HTMLDivElement>(null); // 滚动到底部的引用
  
  console.log('AgentSidebar: 状态已初始化', { inputLength: input.length, messagesCount: messages.length });

  // ========== 添加消息到列表 ==========
  const addMessage = (role: MessageRole, content: string, actionItems?: string[]) => {
    console.log('AgentSidebar: 添加消息', role);
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: Date.now(),
      actionItems
    }]);
  };

  // ========== 自动滚动到底部 ==========
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ========== 执行任务 ==========
  const executeTask = async (taskDescription: string, isAuto: boolean = false) => {
    console.log('AgentSidebar: 执行任务:', taskDescription, 'isAuto:', isAuto);
    if (isLoading) return;
    
    setIsLoading(true);

    // 注意：用户消息已在 handleManualExecute 中添加，这里无需重复添加
    // 只有自动模式可能需要添加任务描述

    // 添加思考状态
    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: MessageRole.AGENT,
      content: isAuto ? "正在分析页面并识别关键任务..." : "正在处理任务...",
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      let response;
      
      if (isAuto) {
        // ========== 自动模式：发现任务 ==========
        console.log('AgentSidebar: 自动模式 - 发现任务');
        const tasks = await GeminiService.discoverPageTasks(pageContent);
        console.log('AgentSidebar: 发现的任务:', tasks);
        
        // 执行自动分析
        const autoTask = "总结此页面的主要内容，并列出用户可以采取的最重要的操作。";
        const executeResponse = await GeminiService.executeAgentTask(pageContent, autoTask);
        
        // 将发现的任务添加到响应消息中
        response = {
          message: `**分析完成**\n\n${executeResponse.message}\n\n**建议的后续任务:**\n${tasks.map(t => `* ${t}`).join('\n')}`,
          actions: executeResponse.actions
        };
      } else {
        // ========== 手动模式：执行用户任务 ==========
        console.log('AgentSidebar: 手动模式 - 执行任务');
        response = await GeminiService.executeAgentTask(pageContent, taskDescription);
      }
      
      console.log('AgentSidebar: 任务执行成功:', response);
      
      // 替换思考消息为实际响应
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
        id: Date.now().toString(),
        role: MessageRole.AGENT,
        content: response.message,
        actionItems: response.actions,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('AgentSidebar: 执行任务出错:', error);
      setMessages(prev => prev.filter(m => m.id !== thinkingId).concat({
        id: Date.now().toString(),
        role: MessageRole.AGENT,
        content: "抱歉，处理此任务时遇到错误。请重试。",
        timestamp: Date.now()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 处理手动执行 ==========
  const handleManualExecute = () => {
    const taskText = input.trim();
    if (!taskText || isLoading) {
      console.log('AgentSidebar: 输入为空或正在加载，取消执行');
      return;
    }
    
    console.log('AgentSidebar: 手动执行:', taskText);
    
    // 先添加用户消息到列表
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role: MessageRole.USER,
      content: taskText,
      timestamp: Date.now(),
    }]);
    
    // 清空输入框
    setInput('');
    
    // 然后执行任务（但不再在executeTask中重复添加用户消息）
    executeTask(taskText, false);
  };

  // ========== 处理自动分析 ==========
  const handleAutoDetect = () => {
    if (isLoading) {
      console.log('AgentSidebar: 正在加载中，取消自动分析');
      return;
    }
    console.log('AgentSidebar: 触发自动分析');
    executeTask("Auto-detect", true);
  };

  // ========== 处理键盘事件 ==========
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.log('AgentSidebar: 键盘事件:', e.key, '是否按住Shift:', e.shiftKey);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('AgentSidebar: 检测到 Enter 键，触发发送');
      e.preventDefault();
      handleManualExecute();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 select-text">
      {console.log('AgentSidebar: 正在渲染 JSX')}
      
      {/* ========== 顶部控制区 ========== */}
      {/* 包含自动分析按钮和手动输入任务 */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col space-y-4 shadow-sm z-10">
         
         {/* 自动分析按钮 */}
         <button 
           disabled={isLoading}
           className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
           onClick={handleAutoDetect}
         >
             <span className="text-lg group-hover:animate-pulse">✨</span>
             <span className="font-semibold text-sm">一键自动分析</span>
         </button>

         {/* 分隔符 */}
         <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>或自定义任务</span>
            <div className="flex-1 h-px bg-gray-200"></div>
         </div>

         {/* 手动任务输入框 */}
         <div className="relative">
            <textarea
                className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3 pr-10 resize-none shadow-sm transition-shadow"
                placeholder="输入任务 (例如：'找到最便宜的商品')"
                rows={3}
                value={input}
                onChange={(e) => {
                  console.log('AgentSidebar: 输入框内容已更改:', e.target.value.length, '字符');
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            ></textarea>
            
            {/* 执行按钮 */}
            <button
                disabled={!input.trim() || isLoading}
                className={`absolute bottom-2 right-2 p-2 rounded-md transition-all ${
                    input.trim() && !isLoading 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="执行任务"
                onClick={handleManualExecute}
            >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
            </button>
         </div>
      </div>

      {/* ========== 聊天消息区 - 持续对话框 ========== */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-4">
        {messages.length === 1 ? (
          // 空状态：只有初始欢迎消息
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="h-12 w-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">开始对话吧！👇</p>
          </div>
        ) : (
          // 对话消息列表
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[85%]`}>
                {/* 发送者标签 */}
                <span className={`text-xs font-semibold mb-1 px-2 ${
                  msg.role === MessageRole.USER ? 'text-indigo-600' : 'text-green-600'
                }`}>
                  {msg.role === MessageRole.USER ? '你' : '助手'}
                </span>

                {/* 消息气泡 */}
                <div 
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === MessageRole.USER 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-green-50 text-gray-800 rounded-tl-none border border-green-100'
                  } ${msg.isThinking ? 'animate-pulse' : ''}`}
                >
                  {/* 消息内容 - 支持Markdown */}
                  <div className={`text-sm leading-relaxed break-words ${
                    msg.role === MessageRole.USER ? '' : 'markdown-content'
                  }`}>
                    {msg.role === MessageRole.USER ? (
                      msg.content
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                    )}
                  </div>

                  {/* 操作步骤列表 */}
                  {msg.actionItems && msg.actionItems.length > 0 && !msg.isThinking && (
                    <div className="mt-3 pt-3 border-t border-black/10">
                      <p className="text-[11px] font-bold text-gray-600 mb-2 uppercase tracking-wide flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        执行步骤
                      </p>
                      <div className="bg-white/60 rounded-lg p-2 space-y-1.5 border border-black/5">
                        {msg.actionItems.map((action, idx) => (
                          <div key={idx} className="flex items-start text-xs text-gray-700">
                            <span className="text-green-600 font-bold mr-2 mt-0.5">✓</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 时间戳 */}
                <span className="text-xs text-gray-400 mt-1 px-2">
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default AgentSidebar;
