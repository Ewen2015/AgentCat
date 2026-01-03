// Allows users to open the side panel by clicking the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('SideMate: Failed to set panel behavior:', error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('SideMate AI Agent: Extension installed successfully');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('SideMate AI Agent: Extension started up');
});

// Log when side panel is opened
chrome.sidePanel.onPanelShown?.addListener((window) => {
  console.log('SideMate AI Agent: Side panel opened');
});

chrome.sidePanel.onPanelHidden?.addListener((window) => {
  console.log('SideMate AI Agent: Side panel closed');
});