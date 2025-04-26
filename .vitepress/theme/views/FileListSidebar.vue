<template>
  <div class="file-list-sidebar">
    <div class="sidebar-header">
      <h3 class="title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M4 5h4.58l2 2H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0-2a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.42l-2-2H4z"/>
        </svg>
        <span class="dir-name">{{ currentDir }}</span>
        <span class="count">{{ filteredFiles.length }}篇</span>
      </h3>

      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索文章..."
          class="search-input"
          aria-label="搜索文章"
        >
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M10 18a7.95 7.95 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.95 7.95 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"/>
        </svg>
      </div>

      <div class="sort-options">
        <span>排序:</span>
        <button @click="setSortBy('number')" :class="{ active: sortBy === 'number' }">编号</button>
        <button @click="setSortBy('title')" :class="{ active: sortBy === 'title' }">标题</button>
        <button @click="setSortBy('date')" :class="{ active: sortBy === 'date' }">日期</button>
      </div>

    </div>
    <div class="file-list" v-if="filteredFiles.length">
      <TransitionGroup name="list">
        <div
          v-for="(file) in filteredFiles"
          :key="file.link"
          class="file-item"
          :class="{ 'active': isActive(file.link) }"
        >
          <a :href="file.link">
            <div class="file-title">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.414a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 13.172 2H6zm0 2h7v4a1 1 0 0 0 1 1h4v9H6V4zm9 0v4h4l-4-4z"/>
              </svg>
              <span v-html="highlightMatch(file.title, searchQuery)"></span>
            </div>
            <div class="meta">
              <div class="tags">
                <span
                  v-for="(tag, tagIndex) in file.meta.tags"
                  :key="tagIndex"
                  class="tag"
                  v-html="highlightMatch(tag, searchQuery)"
                >
                  </span>
              </div>
              <span class="modified">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                {{ file.meta.modified }}
              </span>
            </div>
          </a>
        </div>
      </TransitionGroup>
    </div>
    <div v-else class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="currentColor" opacity="0.7" aria-hidden="true">
         <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-1 12H5a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2zm-1-4H5a1 1 0 0 1 0-2h13a1 1 0 0 1 0 2zm-1-4H5a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2z"/>
       </svg>
      <p>暂无相关文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vitepress'

// --- Props 定义 ---
const props = defineProps({
  // 文件对象数组，包含 title, link, meta (tags, modified)
  files: {
    type: Array,
    default: () => []
  },
  // 当前目录名称
  currentDir: {
    type: String,
    default: ''
  }
})

// --- 响应式状态 ---
const route = useRoute() // 获取当前路由信息
const searchQuery = ref('') // 搜索查询词
const sortBy = ref('number') // 当前排序方式 ('number', 'title', 'date')

// --- 辅助函数 ---

/**
 * @description 从字符串中提取第一个连续的数字。
 * 用于按文件名中的数字排序。
 * @param {string} str - 输入字符串 (通常是文件名/标题)
 * @returns {number} 提取到的数字，如果无数字则返回 Infinity (用于排序时排在最后)
 */
function extractNumberFromString(str) {
  if (!str) return Infinity; // 处理空字符串或 undefined
  const match = str.match(/\d+/)
  return match ? parseInt(match[0], 10) : Infinity
}

/**
 * @description 解析日期字符串 (YYYY-MM-DD) 为时间戳。
 * 用于按日期排序。处理无效日期。
 * @param {string} dateString - 日期字符串
 * @returns {number} 时间戳 (毫秒) 或 0 (如果日期无效，排在最前)
 */
function parseDate(dateString) {
  try {
    // 尝试更健壮的解析，处理 'YYYY/MM/DD' 或 'YYYY-MM-DD'
    const normalizedDate = dateString.replace(/\//g, '-');
    const date = new Date(normalizedDate);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return 0; // 无效日期排在前面
    }
    return date.getTime();
  } catch (e) {
    console.error(`Error parsing date: ${dateString}`, e);
    return 0; // 出错也排在前面
  }
}


/**
 * @description 高亮文本中匹配查询字符串的部分。
 * 注意: 使用 v-html 渲染，确保 text 内容是可信的，防止 XSS。
 * @param {string} text - 需要高亮的原始文本
 * @param {string} query - 搜索查询词
 * @returns {string} 包含 <mark> 标签的 HTML 字符串
 */
function highlightMatch(text, query) {
  if (!query || !text) {
    return text; // 如果没有查询词或文本，直接返回原文
  }
  try {
    // 使用正则表达式进行全局、不区分大小写的匹配
    // 转义 query 中的特殊正则字符，防止注入
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  } catch (e) {
    console.error("Error in highlightMatch regex:", e);
    return text; // 正则出错时返回原文
  }
}

// --- 计算属性 ---

/**
 * @description 计算过滤和排序后的文件列表
 */
const filteredFiles = computed(() => {
  // 1. 过滤
  let results = []
  const lowerCaseQuery = searchQuery.value.toLowerCase()

  if (!lowerCaseQuery) {
    results = [...props.files] // 无搜索词时，使用全部文件 (创建副本)
  } else {
    results = props.files.filter(file =>
      // 检查标题是否匹配
      (file.title && file.title.toLowerCase().includes(lowerCaseQuery)) ||
      // 检查标签数组中是否有匹配项
      (file.meta?.tags && Array.isArray(file.meta.tags) && file.meta.tags.some(tag =>
        tag && tag.toLowerCase().includes(lowerCaseQuery)
      ))
    )
  }

  // 2. 排序
  results.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        // 按标题字母顺序排序
        return (a.title || '').localeCompare(b.title || '');
      case 'date':
        // 按修改日期降序排序 (新的在前)
        const dateA = parseDate(a.meta?.modified);
        const dateB = parseDate(b.meta?.modified);
        return dateB - dateA; // 降序
      case 'number':
      default:
        // 按文件名中的数字升序排序 (默认)
        return extractNumberFromString(a.title) - extractNumberFromString(b.title);
    }
  });

  return results
})

// --- 方法 ---

/**
 * @description 检查给定链接是否是当前活动路由
 * @param {string} link - 文件链接 (通常不带 .html 后缀)
 * @returns {boolean} 是否为活动链接
 */
const isActive = (link) => {
  // VitePress 路由路径通常不包含 .html
  const currentPath = route.path.replace(/\.html$/, '');
  const targetPath = link.replace(/\.html$/, '');
  return currentPath === targetPath;
}

/**
 * @description 设置排序方式
 * @param {'number' | 'title' | 'date'} mode - 排序模式
 */
const setSortBy = (mode) => {
  sortBy.value = mode;
}

// --- 生命周期钩子 ---
// onMounted(() => {
//   // 调试日志，生产环境建议移除
//   console.log('FileListSidebar mounted');
//   console.log('Current Directory:', props.currentDir);
//   console.log('Initial SortBy:', sortBy.value);
//   console.log('Initial Filtered Files Count:', filteredFiles.value.length);
// });

</script>

<style lang="scss" scoped>
// --- 基础变量与颜色系统 ---
.file-list-sidebar {
  // 基础颜色和主题变量 (保持或根据需要调整)
  --sidebar-base-color: 255, 255, 255;
  --sidebar-bg: var(--main-bg, #ffffff);
  --accent-color: var(--main-color, #0366d6);
  --accent-rgb: var(--main-color-rgb, 3, 102, 214);

  --color-surface-1: color-mix(in srgb, var(--sidebar-bg) 97%, var(--accent-color));
  --color-surface-2: color-mix(in srgb, var(--sidebar-bg) 94%, var(--accent-color));
  --color-text-primary: var(--main-font-color, #24292f);
  --color-text-secondary: color-mix(in srgb, var(--color-text-primary) 70%, transparent);
  --color-border: color-mix(in srgb, var(--accent-color) 10%, transparent);

  --item-hover-bg: color-mix(in srgb, var(--accent-color) 5%, transparent); // 稍微加深 hover 背景
  --item-active-bg: color-mix(in srgb, var(--accent-color) 9%, transparent); // 稍微加深 active 背景
  --item-active-border: color-mix(in srgb, var(--accent-color) 85%, transparent);

  // >> 修改: 定义高亮颜色变量
  --highlight-bg: #fff3cd; // 默认高亮背景 (淡黄)
  --highlight-color: #664d03; // 默认高亮文字 (深褐)

  // 阴影效果
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 2px 8px rgba(var(--accent-rgb), 0.08); // Hover 阴影
  --shadow-active: 0 4px 12px rgba(var(--accent-rgb), 0.1); // Active 阴影

  // --- 基础样式 ---
  background: var(--sidebar-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md), 0 12px 32px rgba(var(--accent-rgb), 0.08);
  }

  // --- 侧边栏头部 ---
  .sidebar-header {
    padding: 1.75rem 1.5rem 1rem;
    background: var(--color-surface-1);
    border-bottom: 1px solid var(--color-border);

    .title { // 标题行样式
      margin: 0 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      svg { flex-shrink: 0; }
      .dir-name { // 目录名样式
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: -0.03em;
        color: var(--color-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-grow: 1;
        min-width: 0;
      }
      .count { // 文件计数样式
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--accent-color);
        background: color-mix(in srgb, var(--accent-color) 8%, transparent);
        border-radius: 20px;
        transition: all 0.2s ease;
        flex-shrink: 0;
        &:hover { background: color-mix(in srgb, var(--accent-color) 12%, transparent); }
      }
    }

    .search-box { // 搜索框样式
      position: relative;
      margin-bottom: 1rem;
      .search-input {
        width: 100%;
        padding: 0.875rem 1.25rem;
        padding-left: 3rem;
        border-radius: 14px;
        font-size: 0.95rem;
        border: 1.5px solid var(--color-border);
        background: var(--sidebar-bg);
        transition: all 0.2s ease;
        &:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
          outline: none;
        }
        &::placeholder { color: var(--color-text-secondary); }
      }
      .search-icon {
        position: absolute;
        left: 1.125rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-secondary);
        transition: color 0.2s ease;
        pointer-events: none;
      }
      &:focus-within .search-icon { color: var(--accent-color); }
    }

    .sort-options { // 排序选项样式
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      button {
        padding: 0.25rem 0.6rem;
        border: 1px solid var(--color-border);
        background: transparent;
        color: var(--color-text-secondary);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          border-color: color-mix(in srgb, var(--accent-color) 50%, transparent);
          color: var(--color-text-primary);
          background-color: var(--item-hover-bg);
        }
        &.active {
          border-color: var(--accent-color);
          background-color: color-mix(in srgb, var(--accent-color) 10%, transparent);
          color: var(--accent-color);
          font-weight: 500;
        }
      }
    }
  } // end .sidebar-header

  // --- 文件列表区域 ---
  .file-list {
    padding: 1rem; // >> 修改: 增大列表容器内边距
    display: flex;
    flex-direction: column;
    gap: 0.85rem; // >> 修改: 增大文件项之间的垂直间距
    max-height: calc(100vh - 250px); // 示例高度，按需调整
    overflow-y: auto;

    // 美化滚动条 (可选)
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: transparent; margin: 1rem 0; }
    &::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--accent-color) 30%, transparent); }

    // --- 文件项 ---
    .file-item {
      border-radius: 16px; // >> 修改: 增大圆角
      border: 1px solid var(--color-border); // >> 修改: 添加默认细边框
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background-color: var(--sidebar-bg); // 明确背景色

      // --- 活动状态 ---
      &.active {
        background: var(--item-active-bg);
        border-color: var(--item-active-border);
        border-left: 4px solid var(--accent-color); // >> 新增: 活动项左侧强调边框
        box-shadow: var(--shadow-active); // >> 新增: 活动项阴影

        .file-title {
          color: var(--accent-color);
          font-weight: 600;
        }
        // >> 修改: 活动状态下的高亮样式
        a .file-title :deep(mark),
        a .meta .tags .tag :deep(mark) {
          background-color: var(--accent-color); // 使用主题色背景
          color: var(--sidebar-bg); // 使用亮色文字
          font-weight: 700;
        }
      }

      // --- 悬停状态 (非活动项) ---
      &:hover:not(.active) {
        background: var(--item-hover-bg);
        border-color: color-mix(in srgb, var(--accent-color) 30%, transparent); // >> 修改: Hover 边框变色
        transform: translateX(6px) scale(1.01); // >> 修改: 增强位移和缩放
        box-shadow: var(--shadow-hover); // >> 修改: 添加 Hover 阴影
      }

      // --- 文件项链接内容 ---
      a {
        padding: 1.25rem 1.5rem; // >> 修改: 增大内部边距
        display: block;
        text-decoration: none;

        // --- 文件标题 ---
        .file-title {
          font-size: 1.05rem; // >> 修改: 微增字号
          margin-bottom: 0.85rem; // >> 修改: 增大与元数据间距
          color: var(--color-text-primary);
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.6rem; // 图标与文字间距
          svg { flex-shrink: 0; }

          // >> 修改: 高亮样式定义 (应用于标题和标签)
          :deep(mark) {
            background-color: var(--highlight-bg);
            color: var(--highlight-color);
            border-radius: 3px;
            padding: 0.1em 0.2em;
            margin: -0.1em -0.2em;
            font-weight: 600;
            transition: background-color 0.2s, color 0.2s; // 添加过渡
          }
        }

        // --- 元数据区域 (标签 + 日期) ---
        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          transition: opacity 0.2s ease; // >> 新增: 为透明度变化添加过渡

          // --- 标签列表 ---
          .tags {
            display: flex;
            gap: 0.625rem;
            flex-wrap: wrap;
            flex-grow: 1;
            min-width: 0;

            .tag { // 单个标签样式
              padding: 0.4rem 0.8rem; // >> 修改: 微调内边距
              border-radius: 10px; // >> 修改: 微调圆角
              background: color-mix(in srgb, var(--accent-color) 8%, transparent);
              color: var(--accent-color);
              font-weight: 500;
              font-size: 0.8125rem;
              transition: all 0.2s ease;
              white-space: nowrap;

              // 高亮样式也应用于标签内
              :deep(mark) { /* 继承 .file-title 下的 :deep(mark) 样式 */ }

              &:hover { // 标签悬停效果
                background: color-mix(in srgb, var(--accent-color) 12%, transparent);
                transform: translateY(-1px);
                box-shadow: 0 1px 3px rgba(var(--accent-rgb), 0.1);
              }
            }
          }

          // --- 修改日期 ---
          .modified {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            gap: 0.3rem;
            flex-shrink: 0;
            svg { flex-shrink: 0; }
          }
        } // end .meta
      } // end a

      // >> 新增: 非活动项降低元数据透明度，增强层次感
      &:not(.active) a .meta {
        opacity: 0.75;
      }
      // >> 新增: 悬停非活动项时恢复元数据透明度
      &:not(.active):hover a .meta {
        opacity: 1;
      }

    } // end .file-item
  } // end .file-list

  // --- 空状态 ---
  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    svg { margin-bottom: 1rem; }
    p { color: var(--color-text-secondary); font-size: 1rem; line-height: 1.6; }
  }
} // end .file-list-sidebar

// --- 动画效果 ---
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from { opacity: 0; transform: translateY(-8px); }
.list-leave-to { opacity: 0; transform: translateY(8px); }
.list-leave-active {
  position: absolute;
  width: calc(100% - 2rem); // 列表容器宽度减去左右 padding (1rem * 2)
  box-sizing: border-box;
}

// --- 响应式设计 ---
@media (max-width: 768px) {
  .file-list-sidebar {
    border-radius: 0; box-shadow: none; border-left: none; border-right: none;
    .sidebar-header {
      padding: 1.25rem 1rem 1rem;
      .title { margin-bottom: 1.25rem; }
      .search-box .search-input { padding: 0.75rem 1rem 0.75rem 2.75rem; }
      .sort-options { flex-wrap: wrap; font-size: 0.8rem; button { padding: 0.2rem 0.5rem; } }
    }
    .file-list {
      padding: 0.5rem; max-height: none; overflow-y: visible; gap: 0.5rem; // 减小移动端间距
      .file-item {
        margin: 0; border-radius: 10px; border-left-width: 0; // 移动端移除左侧活动边框
        a { padding: 1rem; }
        &:hover:not(.active) { transform: none; } // 移除移动端 hover 位移
      }
    }
    .list-leave-active { position: relative; width: auto; }
  }
}

// --- 可访问性: 减少动画 ---
@media (prefers-reduced-motion: reduce) {
  .file-list-sidebar, .list-move, .list-enter-active, .list-leave-active, .file-item, .tag {
    transition: none !important;
  }
}

// --- 深色模式优化 ---
@media (prefers-color-scheme: dark) {
  .file-list-sidebar {
    // 深色阴影
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25);
    --shadow-hover: 0 2px 8px rgba(var(--accent-rgb), 0.15);
    --shadow-active: 0 4px 12px rgba(var(--accent-rgb), 0.2);

    // >> 修改: 深色模式高亮变量
    --highlight-bg: color-mix(in srgb, var(--accent-color) 35%, transparent); // 更融合背景的强调色
    --highlight-color: color-mix(in srgb, var(--color-text-primary) 95%, black); // 亮色文字

    // 调整基础颜色
    --color-border: color-mix(in srgb, var(--accent-color) 25%, transparent); // 边框更明显
    --item-hover-bg: color-mix(in srgb, var(--accent-color) 12%, transparent); // Hover 背景
    --item-active-bg: color-mix(in srgb, var(--accent-color) 18%, transparent); // Active 背景
    --item-active-border: var(--accent-color); // Active 边框颜色用强调色

    .sidebar-header { // 头部背景
      background: color-mix(in srgb, var(--sidebar-bg) 96%, white);
      .sort-options button { // 排序按钮边框
        border-color: color-mix(in srgb, var(--color-text-secondary) 50%, transparent);
        &:hover { border-color: var(--accent-color); }
        &.active { border-color: var(--accent-color); background-color: color-mix(in srgb, var(--accent-color) 20%, transparent); }
      }
    }

    .file-list .file-item { // 文件项边框
      border-color: color-mix(in srgb, var(--color-border) 70%, black); // 默认边框

      &:hover:not(.active) {
        border-color: color-mix(in srgb, var(--accent-color) 50%, transparent); // Hover 边框
      }
      &.active { // 活动项边框
        border-color: var(--item-active-border);
        border-left-color: var(--accent-color);
      }

       // >> 修改: 深色模式活动项高亮
      &.active a .file-title :deep(mark),
      &.active a .meta .tags .tag :deep(mark) {
        background-color: var(--accent-color); // 保持强调色背景
        color: var(--sidebar-bg); // 文字颜色
      }

      a .meta .tags .tag { // 标签背景
        background: color-mix(in srgb, var(--accent-color) 15%, transparent);
        &:hover { background: color-mix(in srgb, var(--accent-color) 20%, transparent); }
      }
    }
  }
}
</style>