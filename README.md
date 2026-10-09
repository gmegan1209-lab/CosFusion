# CosFusion · 次元破壁妆造融合平台

浏览器里完成的 **动漫角色妆面解析 + 真人五官试妆 + 假发贴图** 演示。妆面在本地计算，不上传服务器。

**求职可直接附上这两个链接（发布 GitHub Pages 后）：**

- 在线演示：`https://你的用户名.github.io/CosFusion/`
- 项目仓库：`https://github.com/你的用户名/CosFusion`

把上面的 `你的用户名` 换成你的 GitHub 用户名即可。

## Live pages

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 试妆演示（首页） | [index.html](index.html) | 最新版：角色解析、摄像头/自拍试妆、假发涂选与拖动 |
| 项目官网 | [official.html](official.html) | 结项答辩风格介绍页，含产品闭环与技术主线 |

本地预览：用 VS Code Live Server，或在本目录执行：

```bash
npx --yes serve .
```

摄像头需要 `localhost` 或 `https`。GitHub Pages 自带 https，开镜头会比直接双击 html 更稳。

## 这个项目解决什么

漫展 / Cosplay 妆造还原成本高、效率低。CosFusion 把流程收成三步：

1. 上传动漫人物图，拆出眼妆、眼线、颊彩、唇妆、高光
2. 开摄像头或上传自拍，按 FaceMesh 五官关键点迁移妆面
3. 在角色图上涂出头发，生成透明假发贴图，下沿贴合额头，可拖动缩放

## 技术要点

- 纯前端：HTML / CSS / Canvas / JavaScript
- 人脸关键点：MediaPipe FaceMesh（CDN）
- 妆层：眼妆、眼线、虹膜、唇、颊彩、高光，可分别开关和调浓度
- 假发：手动涂选 / 点选同类色，透明 PNG 贴合，摄像头镜像下保持正向
- 设计系统：Slush sticker 视觉 + 原站滚动显现、指针光泽、悬停动效

## 仓库里还有什么

开发过程中的迭代页（`试妆网站2.html`、`添加假发版.html`、`virtual-tryon.html`）保留作版本对照。大视频和答辩 PPT 未纳入 Git，避免超过 GitHub 单文件限制。

## 3 步发布到 GitHub Pages（可被公开打开）

本机还没有登录 GitHub，所以需要你在网页上点一次授权。仓库文件已经准备好。

1. 打开 [https://github.com/new](https://github.com/new)，仓库名填 `CosFusion`，选 **Public**，不要勾选 “Add README”
2. 在本项目目录执行：

```bash
git remote add origin https://github.com/你的用户名/CosFusion.git
git branch -M main
git push -u origin main
```

3. 打开仓库 **Settings → Pages**，Source 选 `Deploy from a branch`，Branch 选 `main` / `/`（根目录），保存。一两分钟后访问：

`https://你的用户名.github.io/CosFusion/`

## 简历上可以怎么写

> CosFusion 次元妆造融合平台（个人项目）  
> 独立完成角色妆面解析、MediaPipe 五官迁移与假发贴图交互；纯前端本地推理，已部署 GitHub Pages。  
> Demo: https://你的用户名.github.io/CosFusion/

## 搜索可见性说明

GitHub Pages 上线后，任何人有链接就能打开。Google / Bing 收录通常要几天到几周，求职投递请直接贴演示链接，不必等搜索引擎。

作者：郭梦涵
