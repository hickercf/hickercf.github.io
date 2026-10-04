# Hickercf'blog

以暖白、墨綠與文字排版重塑的個人部落格。沿用目前的 GitHub Pages 與 `hickercf.fun`，保留原有九篇文章、三個分類、原文章網址與二十四張圖片。

## 預覽與生成

使用 Node.js，在儲存庫根目錄執行：

```sh
node site-source/build.mjs
node site-source/check.mjs
node site-source/preview.mjs
```

在瀏覽器開啟 http://127.0.0.1:4173/。網站以靜態 HTML 提供內容，不需安裝套件，也不需要 JavaScript 才能閱讀文章。JavaScript 僅用於標示目前章節與顯示返回頂部。

## 編輯文章

- `site-source/content/posts.json`：文章標題、分類、日期、網址、摘要、閱讀時間、目錄與精選設定。
- `site-source/content/articles/`：文章正文 HTML；新文章可以先複製一篇現有文章再修改。
- `site-source/content/assets/`：文章圖片，正文以 `/assets/檔名` 引用。
- `site-source/site.config.json`：名稱、作者、網站簡介、正式網址與 GitHub 連結。
- `site-source/styles.css`：共用配色、字體、間距與手機版排版。

新增文章後在 `posts.json` 新增對應資料，再執行生成與檢查。`build.mjs` 會把頁面、CSS、JavaScript 與圖片更新到目前 GitHub Pages 使用的儲存庫根目錄；將生成結果與來源一併提交即可。只有一篇文章應設定 `featured: true`。

目前首頁精選的是 Transformer 筆記。文章目錄中的 `id` 必須與正文標題的 `id` 相同；`check.mjs` 會檢查頁面、內部連結、章節錨點、圖片及原文是否完整。

## 發布注意事項

保留原有 `CNAME` 和 GitHub Pages 的發布來源設定。設計修改使用獨立分支；合併到原本的 Pages 發布分支後會更新正式網站。

公開儲存庫原先只有 Hexo 生成後的檔案。本版加入可重複生成的靜態網站來源；若仍使用另一本機 Hexo 專案或 blog-manager 發布，舊的生成流程可能覆蓋新版，需要把新版設計整合到該原始碼後再使用它發布。

網站字體透過 Google Fonts 載入 Noto Serif TC、Noto Sans TC 與 DM Sans；無網路時會使用裝置上的中文字體。
