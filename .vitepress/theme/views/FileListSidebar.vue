<template>
  <div class="file-list-sidebar">
    <div class="sidebar-header">
      <h3 class="title">
        <i class="iconfont icon-folder"></i>
        <span class="dir-name">{{ currentDir }}</span>
        <span class="count">{{ filteredFiles.length }}篇</span>
      </h3>
      <!-- 添加搜索功能 -->
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索文章..." 
          class="search-input"
        >
        <i class="iconfont icon-search"></i>
      </div>
    </div>
    <div class="file-list" v-if="filteredFiles.length">
      <TransitionGroup name="list">
        <div 
          v-for="(file, index) in filteredFiles" 
          :key="file.link"
          class="file-item"
          :class="{ 'active': isActive(file.link) }"
        >
          <a :href="file.link">
            <div class="file-title">
              <i class="iconfont icon-document"></i>
              {{ file.title }}
            </div>
            <div class="meta">
              <div class="tags">
                <span 
                  v-for="(tag, tagIndex) in file.meta.tags" 
                  :key="tagIndex"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
              <span class="modified">
                <i class="iconfont icon-time"></i>
                {{ file.meta.modified }}
              </span>
            </div>
          </a>
        </div>
      </TransitionGroup>
    </div>
    <div v-else class="empty-state">
      <i class="iconfont icon-empty"></i>
      <p>暂无相关文章</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vitepress'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  currentDir: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const searchQuery = ref('')

// 从字符串中提取数字，如果字符串中没有数字，则返回一个较大的数字用于排序
function extractNumberFromString(str) {
  const match = str.match(/\d+/)
  return match ? parseInt(match[0], 10) : Infinity
}

// 添加搜索过滤功能和按照文件名中提取的数字大小排序
const filteredFiles = computed(() => {
  let results = []
  if (!searchQuery.value) {
    results = [...props.files]
  } else {
    results = props.files.filter(file =>
      file.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      file.meta.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    )
  }
  
  return results.sort((a, b) => extractNumberFromString(a.title) - extractNumberFromString(b.title))
})

const isActive = (link) => {
  return route.path === link.replace(/\.html$/, '')
}
</script>

<style lang="scss" scoped>
.file-list-sidebar {
  // 使用更现代的CSS变量系统
  --sidebar-base-color: 255, 255, 255;
  --sidebar-bg: var(--main-bg, #ffffff);
  --accent-color: var(--main-color, #0366d6);
  --accent-rgb: var(--main-color-rgb, 3, 102, 214);
  
  // 优化颜色系统
  --color-surface-1: color-mix(in srgb, var(--sidebar-bg) 97%, var(--accent-color));
  --color-surface-2: color-mix(in srgb, var(--sidebar-bg) 94%, var(--accent-color));
  --color-text-primary: var(--main-font-color, #24292f);
  --color-text-secondary: color-mix(in srgb, var(--color-text-primary) 70%, transparent);
  --color-border: color-mix(in srgb, var(--accent-color) 10%, transparent);
  
  // 交互状态颜色
  --item-hover-bg: color-mix(in srgb, var(--accent-color) 4%, transparent);
  --item-active-bg: color-mix(in srgb, var(--accent-color) 8%, transparent);
  --item-active-border: color-mix(in srgb, var(--accent-color) 85%, transparent);
  
  // 现代化的阴影效果
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06);
  
  background: var(--sidebar-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md), 0 12px 32px rgba(var(--accent-rgb), 0.08);
  }

  .sidebar-header {
    padding: 1.75rem 1.5rem;
    background: var(--color-surface-1);
    border-bottom: 1px solid var(--color-border);

    .title {
      margin: 0 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .dir-name {
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: -0.03em;
        color: var(--color-text-primary);
        transition: color 0.2s ease;
      }

      .count {
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--accent-color);
        background: color-mix(in srgb, var(--accent-color) 8%, transparent);
        border-radius: 20px;
        transition: all 0.2s ease;
        
        &:hover {
          background: color-mix(in srgb, var(--accent-color) 12%, transparent);
        }
      }
    }

    .search-box {
      position: relative;

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
        }
        
        &::placeholder {
          color: var(--color-text-secondary);
        }
      }

      .icon-search {
        position: absolute;
        left: 1.125rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-secondary);
        transition: color 0.2s ease;
      }

      &:focus-within .icon-search {
        color: var(--accent-color);
      }
    }
  }

  .file-list {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .file-item {
      border-radius: 14px;
      border: 1.5px solid transparent;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.active {
        background: var(--item-active-bg);
        border-color: var(--item-active-border);
        
        .file-title {
          color: var(--accent-color);
          font-weight: 600;
        }
      }

      &:hover {
        background: var(--item-hover-bg);
        transform: translateX(4px);
      }

      a {
        padding: 1.125rem 1.375rem;
        display: block;
        text-decoration: none;

        .file-title {
          font-size: 1rem;
          margin-bottom: 0.75rem;
          color: var(--color-text-primary);
          transition: color 0.2s ease;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .tags {
            display: flex;
            gap: 0.625rem;
            flex-wrap: wrap;

            .tag {
              padding: 0.35rem 0.75rem;
              border-radius: 8px;
              background: color-mix(in srgb, var(--accent-color) 8%, transparent);
              color: var(--accent-color);
              font-weight: 500;
              font-size: 0.8125rem;
              transition: all 0.2s ease;
              
              &:hover {
                background: color-mix(in srgb, var(--accent-color) 12%, transparent);
              }
            }
          }

          .modified {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
          }
        }
      }
    }
  }

  .empty-state {
    padding: 4rem 2rem;
    text-align: center;

    .iconfont {
      font-size: 2.5rem;
      color: var(--color-text-secondary);
      opacity: 0.7;
      margin-bottom: 1rem;
    }

    p {
      color: var(--color-text-secondary);
      font-size: 1rem;
      line-height: 1.6;
    }
  }
}

// 优化动画效果
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

// 响应式设计优化
@media (max-width: 768px) {
  .file-list-sidebar {
    border-radius: 0;
    box-shadow: none;
    border-left: none;
    border-right: none;
    
    .sidebar-header {
      padding: 1.25rem 1rem;
      
      .title {
        margin-bottom: 1.25rem;
      }
      
      .search-box .search-input {
        padding: 0.75rem 1rem 0.75rem 2.75rem;
      }
    }
    
    .file-list {
      padding: 0.5rem;
      
      .file-item {
        margin: 0;
        border-radius: 10px;
        
        a {
          padding: 1rem;
        }
        
        &:hover {
          transform: none;
        }
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .file-list-sidebar,
  .list-move,
  .list-enter-active,
  .list-leave-active,
  .file-item {
    transition: none !important;
  }
}

// 深色模式优化
@media (prefers-color-scheme: dark) {
  .file-list-sidebar {
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25);
    
    .sidebar-header {
      background: color-mix(in srgb, var(--sidebar-bg) 97%, white);
    }
  }
}
</style>