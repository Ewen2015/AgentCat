// ========================================
// 后台服务工作线程 - 管理侧边栏面板行为
// ========================================

// ========== 设置侧边栏行为 ==========
// 当用户点击扩展图标时打开侧边栏
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('SideMate: 设置面板行为失败:', error));

// ========== 扩展安装事件 ==========
chrome.runtime.onInstalled.addListener(() => {
  console.log('SideMate AI Agent: 扩展已安装成功');
});

// ========== 扩展启动事件 ==========
chrome.runtime.onStartup.addListener(() => {
  console.log('SideMate AI Agent: 扩展已启动');
});

// ========== 侧边栏显示事件 ==========
chrome.sidePanel.onPanelShown?.addListener((window) => {
  console.log('SideMate AI Agent: 侧边栏已打开');
});

// ========== 侧边栏隐藏事件 ==========
chrome.sidePanel.onPanelHidden?.addListener((window) => {
  console.log('SideMate AI Agent: 侧边栏已关闭');
});