<template>
  <div v-if="postMetaData" class="post">
    <div class="post-meta">
      <div class="meta">
        <div class="categories" v-if="postMetaData.categories && postMetaData.categories.length > 0">
          <a
            v-for="(item, index) in postMetaData.categories"
            :key="index"
            :href="`/pages/categories/${item}`"
            class="cat-item"
            aria-label="Category" >
            <i class="iconfont icon-folder" />
            <span class="name">{{ item }}</span>
          </a>
        </div>
        <div class="tags" v-if="postMetaData.tags && postMetaData.tags.length > 0">
           <a
            v-for="(item, index) in postMetaData.tags"
            :key="index"
            :href="`/pages/tags/${item}`"
            class="tag-item"
            aria-label="Tag" >
            <i class="iconfont icon-hashtag" />
            <span class="name">{{ item }}</span>
          </a>
        </div>
      </div>
      <h1 class="title">
        {{ postMetaData.title || "未命名文章" }}
      </h1>
      <div class="other-meta">
        <span class="meta date">
          <i class="iconfont icon-date" />
          {{ formatTimestamp(postMetaData.date) }}
        </span>
        <span class="update meta">
          <i class="iconfont icon-time" />
          {{ formatTimestamp(page?.lastUpdated || postMetaData.lastModified) }}
        </span>
        <span class="hot meta">
          <i class="iconfont icon-fire" />
          <span class="view-count-placeholder">0</span> </span>
        <span class="chat meta hover" @click="scrollToComments" role="button" tabindex="0" @keydown.enter="scrollToComments" aria-label="Scroll to comments"> <i class="iconfont icon-chat" />
          <span class="comment-count-placeholder">0</span> </span>
      </div>
    </div>

    <div class="post-content">
      <FileListSidebar :files="files" class="file-list-sidebar" />
      <article class="post-article s-card">
        <div class="expired s-card" v-if="postMetaData?.expired && postMetaData.expired >= 180">
          本文发表于 <strong>{{ postMetaData.expired }}</strong> 天前，其中的信息可能已经事过境迁。
        </div>

        <ArticleGPT />

        <Content id="page-content" class="markdown-main-style" />

        <References />

        <Copyright v-if="frontmatter.copyright !== false" :postData="postMetaData" />

        <div class="other-meta-bottom">
          <div class="all-tags" v-if="postMetaData.tags && postMetaData.tags.length > 0">
            <a
              v-for="(item, index) in postMetaData.tags"
              :key="index"
              :href="`/pages/tags/${item}`"
              class="tag-item"
              aria-label="Tag" >
              <i class="iconfont icon-hashtag" />
              <span class="name">{{ item }}</span>
            </a>
          </div>
          <a
            :href="feedbackUrl"
            class="report"
            target="_blank"
            rel="noopener noreferrer" >
            <i class="iconfont icon-report" />
            反馈与投诉
          </a>
        </div>

        <RewardBtn />

        <NextPost />

        <Comments ref="commentRef" />
      </article>

      <Aside showToc class="main-aside" />
    </div>
  </div>
  <div v-else class="post-loading">
    加载中...
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useData, withBase } from 'vitepress'; // 引入 VitePress 提供的 useData 和 withBase
import { formatTimestamp } from '@/utils/helper'; // 引入时间戳格式化工具
import { generateId } from '@/utils/commonTools'; // 引入 ID 生成工具 (假设存在)
import initFancybox from '@/utils/initFancybox'; // 引入 Fancybox 初始化工具

// --- 配置项 (理想情况下从 themeConfig 获取) ---
// TODO: 从 theme.value.themeConfig 或类似地方读取这些配置
const EXPIRED_DAYS_THRESHOLD = 180; // 文章过期提醒阈值（天）
const FEEDBACK_URL = 'https://eqnxweimkr5.feishu.cn/share/base/form/shrcnCXCPmxCKKJYI3RKUfefJre'; // 反馈链接

// --- 获取 VitePress 数据 ---
// page: 当前页面信息 (路径、frontmatter 等)
// theme: 主题配置和全局数据
// frontmatter: 当前页面的 frontmatter
const { page, theme, frontmatter } = useData();

// --- 组件 Props ---
// defineProps({
//   debugInfo: Object // 调试信息 Prop (当前未使用)
// });

// --- Refs ---
// 用于获取评论组件实例
const commentRef = ref(null);

// --- 计算属性 (Computed Properties) ---

// 计算当前文件所在的目录名
const currentDir = computed(() => {
  // 确保 page 和 relativePath 存在且是字符串
  if (!page.value?.relativePath || typeof page.value.relativePath !== 'string') {
    console.warn('[currentDir] page.relativePath 无效');
    return '';
  }
  // 假设路径结构为 '.../目录名/文件名.md' 或 '.../目录名/index.md'
  // 移除可能的文件扩展名（.md, .html）和尾部斜杠
  const pathWithoutSuffix = page.value.relativePath.replace(/\.(md|html)$/, '').replace(/\/$/, '');
  const pathSegments = pathWithoutSuffix.split('/');

  // 如果路径是 '目录名/index' 或 '目录名/文件名', 则目录名是倒数第二个元素
  // 如果路径是 '目录名/' (移除index.md后), split 后最后一个元素可能是目录名
  if (pathSegments.length >= 2) {
    // 获取倒数第二个元素作为目录名
    return pathSegments.at(-2);
  } else if (pathSegments.length === 1 && pathSegments[0] !== '') {
     // 可能是根目录下的文件夹，如 'MyFolder/file.md' -> ['MyFolder', 'file']
     // 或者只有一个文件名，如 'file.md' -> ['file'] (这种情况没有父目录)
     // 根据实际情况调整逻辑，这里假设至少需要两段才算有明确的父目录
    // 如果需要处理根目录下的文件夹作为 currentDir，需要修改逻辑
    console.warn('[currentDir] 路径分段不足，无法确定目录:', page.value.relativePath);
    return '';
  }
  console.warn('[currentDir] 无法从路径中提取目录:', page.value.relativePath);
  return ''; // 默认返回空字符串
});

// 根据当前目录过滤文件列表，用于左侧边栏
const files = computed(() => {
  const dir = currentDir.value; // 获取当前目录名
  // 确保目录名有效且全局仓库数据存在
  if (!dir || !theme.value?.RepositoryData || !Array.isArray(theme.value.RepositoryData)) {
    console.warn('[files] 无法计算文件列表：缺少目录名或 RepositoryData');
    return []; // 返回空数组
  }

  // console.log(`[files] 计算目录 "${dir}" 的文件列表...`); // 调试日志

  const filtered = theme.value.RepositoryData
    .filter(item => {
      // 确保 item 和其 regularPath 存在
      if (!item?.regularPath || typeof item.regularPath !== 'string') return false;

      // 路径处理与匹配
      // 假设 regularPath 格式为 /pages/repository/目录名/文件名.html
      const pathSegments = item.regularPath
        .replace(/^\//, '') // 移除开头的 /
        .replace(/\.html$/, '') // 移除 .html 后缀
        .split('/');

      // 检查路径段长度是否足够，并且倒数第二个段（目录）是否精确匹配 currentDir
      // 例如: ['pages', 'repository', '高等数学', '01-极限与连续']
      // 需要比较 pathSegments.at(-2) 是否等于 dir
      return pathSegments.length >= 2 && pathSegments.at(-2) === dir;
    })
    .map(item => {
      // 映射数据结构以匹配 FileListSidebar 的 prop 要求
      // 优先使用 frontmatter.title，其次是 item.title，最后尝试从路径提取 (如果需要)
      const title = item.frontmatter?.title || item.title || '未命名';
      // 处理链接，移除 .html 并添加 base path
      const link = withBase(item.regularPath.replace(/\.html$/, ''));
      // 处理标签，优先 frontmatter.tags (数组)，兼容旧的 item.tags (逗号分隔字符串)
      let tags = [];
      if (Array.isArray(item.frontmatter?.tags)) {
        tags = item.frontmatter.tags;
      } else if (typeof item.tags === 'string') {
        tags = item.tags.split(',').map(t => t.trim()).filter(Boolean); // 分割并去除空字符串
      }
      // 格式化最后修改时间
      const modified = formatTimestamp(item.lastModified || item.frontmatter?.date); // 使用最后修改时间或 frontmatter 日期

      return {
        title: title,
        link: link,
        meta: {
          tags: tags,
          modified: modified
        }
      };
    });
    // 可以选择在此处排序，或者由 FileListSidebar 内部处理
    // .sort((a, b) => b.meta.modified.localeCompare(a.meta.modified)); // 按修改日期降序

  // console.log(`[files] 目录 "${dir}" 找到 ${filtered.length} 个文件:`, filtered); // 调试日志
  return filtered; // 返回处理后的文件数组
});

// 获取当前文章的元数据
const postMetaData = computed(() => {
  // 检查 page.relativePath 是否存在
  if (!page.value?.relativePath) {
    console.error('[postMetaData] page.relativePath 不存在，无法生成 ID');
    return null;
  }
  // 根据当前页面相对路径生成唯一 ID
  const postId = generateId(page.value.relativePath);
  // 在全局仓库数据中查找匹配 ID 的项
  const meta = theme.value.RepositoryData?.find(item => item.id === postId);

  if (!meta) {
    console.error(`[postMetaData] 未找到 ID 为 "${postId}" (路径: ${page.value.relativePath}) 的元数据`);
    return null; // 未找到则返回 null
  }
  // console.log('[postMetaData] 找到元数据:', meta); // 调试日志
  return meta;
});

// --- 方法 (Methods) ---

// 滚动到评论区域
const scrollToComments = () => {
  commentRef.value?.scrollToComments?.(); // 调用评论子组件暴露的方法 (如果存在)
  // 或直接滚动到元素
  // document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
};

// --- 生命周期钩子 (Lifecycle Hooks) ---

onMounted(() => {
  // 初始化图片灯箱效果
  if (theme.value) {
    initFancybox(theme.value);
  }

  // TODO: 在此或 $nextTick 后初始化浏览量和评论数统计
  // 例如:
  // import { initTwikooCounters } from '@/utils/twikooHelper'; // 假设有此工具函数
  // initTwikooCounters();
  // import Artalk from 'artalk'; // 假设使用 Artalk
  // Artalk.loadCountWidget({ site: 'YourSiteName', server: 'YourServerUrl' });

  // console.log('[PostPage] Component mounted.');
  // console.log('[PostPage] Initial files:', files.value); // 可以在挂载后打印 files 的初始值
});

// --- 侦听器 (Watchers) ---
// 可选：如果 postMetaData 依赖的数据可能在客户端动态变化，可以在这里添加 watcher
watch(postMetaData, (newMeta, oldMeta) => {
  if (newMeta && !oldMeta) {
    // console.log('[PostPage] Post meta data loaded:', newMeta);
    // 可以在元数据首次加载后执行某些操作
  }
}, { immediate: true }); // immediate: true 使其在初始渲染时也执行一次

// --- 可访问性注意事项 ---
// - 确保所有交互元素（链接、按钮）有清晰的 :focus 样式 (通常在全局 CSS 中定义)
// - 为意义不明确的图标按钮提供 aria-label
// - 检查颜色对比度

// --- 将配置值传递给模板 ---
const feedbackUrl = computed(() => FEEDBACK_URL); // 使配置可在模板中使用

</script>

<style lang="scss" scoped>
// 导入基础文章样式 (如果 post.scss 在同一目录或正确配置了路径别名)
@use "../style/post.scss"; // 确保路径正确

// --- SCSS Breakpoint Variables ---
$breakpoint-lg: 1199.98px; // 用于隐藏右侧栏
$breakpoint-md: 991.98px;  // 用于隐藏左侧栏
$breakpoint-sm: 767.98px;  // 用于移动端布局调整

// --- SCSS Mixins ---
// 定义可复用的标签/按钮项样式 Mixin
@mixin tag-like-item-style(
  $base-bg: transparent,                   // 基础背景色
  $base-color: inherit,                    // 基础文字颜色
  $hover-bg: var(--main-color-bg),         // Hover 背景色
  $hover-color: var(--main-color),         // Hover 文字颜色
  $focus-outline-color: var(--main-focus-color, var(--main-color)), // 焦点轮廓颜色 (应全局定义 --main-focus-color)
  $active-scale: 0.98                      // Active 状态缩放比例
) {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  opacity: 0.8;
  background-color: $base-bg;
  color: $base-color;
  transition: color 0.3s, background-color 0.3s, opacity 0.3s, transform 0.1s ease-out; // 添加 transform 过渡
  cursor: pointer; // 明确是可交互的
  text-decoration: none; // 如果是 <a> 标签则移除下划线

  .iconfont {
    margin-right: 4px; // 默认图标间距
    opacity: 0.6;
    font-weight: normal;
    transition: color 0.3s, opacity 0.3s; // 图标颜色和透明度也添加过渡
  }

  &:hover { // hover 状态
    color: $hover-color;
    background-color: $hover-bg;
    opacity: 1;
    .iconfont {
      color: $hover-color; // 图标颜色与文本一致
      opacity: 1;
    }
  }

  // 使用 focus-visible 提供清晰的键盘焦点指示
  &:focus-visible {
    opacity: 1; // 确保焦点时元素清晰
    outline: 2px solid $focus-outline-color;
    outline-offset: 2px;
    // 可选: 同时应用 hover 样式，或定义独特的 focus 样式
    color: $hover-color;
    background-color: $hover-bg;
    .iconfont {
      color: $hover-color;
      opacity: 1;
    }
  }
  // 移除 :focus 的默认轮廓，让 :focus-visible 处理键盘焦点
  &:focus {
     outline: none;
  }

  // 添加 active 状态
  &:active {
    transform: scale($active-scale);
    opacity: 0.9; // 点击时稍微变暗或改变透明度
  }
}

.post {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.1s backwards; // 保留入场动画

  // 文章元信息区域样式
  .post-meta {
    padding: 2rem 0 3rem 18px;
    width: 100%;

    .meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap; // 允许换行
      gap: 12px; // 添加元素间距

      .categories {
        .cat-item {
          // 应用 Mixin，传入特定颜色参数
          @include tag-like-item-style(
            $base-bg: var(--main-mask-Inverse-background), // 分类背景色
            $hover-color: var(--main-color),
            $hover-bg: var(--main-color-bg)
          );
          .iconfont {
            margin-right: 6px; // 覆盖 mixin 默认值，保持 6px
          }
        }
      }

      .tags {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap; // 允许标签换行
        gap: 8px; // 标签间距

        .tag-item {
          @include tag-like-item-style(); // 应用 Mixin (使用默认参数)
          // 可以在此覆盖或添加特定于顶部标签的样式 (如果需要)
        }
      }
    }

    .title {
      font-size: 2.2rem; // 标题字号
      line-height: 1.2;
      color: var(--main-font-color);
      margin: 1.4rem 0; // 标题与其他元素的间距
    }

    .other-meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap; // 允许换行
      gap: 12px; // 元素间距

      .meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 8px;
        opacity: 0.8;

        .iconfont {
          margin-right: 6px;
          transition: color 0.3s; // 保留图标颜色过渡
        }

        &.date {
          padding-left: 0; // 日期移除左侧内边距
        }

        &.hot {
          .iconfont {
            font-size: 18px; // 热度图标稍大
          }
        }

        &.hover { // 用于评论数等可交互元素
          transition: color 0.3s, background-color 0.3s, opacity 0.3s, transform 0.1s ease-out; // 添加 transform 过渡
          cursor: pointer;

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);
            opacity: 1;
            .iconfont {
              color: var(--main-color);
            }
          }
          // 添加 focus-visible 和 active
          &:focus-visible {
             opacity: 1;
             outline: 2px solid var(--main-focus-color, var(--main-color)); // 使用焦点颜色变量
             outline-offset: 2px;
             color: var(--main-color);
             background-color: var(--main-color-bg);
             .iconfont {
               color: var(--main-color);
             }
          }
          &:focus {
             outline: none; // 移除默认 focus
          }
          &:active {
             transform: scale(0.98);
             opacity: 0.9;
          }
        }
      }
    }
  }

  // 文章内容区域样式
  .post-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 1.5rem; // 侧边栏与主内容区的间距
    position: relative;
    animation: fade-up 0.3s 0.3s backwards; // 内容区动画延迟

    // 左侧边栏样式
    .file-list-sidebar {
      flex: 0 0 350px; // 固定宽度 350px
      position: sticky; // 粘性定位
      // 使用 CSS 变量定义 top 和 max-height，增加灵活性
      // --header-height 和 --sticky-sidebar-bottom-margin 应在全局定义
      top: var(--header-height, 80px); // 距离顶部的偏移量 (假设页眉高80px)
      height: fit-content; // 高度自适应内容
      max-height: calc(100vh - var(--header-height, 80px) - var(--sticky-sidebar-bottom-margin, 20px)); // 限制最大高度，留出底部空间
      overflow-y: auto; // 内容超长时允许滚动
      background: var(--main-bg);
      border-radius: 12px;
      padding: 1.2rem;
      transition: border-color 0.3s ease; // 保留 hover 边框过渡
      align-self: flex-start; // ★ 添加：防止 flex item 拉伸高度

      &:hover {
        border-color: var(--main-color-light); // 假设有此变量
      }
      // 默认隐藏左侧边栏，在中等屏幕以上显示
      display: none; // 移动端优先隐藏

      @media (min-width: $breakpoint-md) { // ★ 使用 SCSS 变量
        display: block;
      }
    }

    // 中间文章区域样式
    .post-article {
      flex-grow: 1; // ★ 优化：使用 flex-grow 自动填充剩余空间
      min-width: 0; // ★ 优化：防止内容溢出 flex 容器
      margin: 0; // 使用 gap 控制间距，无需 margin
      padding: 1rem 2.2rem 2.2rem 2.2rem; // 保留内边距
      user-select: text; // 允许文本选择
      cursor: auto;
      // 保留卡片 hover 效果
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; // 显式添加 transition
      &:hover {
        border-color: var(--main-card-border);
        transform: translateY(-2px);
        box-shadow: 0 4px 20px var(--main-shadow-color);
      }

      .expired {
        margin: 1.2rem 0 2rem 0;
        padding: 0.8rem 1.2rem;
        border-left: 6px solid var(--main-warning-color);
        border-radius: 6px 16px 16px 6px;
        user-select: none;
        background-color: var(--main-warning-bg-color); // 可选：添加背景色
        strong {
          color: var(--main-warning-color);
        }
      }

      // 文章底部元信息区域
      .other-meta-bottom {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between; // 两端对齐
        flex-wrap: wrap; // 允许换行
        gap: 1rem; // 元素间距
        margin: 2rem 0; // 上下边距
        opacity: 0.8;

        .all-tags {
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-wrap: wrap; // 允许标签换行
          gap: 12px; // 标签间距

          .tag-item {
            // 应用 Mixin，传入底部标签特定参数
            @include tag-like-item-style(
              $base-bg: var(--main-card-border), // 底部标签使用不同背景色
              $hover-color: var(--main-color),
              $hover-bg: var(--main-color-bg)
            );
          }
        }

        .report {
           // 应用 Mixin，传入反馈按钮特定参数
           @include tag-like-item-style(
            $base-bg: var(--main-card-border),
            $hover-color: #efefef, // 特定 hover 文本色
            $hover-bg: var(--main-error-color), // 特定 hover 背景色 (错误色)
            $focus-outline-color: var(--main-error-color) // 焦点颜色与 hover 背景一致
          );
          .iconfont {
             margin-right: 6px; // 保持 6px 图标间距
          }
        }
      }
    }

    // 右侧边栏样式
    .main-aside {
      flex: 0 0 300px; // 保持固定宽度 300px
      position: sticky;
      // 使用 CSS 变量定义 top 和 max-height
      top: var(--header-height, 80px);
      height: fit-content;
      max-height: calc(100vh - var(--header-height, 80px) - var(--sticky-sidebar-bottom-margin, 20px));
      overflow-y: auto; // 超出滚动
      align-self: flex-start; // 防止 flex item 拉伸高度
    }

    // --- 响应式布局 ---

    // 中等屏幕 (例如：小于 $breakpoint-lg) - 隐藏右侧栏
    @media (max-width: $breakpoint-lg) { // ★ 使用 SCSS 变量
      .file-list-sidebar {
        display: none; // 隐藏左侧栏 (已在默认样式中隐藏，这里确保)
      }
      // .post-article 宽度会自动填充 (因为 flex-grow: 1)
    }

    // 平板或小屏幕 (例如：小于 $breakpoint-md) - 隐藏左侧栏
    @media (max-width: $breakpoint-md) { // ★ 使用 SCSS 变量
      
      .file-list-sidebar {
        display: none; // 隐藏左侧栏
      }
      .main-aside {
        display: none; // 隐藏右侧栏
      }
      // .post-article 宽度会自动填充整个 .post-content 区域
    }


    // 移动设备 (例如：小于 $breakpoint-sm) - 调整元信息和内容布局
    @media (max-width: $breakpoint-sm) { // ★ 使用 SCSS 变量
      // .post-meta 调整
      .post-meta {
        padding: 2rem 1rem 1.5rem 1rem; // 调整内边距
        .meta {
          justify-content: center; // 顶部元信息居中
          .categories {
             // margin-right: 0; // 已由 gap 处理
          }
          .tags {
            display: none; // 隐藏顶部的标签列表 (底部会显示)
          }
        }
        .title {
          font-size: 1.8rem; // 减小标题字号
          text-align: center; // 标题居中
          line-height: 1.4; // 调整行高
          margin: 1rem 0; // 调整间距
        }
        .other-meta {
          justify-content: center; // 日期等元信息居中
          gap: 0.5rem 1rem; // 调整间距
        }
      }

      // .post-content 调整 (此时左右侧边栏都已隐藏)
      .post-content {
        flex-direction: column; // 内容区改为垂直布局 (虽然只有一个article了)
        gap: 0; // 移除 gap
      }

      .post-article {
        border: none; // 移除边框
        padding: 1rem 1rem; // 调整内边距
        box-shadow: none; // 移除阴影
        margin: 0; // 确保没有外边距
        &:hover { // 移除 hover 效果
          transform: none;
          box-shadow: none;
          border-color: transparent; // 假设默认无边框
        }

        .other-meta-bottom {
          margin: 1.5rem 0 2rem 0; // 调整上下边距
          flex-direction: column; // 底部元信息改为垂直堆叠
          align-items: center; // 居中对齐
          gap: 1.5rem; // 调整堆叠间距

          .all-tags {
            justify-content: center; // 标签居中显示
            gap: 0.8rem 1rem; // 调整标签间距 (行间距和列间距)
          }
          // .report 的间距由父元素的 gap 控制
        }
      }
    }
  }
}

// 加载状态样式 (可选)
.post-loading {
  padding: 5rem 1rem;
  text-align: center;
  color: var(--vp-c-text-2); // 使用 VitePress 的次要文本颜色变量 (或其他适合的变量)
}

</style>