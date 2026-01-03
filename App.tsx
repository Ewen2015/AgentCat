import React, { useState, useRef, useEffect } from 'react';
import MockBrowser, { MockBrowserHandle } from './components/MockBrowser';
import AgentSidebar from './components/AgentSidebar';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const browserRef = useRef<MockBrowserHandle>(null);
  const [pageContent, setPageContent] = useState('');
  
  // Sidebar resizing state
  const [sidebarWidthPercent, setSidebarWidthPercent] = useState(30); // Default approx 30%
  const [isResizing, setIsResizing] = useState(false);

  // Sync content when opening
  useEffect(() => {
    if (isSidebarOpen && browserRef.current) {
      setPageContent(browserRef.current.getPageContent());
    }
  }, [isSidebarOpen]);

  // Handle Resizing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault(); // Prevent text selection while dragging
      
      // Calculate new width based on mouse position from right edge
      const newWidthPx = document.body.clientWidth - e.clientX;
      const newWidthPercent = (newWidthPx / document.body.clientWidth) * 100;
      
      // Min 20%, Max 70% constraints
      if (newWidthPercent >= 20 && newWidthPercent <= 70) {
        setSidebarWidthPercent(newWidthPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Sidebar closing if click logic existed there
    setIsResizing(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden font-sans text-gray-900 select-none">
       {/* 
         === Chrome Browser Shell === 
         Simulating the actual browser window frame
       */}
       
       {/* Tab Bar */}
       <div className="h-10 bg-[#dfe3e7] flex items-end px-2 space-x-2 pt-2 shrink-0">
          {/* Active Tab */}
          <div className="w-60 bg-white rounded-t-lg h-full px-3 flex items-center justify-between text-xs text-gray-700 shadow-sm relative z-10">
             <div className="flex items-center space-x-2 truncate">
                <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">A</span>
                <span className="truncate">NeuroSound X1 Headphones</span>
             </div>
             <span className="hover:bg-gray-200 rounded-full p-1 cursor-pointer w-4 h-4 flex items-center justify-center">×</span>
          </div>
          {/* Inactive Tab */}
          <div className="w-48 hover:bg-white/40 rounded-t-lg h-[90%] px-3 flex items-center text-xs text-gray-600 cursor-pointer transition-colors">
             <span className="truncate">Google Search</span>
          </div>
          <div className="p-1.5 hover:bg-black/5 rounded-full text-gray-600 cursor-pointer">
             <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z"/></svg>
          </div>
       </div>

       {/* Navigation Toolbar */}
       <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 space-x-3 shadow-sm z-20 relative shrink-0">
          {/* Nav Controls */}
          <div className="flex space-x-1 text-gray-500">
             <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
               <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
             </button>
             <button className="hover:bg-gray-100 p-2 rounded-full transition-colors opacity-50 cursor-not-allowed">
               <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
             </button>
             <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
               <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
             </button>
          </div>
          
          {/* Address Bar */}
          <div className="flex-1 bg-gray-100 rounded-full h-9 flex items-center px-4 text-sm text-gray-700 focus-within:bg-white focus-within:shadow-inner focus-within:ring-2 focus-within:ring-indigo-200 transition-all border border-transparent focus-within:border-indigo-300 relative group cursor-text">
             <span className="text-gray-400 mr-3">🔒</span>
             <span className="flex-1 outline-none select-text">store.acme.com/products/neuro-headphones-x1</span>
             <div className="absolute right-3 flex items-center space-x-2">
                <span className="text-gray-400 hover:text-yellow-400 cursor-pointer transition-colors">★</span>
             </div>
          </div>

          {/* Extensions Toolbar */}
          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 ml-2">
             <div className="relative group">
                 {/* This is the Chrome Extension Icon Button */}
                 <button 
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className={`p-2 rounded-full transition-all duration-200 ${isSidebarOpen ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200' : 'hover:bg-gray-100 text-gray-600 grayscale hover:grayscale-0'}`}
                    title="Open SideMate Assistant"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                 </button>
             </div>
             <div className="w-8 h-8 ml-2 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90">
                U
             </div>
          </div>
       </div>

       {/* 
         === Viewport Content === 
       */}
       <div className="flex-1 flex overflow-hidden relative bg-gray-100">
          
          {/* Main Web Page Area - Resizes/Compresses when sidebar opens */}
          <div 
            className="h-full bg-white overflow-hidden shadow-sm transition-all duration-200 ease-out relative z-0"
            style={{ 
              width: isSidebarOpen ? `${100 - sidebarWidthPercent}%` : '100%',
              marginRight: isSidebarOpen ? 0 : 0
            }} 
          >
             <MockBrowser ref={browserRef} />
          </div>

          {/* Sidebar Area - Slides in from right */}
          <div 
             className="h-full bg-white shadow-xl transition-all duration-200 ease-out absolute right-0 top-0 bottom-0 overflow-hidden z-10 flex"
             style={{ 
               width: `${sidebarWidthPercent}%`,
               transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
             }}
          >
             {/* Resize Handle */}
             <div 
                onMouseDown={startResizing}
                className="w-1.5 h-full bg-gray-100 hover:bg-indigo-400 cursor-col-resize z-20 flex flex-col justify-center items-center group transition-colors border-l border-gray-200 active:bg-indigo-600"
                title="Drag to resize"
             >
               <div className="h-8 w-1 border-l-2 border-r-2 border-gray-300 group-hover:border-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>

             {/* Sidebar Content */}
             <div className="flex-1 flex flex-col h-full overflow-hidden">
                {isSidebarOpen && <AgentSidebar pageContent={pageContent} />}
             </div>
          </div>
       </div>
    </div>
  );
}

export default App;