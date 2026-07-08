// sidepanel.js — 侧边栏核心逻辑
// 职责：数据管理、分类渲染、填充/编辑模式切换、与 content script 通信

(function () {
  'use strict';

  // ========== 状态 ==========
  let resumeData = null;
  let isEditMode = false;
  let activeTabId = null;
  let toastTimer = null;

  // DOM 引用
  const modeToggle = document.getElementById('modeToggle');
  const resetBtn = document.getElementById('resetBtn');
  const focusHint = document.getElementById('focusHint');
  const toast = document.getElementById('toast');
  const categoriesEl = document.getElementById('categories');

  // ========== 初始化 ==========
  async function init() {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabId = tab?.id;

    // 加载数据
    const result = await chrome.storage.local.get(['resumeData']);
    if (result.resumeData) {
      resumeData = result.resumeData;
    } else {
      resumeData = JSON.parse(JSON.stringify(DEFAULT_DATA));
      await chrome.storage.local.set({ resumeData });
    }

    render();
    refreshFocusHint();

    // 定时刷新焦点提示
    setInterval(refreshFocusHint, 1500);
  }

  // ========== 渲染 ==========
  function render() {
    categoriesEl.innerHTML = '';

    resumeData.categories.forEach(function (cat, catIdx) {
      const panel = createCategoryPanel(cat, catIdx);
      categoriesEl.appendChild(panel);
    });
  }

  function createCategoryPanel(cat, catIdx) {
    const panel = document.createElement('div');
    panel.className = 'category-panel';
    panel.dataset.catId = cat.id;

    // 标题栏
    const header = document.createElement('div');
    header.className = 'category-header';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'cat-icon';
    iconSpan.textContent = cat.icon;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'cat-name';
    nameSpan.textContent = cat.name;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'category-title';
    titleSpan.appendChild(iconSpan);
    titleSpan.appendChild(nameSpan);

    // 编辑模式：点击名称和图标可编辑；填充模式：点击折叠
    if (isEditMode) {
      iconSpan.style.cursor = 'pointer';
      iconSpan.title = '点击修改图标（emoji）';
      iconSpan.addEventListener('click', function (e) {
        e.stopPropagation();
        startCategoryIconEdit(iconSpan, cat, catIdx);
      });

      nameSpan.style.cursor = 'text';
      nameSpan.title = '点击修改分类名称';
      nameSpan.addEventListener('click', function (e) {
        e.stopPropagation();
        startCategoryNameEdit(nameSpan, cat, catIdx);
      });

      // 编辑模式下只有点击空白区域才折叠
      titleSpan.addEventListener('click', function (e) {
        if (e.target === titleSpan) {
          panel.classList.toggle('collapsed');
        }
      });
    } else {
      titleSpan.addEventListener('click', function () {
        panel.classList.toggle('collapsed');
      });
    }

    const headerActions = document.createElement('div');
    headerActions.className = 'header-actions';

    if (isEditMode) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-icon';
      addBtn.innerHTML = '＋';
      addBtn.title = '添加字段';
      addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        addField(catIdx);
      });
      headerActions.appendChild(addBtn);

      const delCatBtn = document.createElement('button');
      delCatBtn.className = 'btn-icon btn-danger';
      delCatBtn.innerHTML = '✕';
      delCatBtn.title = '删除分类';
      delCatBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteCategory(catIdx);
      });
      headerActions.appendChild(delCatBtn);
    }

    header.appendChild(titleSpan);
    header.appendChild(headerActions);
    panel.appendChild(header);

    // 字段列表
    const fieldList = document.createElement('div');
    fieldList.className = 'field-list';
    fieldList.dataset.mode = isEditMode ? 'edit' : 'fill';

    // 把字段按数字前缀分组，每组一段经历
    var groups = [];
    var currentGroup = null;
    cat.fields.forEach(function (field) {
      var gid = getGroupNumber(field.label);
      if (gid === 0) gid = -1; // 无数字的字段放一组
      if (!currentGroup || currentGroup.id !== gid) {
        currentGroup = { id: gid, fields: [], label: null };
        groups.push(currentGroup);
      }
      // 每个分组的第一条（通常是公司名或项目名）作为组标题
      if (!currentGroup.label && gid > 0) {
        currentGroup.label = field.value;
      }
      currentGroup.fields.push(field);
    });

    // 如果是单组（全部无数字），不包装直接渲染
    if (groups.length <= 1) {
      cat.fields.forEach(function (field, fieldIdx) {
        fieldList.appendChild(createFieldRow(cat, catIdx, field, fieldIdx));
      });
    } else {
      groups.forEach(function (grp) {
        var card = document.createElement('div');
        card.className = 'group-card';

        if (grp.label) {
          var cardHead = document.createElement('div');
          cardHead.className = 'group-card-head';
          cardHead.textContent = grp.label;
          if (isEditMode) {
            cardHead.title = '点击编辑分块标题';
            cardHead.addEventListener('click', function () {
              // 编辑该分块第一字段的值（即公司名/项目名）
              var firstField = grp.fields[0];
              var idx = cat.fields.indexOf(firstField);
              // 需要重新渲染才能拿到 DOM，所以走简单路径：直接弹 prompt
              var newVal = prompt('修改标题', grp.label);
              if (newVal && newVal.trim() !== '') {
                firstField.value = newVal.trim();
                grp.label = newVal.trim();
                cardHead.textContent = newVal.trim();
                saveData();
              }
            });
          }
          card.appendChild(cardHead);
        }

        grp.fields.forEach(function (field, fieldIdx) {
          var realIdx = cat.fields.indexOf(field);
          card.appendChild(createFieldRow(cat, catIdx, field, realIdx));
        });

        fieldList.appendChild(card);
      });
    }

    panel.appendChild(fieldList);
    return panel;
  }

  function createFieldRow(cat, catIdx, field, fieldIdx) {
    const row = document.createElement('div');
    row.className = 'field-row';

    // 编辑模式：拖拽手柄
    if (isEditMode) {
      const grip = document.createElement('span');
      grip.className = 'drag-grip';
      grip.innerHTML = '⠿';
      grip.title = '拖拽排序';
      row.appendChild(grip);
    }

    const labelEl = document.createElement('span');
    labelEl.className = 'field-label';
    labelEl.textContent = field.label;

    const valueEl = document.createElement('span');
    valueEl.className = 'field-value';
    valueEl.textContent = field.value;
    valueEl.title = field.value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);

    // 填充模式：点击填充
    if (!isEditMode) {
      row.classList.add('fill-mode');
      row.addEventListener('click', function () {
        handleFill(field.value, row);
      });
    }
    // 编辑模式：拖拽 + 点击编辑
    else {
      row.classList.add('edit-mode');
      row.draggable = true;
      row.dataset.catIdx = catIdx;
      row.dataset.fieldIdx = fieldIdx;

      // 拖拽事件
      row.addEventListener('dragstart', handleDragStart);
      row.addEventListener('dragend', handleDragEnd);
      row.addEventListener('dragover', handleDragOver);
      row.addEventListener('drop', handleDrop);
      row.addEventListener('dragleave', handleDragLeave);

      // 手柄上禁止触发编辑（防止拖拽时误入编辑）
      labelEl.addEventListener('click', function (e) {
        e.stopPropagation();
        startInlineEdit(labelEl, field, 'label', catIdx, fieldIdx);
      });

      valueEl.addEventListener('click', function (e) {
        e.stopPropagation();
        startInlineEdit(valueEl, field, 'value', catIdx, fieldIdx);
      });

      // 删除按钮
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-icon btn-danger btn-sm';
      delBtn.innerHTML = '×';
      delBtn.title = '删除此字段';
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteField(catIdx, fieldIdx);
      });
      row.appendChild(delBtn);
    }

    return row;
  }

  // ========== 拖拽排序 ==========
  let dragSourceCatIdx = null;
  let dragSourceFieldIdx = null;

  function handleDragStart(e) {
    dragSourceCatIdx = parseInt(this.dataset.catIdx);
    dragSourceFieldIdx = parseInt(this.dataset.fieldIdx);

    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Firefox 需要
  }

  function handleDragEnd(e) {
    this.classList.remove('dragging');
    dragSourceCatIdx = null;
    dragSourceFieldIdx = null;

    // 清除所有 drop-target 高亮
    document.querySelectorAll('.field-row.drop-target').forEach(function (el) {
      el.classList.remove('drop-target');
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const targetCatIdx = parseInt(this.dataset.catIdx);
    const targetFieldIdx = parseInt(this.dataset.fieldIdx);

    // 只允许同分类内拖拽
    if (targetCatIdx !== dragSourceCatIdx) return;

    // 清除其他元素的高亮
    document.querySelectorAll('.field-row.drop-target').forEach(function (el) {
      el.classList.remove('drop-target');
    });
    this.classList.add('drop-target');
  }

  function handleDragLeave(e) {
    this.classList.remove('drop-target');
  }

  function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-target');

    const targetCatIdx = parseInt(this.dataset.catIdx);
    const targetFieldIdx = parseInt(this.dataset.fieldIdx);

    // 校验：同分类且源和目标不同
    if (targetCatIdx !== dragSourceCatIdx) return;
    if (dragSourceFieldIdx === targetFieldIdx) return;
    if (dragSourceFieldIdx === null || targetFieldIdx === null) return;

    // 移动数组元素
    const cat = resumeData.categories[targetCatIdx];
    const [moved] = cat.fields.splice(dragSourceFieldIdx, 1);
    cat.fields.splice(targetFieldIdx, 0, moved);

    saveData();
    render();
  }

  // ========== 内联编辑 ==========
  function startInlineEdit(el, field, key, catIdx, fieldIdx) {
    // 防止重复编辑
    if (el.querySelector('input, textarea')) return;

    var originalText = field[key];
    var isMultiline = (key === 'value');
    var editor;

    if (isMultiline) {
      // 多行文本 → 使用 textarea，Enter 换行，Ctrl+Enter 保存
      editor = document.createElement('textarea');
      editor.className = 'inline-editor inline-textarea';
      editor.rows = 2;
    } else {
      // 单行文本 → 使用 input，Enter 保存
      editor = document.createElement('input');
      editor.type = 'text';
      editor.className = 'inline-editor';
    }

    editor.value = originalText;
    el.textContent = '';
    el.appendChild(editor);
    editor.focus();
    editor.select();

    function save() {
      var newVal = editor.value;
      // 多行字段保留首尾空白行，不 trim
      if (!isMultiline) {
        newVal = newVal.trim();
      }
      if (newVal && newVal !== originalText) {
        field[key] = newVal;
        saveData();
        el.textContent = newVal;
      } else {
        el.textContent = originalText;
      }
    }

    editor.addEventListener('blur', save);
    editor.addEventListener('keydown', function (e) {
      if (isMultiline) {
        // textarea: Ctrl+Enter 保存，Escape 取消，Enter 自然换行
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          editor.blur();
        }
        if (e.key === 'Escape') {
          editor.value = originalText;
          editor.blur();
        }
      } else {
        // input: Enter 保存，Escape 取消
        if (e.key === 'Enter') {
          e.preventDefault();
          editor.blur();
        }
        if (e.key === 'Escape') {
          editor.value = originalText;
          editor.blur();
        }
      }
    });
  }

  // 内联编辑分类名称
  function startCategoryNameEdit(el, cat, catIdx) {
    if (el.querySelector('input')) return;

    const original = cat.name;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-editor cat-name-editor';
    input.value = original;
    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();

    function save() {
      const newVal = input.value.trim();
      if (newVal && newVal !== original) {
        cat.name = newVal;
        saveData();
        el.textContent = newVal;
      } else {
        el.textContent = original;
      }
    }

    input.addEventListener('blur', save);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') { input.value = original; input.blur(); }
    });
  }

  // 内联编辑分类图标（emoji）
  function startCategoryIconEdit(el, cat, catIdx) {
    if (el.querySelector('input')) return;

    const original = cat.icon;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-editor cat-icon-editor';
    input.value = original;
    input.maxLength = 2;
    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();

    function save() {
      const newVal = input.value.trim() || original;
      if (newVal !== original) {
        cat.icon = newVal;
        saveData();
        el.textContent = newVal;
      } else {
        el.textContent = original;
      }
    }

    input.addEventListener('blur', save);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') input.blur();
      if (e.key === 'Escape') { input.value = original; input.blur(); }
    });
  }

  // ========== 字段增删 ==========
  function addField(catIdx) {
    const cat = resumeData.categories[catIdx];
    cat.fields.push({ label: '新字段', value: '内容' });
    saveData();
    render();
  }

  function deleteField(catIdx, fieldIdx) {
    const cat = resumeData.categories[catIdx];
    cat.fields.splice(fieldIdx, 1);
    saveData();
    render();
  }

  function addCategory() {
    const id = 'cat_' + Date.now();
    resumeData.categories.push({
      id: id,
      name: '新分类',
      icon: '📌',
      fields: [{ label: '新字段', value: '内容' }],
    });
    saveData();
    render();
  }

  function deleteCategory(catIdx) {
    if (resumeData.categories.length <= 1) {
      showToast('至少保留一个分类', 'error');
      return;
    }
    resumeData.categories.splice(catIdx, 1);
    saveData();
    render();
  }

  // ========== 填充逻辑 ==========
  async function handleFill(value, rowEl) {
    if (!activeTabId) {
      showToast('无法获取当前页面', 'error');
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(activeTabId, {
        type: 'FILL',
        value: value,
      });

      if (response && response.success) {
        // 视觉反馈
        rowEl.classList.add('filled');
        showToast('✅ 已填入', 'success');
        setTimeout(function () {
          rowEl.classList.remove('filled');
        }, 1200);
      } else {
        const errMsg = response ? response.error : '填充失败';
        showToast('❌ ' + errMsg, 'error');
        // 闪烁提示行
        rowEl.classList.add('fill-error');
        setTimeout(function () {
          rowEl.classList.remove('fill-error');
        }, 600);
      }
    } catch (err) {
      // content script 可能未注入（如 chrome:// 页面）
      showToast('⚠️ 当前页面不支持填充', 'error');
      rowEl.classList.add('fill-error');
      setTimeout(function () {
        rowEl.classList.remove('fill-error');
      }, 600);
    }
  }

  // ========== 焦点提示 ==========
  async function refreshFocusHint() {
    if (!activeTabId) return;

    try {
      const response = await chrome.tabs.sendMessage(activeTabId, {
        type: 'CHECK_FOCUS',
      });

      if (response && response.hasFocus) {
        let info = response.tag;
        if (response.type) info += '[' + response.type + ']';
        if (response.placeholder) info += ' → ' + response.placeholder;
        if (response.id) info += ' #' + response.id;
        if (response.currentValue) info += ' (已有: ' + truncate(response.currentValue, 20) + ')';
        focusHint.innerHTML = '📍 已聚焦: <code>' + escapeHtml(info) + '</code>';
        focusHint.className = 'focus-hint ready';
      } else {
        focusHint.innerHTML = '👆 请先在网页上点击要填入的输入框';
        focusHint.className = 'focus-hint';
      }
    } catch (e) {
      // content script 可能未注入（新加载的页面、chrome:// 页面等），尝试重新注入
      if (activeTabId) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ['content.js'],
          });
          focusHint.innerHTML = '👆 请先在网页上点击要填入的输入框';
          focusHint.className = 'focus-hint';
        } catch (e2) {
          focusHint.innerHTML = '🔒 当前页面不支持（chrome:// 或系统页面）';
          focusHint.className = 'focus-hint error';
        }
      }
    }
  }

  // ========== 模式切换 ==========
  function toggleMode() {
    isEditMode = !isEditMode;

    if (isEditMode) {
      modeToggle.textContent = '✏️ 编辑';
      modeToggle.className = 'btn-mode editing';
    } else {
      modeToggle.textContent = '🔒 填充';
      modeToggle.className = 'btn-mode';
    }

    render();

    // 编辑模式下显示添加分类按钮
    if (isEditMode) {
      const addCatBtn = document.createElement('button');
      addCatBtn.id = 'addCatBtn';
      addCatBtn.className = 'btn-add-cat';
      addCatBtn.textContent = '+ 添加分类';
      addCatBtn.addEventListener('click', addCategory);
      categoriesEl.appendChild(addCatBtn);
    }
  }

  // ========== 重置 ==========
  async function resetToDefaults() {
    if (!confirm('确定恢复为默认数据？你做的修改将丢失。')) return;

    resumeData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await chrome.storage.local.set({ resumeData });
    render();
    showToast('✅ 已恢复默认数据', 'success');
  }

  // ========== 数据持久化 ==========
  async function saveData() {
    await chrome.storage.local.set({ resumeData });
  }

  // ========== Toast ==========
  function showToast(message, type) {
    if (toastTimer) clearTimeout(toastTimer);

    toast.textContent = message;
    toast.className = 'toast toast-' + (type || 'info') + ' visible';

    toastTimer = setTimeout(function () {
      toast.className = 'toast';
    }, 1800);
  }

  // ========== 工具函数 ==========
  // 从字段标签中提取分组数字：公司1→1, 描述2-1→2, 项目3名称→3, 语言→0
  function getGroupNumber(label) {
    var m = label.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function truncate(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '…' : text;
  }

  // ========== 事件绑定 ==========
  modeToggle.addEventListener('click', toggleMode);
  resetBtn.addEventListener('click', resetToDefaults);

  // ========== 启动 ==========
  init();
})();
