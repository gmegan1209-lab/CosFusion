# CosFusion · 次元破壁妆造融合平台

浏览器里完成的动漫角色妆面解析、真人五官试妆和假发贴图。妆面在本地计算，不上传服务器。

- 试妆演示：https://gmegan1209-lab.github.io/CosFusion/
- 项目介绍：https://gmegan1209-lab.github.io/CosFusion/official.html

## 功能

1. 上传动漫人物图，拆出眼妆、眼线、颊彩、唇妆、高光
2. 开摄像头或上传自拍，按 FaceMesh 五官关键点迁移妆面
3. 在角色图上涂出头发，生成透明假发贴图，下沿贴合额头，可拖动缩放

## 技术

- 纯前端：HTML / CSS / JavaScript
- 人脸关键点：MediaPipe FaceMesh
- 妆层可分别开关和调节浓度
- 假发支持手动涂选、点选同类色，摄像头画面下保持正向贴合

摄像头需在 `localhost` 或 `https` 下使用。

```text
index.html          试妆页
official.html       项目介绍
css/app.css         试妆样式
css/official.css    介绍页样式
js/app.js           妆面迁移与假发贴图
js/official.js      介绍页交互
hair2d.js           头发涂选
```

本地预览：

```bash
npx --yes serve .
```
