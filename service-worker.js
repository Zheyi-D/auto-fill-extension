// service-worker.js — 后台服务脚本
// 仅负责：①点击图标打开侧边栏  ②中转 content-script 消息

// 点击扩展图标 → 打开侧边栏
chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
});
