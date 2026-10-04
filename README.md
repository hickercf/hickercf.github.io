# Hickercf'blog

以暖白、墨绿与文字排版重塑的简体中文个人博客。沿用 GitHub Pages 与 `hickercf.fun`，保留原有九篇文章、文章网址与二十四张图片，并从个人 Notion 笔记新增六篇渗透学习文章和十四张实验截图。

## 预览与生成

使用 Node.js，在仓库根目录运行：

```sh
node site-source/build.mjs
node site-source/check.mjs
node site-source/preview.mjs
```

在浏览器打开 http://127.0.0.1:4173/。网站以静态 HTML 提供内容，无需安装依赖，也不需要 JavaScript 才能阅读文章。JavaScript 仅用于标记当前章节与显示返回顶部。

## 编辑文章

- `site-source/content/posts.json`：文章标题、分类、日期、网址、摘要、阅读时间、目录与精选设置。
- `site-source/content/articles/`：文章正文 HTML；新文章可以先复制一篇现有文章再修改。
- `site-source/content/assets/`：文章图片，正文以 `/assets/文件名` 引用。
- `site-source/site.config.json`：名称、作者、网站简介、正式网址与 GitHub 链接。
- `site-source/styles.css`：共用配色、字体、间距与手机版排版。

新增文章后在 `posts.json` 添加对应数据，再运行生成与检查。`build.mjs` 会把页面、CSS、JavaScript 与图片更新到 GitHub Pages 使用的仓库根目录；将生成结果与来源一并提交即可。只有一篇文章应设置 `featured: true`。

首页精选为“渗透测试学习笔记：从基础到实践”，作为网络基础、SQL 注入、Burp Suite、靶场练习与 MS17-010 实验的学习入口。文章目录中的 `id` 必须与正文标题的 `id` 相同；`check.mjs` 会检查页面、内部链接、章节锚点、图片及正文是否完整。

Notion 内容导入于 2026-10-04，文章元数据中的 `source` 保留原笔记地址和更新时间。这是本次导入的内容快照，不会自动同步后续 Notion 修改；更新笔记时编辑对应正文与元数据，再重新生成发布。截图已保存为仓库中的静态图片，页面不依赖临时签名地址。

## 发布注意事项

保留原有 `CNAME` 和 GitHub Pages 的发布来源设置。设计修改使用独立分支；合并到原本的 Pages 发布分支后会更新正式网站。

公开仓库原先只有 Hexo 生成后的文件。本版加入可重复生成的静态网站源文件；若仍使用其他本机 Hexo 项目或 blog-manager 发布，旧的生成流程可能覆盖新版，需要先将新版设计整合到该项目。

网站字体通过 Google Fonts 加载 Noto Serif SC、Noto Sans SC 与 DM Sans；无网络时会使用设备上的中文字体。
