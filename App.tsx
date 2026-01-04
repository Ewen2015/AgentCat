import React, { useState, useEffect } from 'react';
import AgentSidebar from './components/AgentSidebar';

// ========================================
// 主要App组件 - SideMate AI Agent侧边栏
// ========================================

function App() {
  const [pageContent, setPageContent] = useState('');
  
  // Extension State
  const [isExtensionMode, setIsExtensionMode] = useState(false);

  // 1. Detect Environment & Fetch Content
  useEffect(() => {
    // Check if running as a Chrome Extension
    // @ts-ignore - 'chrome' is not defined in standard React types unless configured
    const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
    
    if (isExtension) {
      setIsExtensionMode(true);
      
      // Fetch Real Tab Content
      try {
        // @ts-ignore
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id;
          if (tabId) {
             // @ts-ignore
             chrome.scripting.executeScript({
               target: { tabId: tabId },
               func: () => document.body.innerText
             }, (results: any[]) => {
               if (results && results[0] && results[0].result) {
                 setPageContent(results[0].result);
               }
             });
          }
        });
      } catch (e) {
        console.error("Failed to query tab:", e);
        
        // If we can't get page content, set a default message
        setPageContent("No page content available. You can chat with the AI agent directly.");
      }
    } else {
      // In web mode, we set a default message indicating this is a web demo
      setPageContent("Web Demo Mode. You can chat with the AI agent directly.");
    }
  }, []);

  // --- RENDER FOR CHROME EXTENSION (SIDE PANEL) ---
  if (isExtensionMode) {
    return (
      <div className="h-screen w-full bg-white overflow-hidden flex flex-col">
        {/* In Side Panel, we just show the sidebar content. Chrome handles the layout/resizing of the panel itself. */}
        <AgentSidebar pageContent={pageContent} />
      </div>
    );
  }

  // --- RENDER FOR WEB DEMO (Direct Chat) ---
  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-sans text-gray-900 select-none">
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-600">S</div>
          <div>
            <h1 className="font-bold text-base">SideMate AI Agent</h1>
            <p className="text-xs text-indigo-100">Web Demo Mode</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <AgentSidebar pageContent={pageContent} />
      </div>
    </div>
  );
}

export default App;