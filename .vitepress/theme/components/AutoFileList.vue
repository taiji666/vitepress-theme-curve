<script setup>
import { useData, withBase } from 'vitepress'
import { ref, reactive } from 'vue'
import TreeNodes from './TreeNodes.vue'

const { page, theme } = useData()

// 获取当前目录路径（根据当前页面的相对路径）
const currentDir = page.value.relativePath
  .replace(/\/index\.md$/, '') // 移除末尾的/index.md
  .split('/')
  .pop() // 获取当前目录名称

/**
 * 构建树形目录结构
 * @param {Array} items - 原始文档数据
 * @returns {Array} 结构化的树形数据
 */
function buildDirectoryTree(items) {
  const basePath = `/pages/repository/${currentDir}/`
  const tree = []
  // console.log("basePath", basePath)

  items.forEach(item => {
    // 过滤非当前目录下的文档
    if (!item.regularPath.startsWith(basePath)) return

    // 计算相对路径并移除扩展名
    const relPath = item.regularPath
      .replace(basePath, '')
      // .replace(/\.html$/, '')

    // 拆分路径层级
    const pathSegments = relPath.split('/')
    // console.log("pathSegments", pathSegments)
    let currentLevel = tree

    pathSegments.forEach((segment, index) => {
      // const isFile = index === pathSegments.length - 1 && segment.includes('.')
      const isFile = index === pathSegments.length - 1 && /\.\w+$/.test(segment)&& segment.includes('html')
      const existing = currentLevel.find(n => n.name === segment)

      if (existing) {
        currentLevel = existing.children
      } else {
        const node = {
          name: segment,
          title: item.title || generateTitle(segment),
          isFolder: !isFile,
          path: pathSegments.slice(0, index + 1).join('/'),
          link: isFile ? withBase(item.regularPath.replace('.html', '')) : null,
          meta: {
            tags: parseTags(item.tags),
            modified: formatDate(item.lastModified)
          },
          children: []
        }
        currentLevel.push(node)
        currentLevel = node.children
      }
    })
  })

  // 递归排序树结构
  sortTree(tree)
  return tree
}

/** 从文件名生成标题 */
function generateTitle(name) {
  return name
    .replace(/(^\d+[-_])/, '') // 移除数字前缀
    .replace(/[-_]/g, ' ')
    .replace(/(^|\s)\S/g, t => t.toUpperCase())
}

/** 解析标签数据 */
function parseTags(tags) {
  if (Array.isArray(tags)) return tags
  return typeof tags === 'string' ? tags.split(/, ?/).filter(Boolean) : []
}

/** 日期格式化 */
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/** 递归排序树节点 */
function sortTree(nodes) {
  nodes.sort((a, b) => {
    // 文件夹优先排序
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1

    // 自然排序算法（支持数字序号）
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  })

  // 递归排序子节点
  nodes.forEach(node => node.isFolder && sortTree(node.children))
}

// 构建树形数据
const tree = buildDirectoryTree(theme.value.RepositoryData)

// 展开状态管理（存储路径标识）
const expandedPaths = reactive(new Set())

// 切换展开状态
function toggleExpand(path) {
  expandedPaths.has(path)
    ? expandedPaths.delete(path)
    : expandedPaths.add(path)
}
</script>

<template>
  <div class="auto-file-list">
    <h2 class="list-title">{{ currentDir }} 文档库</h2>
    
    <!-- 递归组件 -->
    <TreeNodes
      :nodes="tree"
      :depth="0"
      :expanded-paths="expandedPaths"
      @toggle-expand="toggleExpand"
    />
  </div>
</template>

<style scoped>
.auto-file-list {
  margin: 2rem 0;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
}

.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
</style>