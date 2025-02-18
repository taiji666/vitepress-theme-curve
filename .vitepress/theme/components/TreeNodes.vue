<script setup>
import { defineProps } from 'vue'

defineProps({
  nodes: Array,
  depth: Number,
  expandedPaths: Set
})

const emit = defineEmits(['toggle-expand'])

/** 从文件名生成标题 */
function generateTitle(name) {
  return name
    .replace(/(^\d+[-_])/, '') // 移除数字前缀
    .replace(/[-_]/g, ' ')
    .replace(/(^|\s)\S/g, t => t.toUpperCase())
}
</script>

<template>
  <div class="tree-layer">
    <div
      v-for="node in nodes"
      :key="node.path"
      class="tree-node"
      :style="{ marginLeft: depth * 20 + 'px' }"
    >
      <!-- 文件夹节点 -->
      <div v-if="node.isFolder" class="folder-node">
        <button
          class="folder-header"
          @click="emit('toggle-expand', node.path)"
        >
          <span class="folder-icon">
            {{ expandedPaths.has(node.path) ? '📂' : '📁' }}
          </span>
          <span class="folder-name">{{ generateTitle(node.name) }}</span>
        </button>

        <!-- 子节点（展开时显示） -->
        <div v-if="expandedPaths.has(node.path)" class="folder-children">
          <TreeNodes
            :nodes="node.children"
            :depth="depth + 1"
            :expanded-paths="expandedPaths"
            @toggle-expand="emit('toggle-expand', $event)"
          />
        </div>
      </div>

      <!-- 文件节点 -->
      <a
        v-else
        :href="node.link"
        class="file-node"
      >
        <span class="file-icon">📄</span>
        <div class="file-info">
          <div class="file-title">{{ node.title }}</div>
          <div class="file-meta">
            <time v-if="node.meta.modified" class="modified">
              {{ node.meta.modified }}
            </time>
            <span
              v-for="tag in node.meta.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  margin: 4px 0;
  transition: all 0.2s ease;
}

.folder-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.folder-header:hover {
  background: var(--vp-c-bg-mute);
}

.folder-icon {
  margin-right: 8px;
  font-size: 0.9em;
}

.folder-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.file-node {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.file-node:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand);
  transform: translateX(4px);
}

.file-icon {
  margin-right: 10px;
  font-size: 0.9em;
}

.file-info {
  flex: 1;
}

.file-title {
  font-weight: 500;
  line-height: 1.4;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
}

.modified {
  font-family: monospace;
}

.tag {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.folder-children {
  margin-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
  padding-left: 12px;
}
</style>