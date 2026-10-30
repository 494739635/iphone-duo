# iPhone Duo — Interactive Teardown Lab

完全程序化生成的 iPhone Duo 三维拆解可视化页面。仅使用 Three.js（CDN 引入）、HTML、CSS 与原生 JavaScript——**所有 3D 模型、纹理、标注均由代码实时生成，不依赖任何外部 3D 模型或图片资源**。

在线访问：<https://494739635.github.io/iphone-duo/>

## 运行

页面需要通过本地 HTTP 服务运行（`file://` 下 ES Module 与摄像头会被浏览器禁用）：

```bash
cd iphone-duo-teardown
python3 -m http.server 8000
# 打开 http://localhost:8000
```

需联网加载 Three.js 0.170（jsdelivr CDN，import map 已固定版本）。

## 功能

- **模型**：22 个部件、47 颗五种批头（P2 / T4 / Y000 / PH00 / HEX）的独立紧固件，含 10 层内屏堆叠、双 48MP Fusion 相机岛、可变扭矩铰链齿轮系、A20 Pro 单层主板、双电池、均热板、触感引擎等
- **交互**：点击部件触发高亮 + 提取动画，拖动旋转 / 滚轮与双指缩放，双击或按钮聚焦；滑杆控制分层爆炸，螺丝在 80% 后依次散落
- **观察工具**：X 光透视、官方尺寸标注（W/H/D）、昼夜星空双配色、自动环绕、方向罗盘
- **面板**：部件清单（搜索 / 分类筛选）、参数检查器（规格、技术说明、维修情报）
- **实景相机**：后置 / 前置摄像头画面本地叠合（仅本机处理，不上传）
- **快捷键**：`1–4` 视角 · `E` 拆解 · `X` 透视 · `D` 尺寸 · `R` 重置 · `F` 聚焦 · `ESC` 关闭 · `/` 搜索

## 参考来源

- Apple Newsroom — iPhone Duo 技术规格（展开 164.6×117.8×5.2 mm、闭合 84.1×117.8×11.3 mm、254 g、7.6″/5.4″ OLED、A20 Pro、IP68）
- Apple Service Manual（维修手册拆解顺序与紧固件分布）
- iFixit Teardown（可维修性 5/10、铰链结构与电解除胶工艺）

注：iPhone Duo 为虚构/原型机型代号，页面定位为工程样机档案式展示。
