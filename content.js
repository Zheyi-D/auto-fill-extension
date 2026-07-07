// content.js — 焦点追踪 + 表单填充（兼容 React/Vue 受控组件）
(function () {
  'use strict';

  let lastFocusedElement = null;

  // ---- 焦点监听 ----
  document.addEventListener('focusin', function (e) {
    const el = e.target;
    if (isFillable(el)) {
      lastFocusedElement = el;
    }
  }, true);

  function isFillable(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.isContentEditable) return true;
    // 常见富文本编辑器容器
    if (el.getAttribute && el.getAttribute('contenteditable') === 'true') return true;
    return false;
  }

  // ---- 消息处理 ----
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'FILL') {
      const result = fillField(request.value);
      sendResponse(result);
      return true;
    }

    if (request.type === 'CHECK_FOCUS') {
      sendResponse({
        hasFocus: !!lastFocusedElement,
        tag: lastFocusedElement ? lastFocusedElement.tagName.toLowerCase() : null,
        type: lastFocusedElement ? lastFocusedElement.type : null,
        placeholder: lastFocusedElement ? (lastFocusedElement.placeholder || '') : '',
        currentValue: lastFocusedElement ? lastFocusedElement.value : '',
        id: lastFocusedElement ? (lastFocusedElement.id || '') : '',
        name: lastFocusedElement ? (lastFocusedElement.name || '') : '',
      });
      return true;
    }
  });

  // ---- 填充逻辑 ----
  function fillField(value) {
    const el = lastFocusedElement;

    if (!el) {
      return { success: false, error: '请先点击网页上的输入框' };
    }
    if (!document.contains(el)) {
      lastFocusedElement = null;
      return { success: false, error: '输入框已从页面移除' };
    }

    try {
      const tag = el.tagName.toLowerCase();

      if (tag === 'select') {
        return fillSelect(el, value);
      }

      if (tag === 'input' || tag === 'textarea') {
        return fillInput(el, value);
      }

      if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') {
        return fillContentEditable(el, value);
      }

      return { success: false, error: '不支持的输入类型: ' + tag };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // 填充 input / textarea（核心：原生 setter + 事件派发）
  function fillInput(el, value) {
    el.focus();

    // 使用原生 value setter — 这是 React 能检测到变化的唯一方式
    const proto =
      el.tagName === 'INPUT'
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value');

    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(el, value);
    } else {
      el.value = value;
    }

    // React 内部 _valueTracker 也需要同步
    if (el._valueTracker) {
      el._valueTracker.setValue(el.value);
    }

    // 按顺序派发事件：input → change
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    return { success: true, filled: value };
  }

  // 填充 select
  function fillSelect(el, value) {
    el.focus();

    const search = value.toLowerCase().trim();
    let bestIdx = -1;

    for (let i = 0; i < el.options.length; i++) {
      const opt = el.options[i];
      if (!opt || opt.disabled) continue;

      const text = (opt.text || opt.label || '').toLowerCase().trim();
      const val = (opt.value || '').toLowerCase().trim();

      // 精确匹配优先
      if (text === search || val === search) {
        bestIdx = i;
        break;
      }
      // 包含匹配作为备选
      if (bestIdx === -1 && (text.includes(search) || search.includes(text))) {
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      el.selectedIndex = bestIdx;
      el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      return { success: true, filled: el.options[bestIdx].text };
    }

    return { success: false, error: '未找到匹配选项: ' + value };
  }

  // 填充 contenteditable（富文本编辑器）
  function fillContentEditable(el, value) {
    el.focus();
    el.textContent = value;
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    return { success: true, filled: value };
  }
})();
