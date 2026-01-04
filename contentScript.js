// ========================================
// 内容脚本 - 在网页中运行以提取内容
// ========================================

console.log('SideMate AI Agent: 内容脚本已在页面加载');

// ========== 监听来自扩展的消息 ==========
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('SideMate AI Agent: 接收到消息:', request.action);

  if (request.action === 'getPageContent') {
    // 提取页面内容并发送回去
    const pageContent = extractPageContent();
    console.log('SideMate AI Agent: 正在发送页面内容，长度:', pageContent.length);
    sendResponse({ content: pageContent });
  }
});

/**
 * 从当前页面提取有意义的内容
 * 移除脚本和样式，提取文本内容
 */
function extractPageContent() {
  try {
    // ========== 克隆并清理DOM ==========
    const clone = document.documentElement.cloneNode(true);
    const scripts = clone.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());

    // ========== 获取文本内容 ==========
    let text = clone.innerText || clone.textContent || '';

    // ========== 清理空白字符 ==========
    text = text
      .replace(/\n\n+/g, '\n\n') // 移除多余的换行符
      .replace(/[ \t]+/g, ' ') // 移除多余的空格
      .trim();

    // ========== 如果内容太短，尝试获取主要内容区域 ==========
    if (text.length < 100) {
      // 尝试查找主要内容容器
      const mainContent = 
        clone.querySelector('main') ||
        clone.querySelector('article') ||
        clone.querySelector('[role="main"]') ||
        clone.querySelector('.content') ||
        clone.querySelector('.main') ||
        clone.body;

      if (mainContent) {
        text = (mainContent.innerText || mainContent.textContent || '').trim();
      }
    }

    // ========== 限制内容长度为20000个字符 ==========
    if (text.length > 20000) {
      text = text.substring(0, 20000) + '\n\n[内容已截断...]';
    }

    return text || '无法提取页面内容';
  } catch (error) {
    console.error('SideMate AI Agent: 提取页面内容出错:', error);
    return '错误: 无法提取页面内容';
  }
}
