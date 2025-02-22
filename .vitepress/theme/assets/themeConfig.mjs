
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前脚本的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义要扫描的目录
const repositoryPath = path.join(__dirname, '../../../pages/repository');
/**
 * 扫描指定目录下的文件和文件夹，并返回一个包含文件和文件夹信息的数组。
 * @param {string} dirPath 要扫描的目录路径。
 * @returns {Promise<Array<{text: string, link: string, icon?: string}>>} 包含文件和文件夹信息的数组。
 */
async function scanRepository(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);
    console.log(files);
    const Ritems = [];
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        // 如果是文件，则添加到 items 数组中，link 指向该文件
        Ritems.push({
          text: file, // 文件名作为 text
          link: `/pages/repository/${file}`, // 文件路径作为 link
          icon: 'fish', // 可以设置一个默认的 icon
        });}
    //   } else if (stats.isDirectory()) {
    //     // 如果是文件夹，则添加到 items 数组中，link 指向该文件夹
    //     items.push({
    //       text: file, // 文件夹名作为 text
    //       link: `/pages/repository/${file}`, // 文件夹路径作为 link
    //       icon: 'folder', // 可以设置一个默认的 icon
    //     });
    //   }
    // }
  }    
  console.log(Ritems);
  return Ritems;
}catch (error) {
    console.error('Error scanning repository:', error);
    return []; // 发生错误时返回一个空数组
  }
}

// 主题配置
export const themeConfig = {
  // 站点信息
  siteMeta: {
    // 站点标题
    title: "Time",
    // 站点描述
    description: "Where is time",
    // 站点logo
    logo: "/images/logo/favicon.svg",
    // 站点地址
    site: "https://www.doit.ip-ddns.com",
    // 语言
    lang: "zh-CN",
    // 作者
    author: {
      name: "Admin",
      cover: "/images/logo/favicon.webp",
      email: "hellowangdada@outlook.com",
      link: "https://www.doit.ip-ddns.com/",
    },
  },
  // 备案信息
  // icp: "萌ICP备114514号",
  // 建站日期
  since: "2025-07-28",
  // 每页文章数据
  postSize: 8,
  // inject
  inject: {
    // 头部
    // https://vitepress.dev/zh/reference/site-config#head
    header: [
      // favicon
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // RSS
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "https://www.doit.ip-ddns.com/rss.xml",
        },
      ],
      // 预载 CDN
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://s1.hdslb.com",
        },
      ],
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://mirrors.sustech.edu.cn",
        },
      ],
      // HarmonyOS font
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
        },
      ],
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.css",
        },
      ],
      // iconfont
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css",
        },
      ],
      // Embed code
      ["link", { rel: "preconnect", href: "https://use.sevencdn.com" }],
      ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
      [
        "link",
        {
          crossorigin: "anonymous",
          href: "https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap",
          rel: "stylesheet",
        },
      ],
      // 预载 DocSearch
      [
        "link",
        {
          href: "https://X5EBEZB53I-dsn.algolia.net",
          rel: "preconnect",
          crossorigin: "",
        },
      ],
    ],
  },
  // 导航栏菜单
  nav: [
    {
      text: "文库",
      items: [
        { text: "文章列表", link: "/pages/archives", icon: "article" },
        { text: "全部分类", link: "/pages/categories", icon: "folder" },
        { text: "全部标签", link: "/pages/tags", icon: "hashtag" },
      ],
    },
    {
      text: "专栏",
      items: [
        { text: "技术分享", link: "/pages/categories/技术分享", icon: "technical" },
        { text: "我的项目", link: "/pages/project", icon: "code" },
        { text: "效率工具", link: "/pages/tools", icon: "tools" },
      ],
    },
    {
      text: "文档库",
      items: await scanRepository(repositoryPath),
    },
    {
      text: "我的",
      items: [
        { text: "畅所欲言", link: "/pages/message", icon: "chat" },
        { text: "致谢名单", link: "/pages/thanks", icon: "reward" },
        { text: "关于本站", link: "/pages/about", icon: "contacts" },
      ],
    },
  ],
  // 导航栏菜单 - 左侧
  navMore: [
    {
      name: "博客",
      list: [
        {
          icon: "/images/logo/taiji.svg",
          name: "主站",
          url: "/",
        },
        // {
        //   icon: "/images/logo/logo.webp",
        //   name: "博客镜像站",
        //   url: "https://blog-backup.imsyy.top/",
        // },
      ],
    },
    {
      name: "服务",
      list: [
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/6613465358077.png",
          name: "起始页",
          url: "https://nav.imsyy.top/",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/661346d418ad7.png",
          name: "今日热榜",
          url: "https://hot.imsyy.top/",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/66134722586fa.png",
          name: "站点监测",
          url: "https://status.imsyy.top/",
        },
      ],
    },
    {
      name: "项目",
      list: [
        {
          icon: "/images/logo/logo.webp",
          name: "Curve",
          url: "https://github.com/imsyy/vitepress-theme-curve",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/07/66124f5fc63c8.png",
          name: "SPlayer",
          url: "https://github.com/imsyy/SPlayer",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/6613465358077.png",
          name: "Snavigation",
          url: "https://github.com/imsyy/SPlayer",
        },
        {
          icon: "/images/logo/logo.webp",
          name: "Home",
          url: "https://github.com/imsyy/home",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/661346d418ad7.png",
          name: "DailyHotApi",
          url: "https://github.com/imsyy/DailyHotApi",
        },
        {
          icon: "https://pic.efefee.cn/uploads/2024/04/08/66134722586fa.png",
          name: "site-status",
          url: "https://github.com/imsyy/site-status",
        },
      ],
    },
  ],
  // 封面配置
  cover: {
    // 是否开启双栏布局
    twoColumns: false,
    // 是否开启封面显示
    showCover: {
      // 是否开启封面显示 文章不设置cover封面会显示异常，可以设置下方默认封面
      enable: true,
      // 封面布局方式: left | right | both
      coverLayout: 'both',
      // 默认封面(随机展示)
      defaultCover: [
        'https://alist.doit.dns-dynamic.net/d/%E5%A4%A9%E7%BF%BC/%E5%9B%BE%E5%BA%8A/%E5%A3%81%E7%BA%B8/%E3%80%90%E5%93%B2%E9%A3%8E%E5%A3%81%E7%BA%B8%E3%80%91%E5%89%91%E5%AE%A2-%E6%B0%B4%E5%A2%A8.png',
        'https://alist.doit.dns-dynamic.net/d/%E5%A4%A9%E7%BF%BC/%E5%9B%BE%E5%BA%8A/%E5%B0%81%E9%9D%A2/%E4%B8%8B%E9%9B%A8-%E5%95%86%E5%BA%97-%E7%BB%BF%E8%89%B2%E6%8A%A4%E7%9C%BC.webp',
        "https://alist.doit.dns-dynamic.net/d/%E5%A4%A9%E7%BF%BC/%E5%9B%BE%E5%BA%8A/%E5%B0%81%E9%9D%A2/%E5%8A%A8%E7%89%A9-%E5%8F%AF%E7%88%B1-%E5%9B%B4%E6%A0%8F.webp",
        // 'https://example.com/3.avif'
      ]
    }
  },
  // 页脚信息
  footer: {
    // 社交链接（请确保为偶数个）
    social: [
      {
        icon: "email",
        link: "mailto:one@imsyy.top",
      },
      {
        icon: "github",
        link: "https://www.github.com/taiji666/",
      },
      {
        icon: "telegram",
        link: "https://t.me/bottom_user",
      },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/98544142",
      },
      {
        icon: "qq",
        link: "https://res.abeim.cn/api/qq/?qq=1539250352",
      },
      {
        icon: "twitter-x",
        link: "https://twitter.com/iimmsyy",
      },
    ],
    // sitemap
    sitemap: [
      {
        text: "博客",
        items: [
          { text: "近期文章", link: "/" },
          { text: "全部分类", link: "/pages/categories" },
          { text: "全部标签", link: "/pages/tags" },
          { text: "文章归档", link: "/pages/archives", newTab: true },
        ],
      },
      {
        text: "项目",
        items: [
          { text: "Home", link: "https://github.com/imsyy/home/", newTab: true },
          { text: "SPlayer", link: "https://github.com/imsyy/SPlayer/", newTab: true },
          { text: "DailyHotApi", link: "https://github.com/imsyy/DailyHotApi/", newTab: true },
          { text: "Snavigation", link: "https://github.com/imsyy/Snavigation/", newTab: true },
        ],
      },
      {
        text: "专栏",
        items: [
          { text: "技术分享", link: "/pages/categories/技术分享" },
          { text: "我的项目", link: "/pages/project" },
          { text: "效率工具", link: "/pages/tools" },
        ],
      },
      {
        text: "页面",
        items: [
          { text: "畅所欲言", link: "/pages/message" },
          { text: "关于本站", link: "/pages/about" },
          { text: "隐私政策", link: "/pages/privacy" },
          { text: "版权协议", link: "/pages/cc" },
        ],
      },
      // {
      //   text: "服务",
      //   items: [
      //     { text: "站点状态", link: "https://status.imsyy.top/", newTab: true },
      //     { text: "一个导航", link: "https://nav.imsyy.top/", newTab: true },
      //     { text: "站点订阅", link: "https://blog.imsyy.top/rss.xml", newTab: true },
      //     {
      //       text: "反馈投诉",
      //       link: "https://eqnxweimkr5.feishu.cn/share/base/form/shrcnCXCPmxCKKJYI3RKUfefJre",
      //       newTab: true,
      //     },
      //   ],
      // },
    ],
  },
  // 评论
  comment: {
    enable: false,
    // 评论系统选择
    // artalk / twikoo
    type: "artalk",
    // artalk
    // https://artalk.js.org/
    artalk: {
      site: "",
      server: "",
    },
    // twikoo
    // https://twikoo.js.org/
    twikoo: {
      // 必填，若不想使用 CDN，可以使用 pnpm add twikoo 安装并引入
      js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/twikoo/1.6.39/twikoo.all.min.js",
      envId: "",
      // 环境地域，默认为 ap-shanghai，腾讯云环境填 ap-shanghai 或 ap-guangzhou；Vercel 环境不填
      region: "ap-shanghai",
      lang: "zh-CN",
    },
  },
  // 侧边栏
  aside: {
    // 站点简介
    hello: {
      enable: true,
      text: "这里有关于<strong>开发</strong>相关的问题和看法，也会有一些<strong>奇技淫巧</strong>的分享，其中大部分内容会侧重于<strong>前端开发</strong>。希望你可以在这里找到对你有用的知识和教程。",
    },
    // 目录
    toc: {
      enable: true,
    },
    // 标签
    tags: {
      enable: true,
    },
    // 倒计时
    countDown: {
      enable: true,
      // 倒计时日期
      data: {
        name: "春节",
        date: "2025-01-29",
      },
    },
    // 站点数据
    siteData: {
      enable: true,
    },
  },
  // 友链
  friends: {
    // 友链朋友圈
    circleOfFriends: "",
    // 动态友链
    dynamicLink: {
      server: "",
      app_token: "",
      table_id: "",
    },
  },
  // 音乐播放器
  // https://github.com/imsyy/Meting-API
  music: {
    enable: false,
    // url
    url: "https://api-meting.example.com",
    // id
    id: 9379831714,
    // netease / tencent / kugou
    server: "netease",
    // playlist / album / song
    type: "playlist",
  },
  // 搜索
  // https://www.algolia.com/
  search: {
    enable: false,
    appId: "",
    apiKey: "",
  },
  // 打赏
  rewardData: {
    enable: true,
    // 微信二维码
    wechat: "https://pic.efefee.cn/uploads/2024/04/07/66121049d1e80.webp",
    // 支付宝二维码
    alipay: "https://pic.efefee.cn/uploads/2024/04/07/661206631d3b5.webp",
  },
  // 图片灯箱
  fancybox: {
    enable: true,
    js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
    css: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
  },
  // 外链中转
  jumpRedirect: {
    enable: true,
    // 排除类名
    exclude: [
      "cf-friends-link",
      "upyun",
      "icp",
      "author",
      "rss",
      "cc",
      "power",
      "social-link",
      "link-text",
      "travellings",
      "post-link",
      "report",
      "more-link",
      "skills-item",
      "right-menu-link",
      "link-card",
    ],
  },
  // 站点统计
  tongji: {
    "51la": "",
  },
};

console.log(themeConfig.nav[2].items);