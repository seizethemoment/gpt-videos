# 原理参考与图示说明

核对日期：2026-10-19。资料用于核对物理概念；片中文字、插画和光路图均重新制作。

## 成像原理 / Imaging

- [Exploratorium — Pringles Pinhole](https://annex.exploratorium.edu/science-explorer/pringles_pinhole.html)：暗盒、针孔与倒立投影实验。
- [OpenStax — University Physics Volume 3, §2.4 Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses)：近轴薄透镜、实像、焦距与成像公式。

小孔段以均匀介质中的直线光路解释上下倒立。镜头段采用 `1/f = 1/u + 1/v`，绘图参数 `f=280、u=555、v≈565.09`。为直接观察合焦关系，图中移动感光面；真实相机通常移动镜组。薄透镜图不是实际摄影镜头的设计图。

## 曝光三角 / Exposure Triangle

- [Cambridge in Colour — Camera Exposure](https://www.cambridgeincolour.com/tutorials/camera-exposure.htm)：光圈、快门与 ISO 的联动及档位。
- [Nikon — Understanding Maximum Aperture](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture)：f 数和景深的关系。
- [Cambridge in Colour — Understanding Depth of Field](https://www.cambridgeincolour.com/tutorials/depth-of-field.htm)：离焦光斑、可接受清晰度与景深。
- [Nikon — Understanding Shutter Speed](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-shutter-speed)：有效曝光时长与运动表现。

`N=f/D`，D 为入瞳直径。同一场景和透光率下，理想像面照度约正比于 `1/N²`；实际采光量再乘以有效曝光时间。f 数越小，通常进光越多；焦距、对焦距离和观察条件不变时，通常景深更浅。

光圈比较采用 f/2.8 与 f/8，理想光量比约 8.16。景深插画已将亮度归一化，只比较虚化。快门对比用 `1/1000 s` 与 `1/15 s` 对旋转物体的曝光时段进行多姿态积分，播放运动放慢、亮度归一化。快门既可由机械方式，也可由电子方式控制。

## ISO、噪声与高光 / Gain, Noise & Highlights

- [DPReview — The ins and outs of ISO: Where ISO gets complex](https://www.dpreview.com/articles/ins-and-outs-of-iso-where-iso-gets-complex/)：ISO 与输出明度、模拟增益、数字处理和原始数据的关系。
- [DPReview — Sources of noise, part two: Electronic noise](https://www.dpreview.com/articles/0388507676/sources-of-noise-part-two-electronic-noise/)：上游、下游电子噪声及增益的影响。

片中“ISO 调节增益与输出亮度”是操作层面的简化。具体机身可能组合模拟增益、数字缩放和色调映射，ISO 也不总能直接决定 RAW 像素数值。提高 ISO 不会增加光子数；不能简单地把高 ISO 当作光子噪声的来源。

在光圈、快门和场景不变的 ISO 演示中，光子条保持不变，颗粒图案的相对强度也保持不变。联动段中，为冻结动作而减少曝光时间会降低采光，ISO 补偿只能恢复输出亮度。实际相机的读出噪声、转换增益、高光余量和动态范围还与传感器及具体设置有关；片中颗粒仅是定性示意，不代表某款机身测试。

## 联动计算

固定场景照明、镜头透光率，采用未饱和的线性输出近似：

```text
相对采光 L = (N_ref / N)² × (t / t_ref)
相对输出亮度 B = L × ISO / ISO_ref
相对输出亮度档位 ΔB = log₂(B)
```

| 步骤 | 光圈 | 快门 | ISO | 相对采光 | 相对输出亮度 |
| --- | --- | --- | --- | --- | --- |
| 基准 | f/4 | 1/125 s | 100 | 1× | 1× |
| 光圈开大一档 | f/2.8 | 1/125 s | 100 | 2× | 2× |
| 快门加快一档 | f/2.8 | 1/250 s | 100 | 1× | 1× |
| 快门再加快两档 | f/2.8 | 1/1000 s | 100 | 1/4× | 1/4× |
| ISO 提高两档 | f/2.8 | 1/1000 s | 400 | 1/4× | 1× |

f/2.8 为常用显示值；联动计算内部使用 `sqrt(8)`，让 f/4 到 f/2.8 精确相差一档。动画在 log₂ 空间插值，渲染时检查各阶段的光量、亮度以及三个场景最终的补偿关系。

## 经典应用 / Applications

- [Nikon — Capturing or Freezing Motion in Photos](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/capturing-or-freezing-motion-in-photos)：短曝光与冻结运动。
- [Nikon — Understanding Auto ISO](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-auto-iso)：快门、可用光线与 ISO 的操作配合。

| 场景 | 示例结果 | 优先考虑 |
| --- | --- | --- |
| 人像 Portrait | f/2 · 1/250 s · ISO 400 | 背景虚化、眼部对焦、人物运动与手持稳定性 |
| 运动 Sports | f/2.8 · 1/1000 s · ISO 1600 | 冻结动作，再用光圈和 ISO 配合亮度 |
| 夜景 Nightscape | f/8 · 4 s · ISO 100 | 三脚架、景深、光轨与高光 |

这些是解释选择顺序的示例起点，不能脱离现场照明、焦距、主体运动和相机能力使用。三幅原创分层插画的亮度已归一化，分别展示背景虚化、运动痕迹和光轨；不宣称是实拍样张。

## 制作参考与工具

- [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos)：代码动画与解释短片的视觉形式。
- [Playwright](https://playwright.dev/) 与 [FFmpeg](https://ffmpeg.org/)：逐帧采集与编码。
- [edge-tts](https://github.com/rany2/edge-tts)：中文语音合成，使用 `zh-CN-YunxiNeural`。

没有复用参考资料的图片、视频或书页。配乐与音效由 NumPy 合成。
