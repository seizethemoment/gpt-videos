# 原理参考与图示说明

核对日期：2026-10-19。以下资料用于核对概念与设计讲解顺序；项目中的文字、插画与光路图重新编写和绘制。

## 小孔成像

- [Exploratorium — Pringles Pinhole](https://annex.exploratorium.edu/science-explorer/pringles_pinhole.html)：遮光暗盒、针孔与倒立投影的实验。
- [Cambridge in Colour — Diffraction Limited Photography](https://www.cambridgeincolour.com/tutorials/diffraction-photography.htm)：孔径缩小时衍射光斑的变化，以及清晰度与孔径的取舍。

片中以均匀介质中的直线光路解释上下倒立。孔径比较同时考虑几何模糊与衍射，孔洞与衍射光斑不按真实尺寸绘制。三幅小孔图采用相同曝光时间的示意亮度。

## 镜头与对焦

- [OpenStax — University Physics Volume 3, §2.4 Thin Lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses)：近轴薄透镜、实像、主光线、焦距和薄透镜成像公式。

同一物点的近轴光线经理想会聚透镜折射，汇到同一像点。采用 `1/f = 1/u + 1/v`；示意数值 `f = 280`、`u = 555`，计算得到 `v ≈ 565.09`，单位为绘图坐标长度。为直接展示合焦关系，动画移动感光面；实际相机通常通过移动镜组对焦。真实镜头的多片结构、像差和非近轴效应不在本片范围内。

## 光圈与景深

- [Nikon — Understanding Maximum Aperture](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-maximum-aperture)：f 数、有效开口和景深的关系。
- [Cambridge in Colour — Understanding Depth of Field](https://www.cambridgeincolour.com/tutorials/depth-of-field.htm)：离焦光斑、可接受清晰度与景深。

定义 `N = f/D`，其中 D 为从入口观察到的有效口径（入瞳直径）。同焦距、同曝光时间与同场景下，忽略透光率等因素，像面照度约正比于 `1/N²`。f/2.8 与 f/8 的理想光量比约为 `(8/2.8)² ≈ 8.16`。

景深比较固定焦距、对焦距离与观察条件，以相同离焦量下的光束宽度说明光斑变化。景深插画已将亮度归一化，以单独比较清晰与虚化；这是效果示意，不是实拍镜头测试。

## 快门与运动模糊

- [Nikon — Understanding Shutter Speed](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/understanding-shutter-speed)：曝光时间与画面表现。
- [Nikon — Capturing or Freezing Motion in Photos](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/capturing-or-freezing-motion-in-photos)：短曝光冻结运动、长曝光记录运动轨迹。

旋转物体的快门对比按曝光时间内的多个姿态积分绘制，曝光分别为 `1/1000 s` 与 `1/15 s`。运动放慢播放，亮度归一化，只比较运动痕迹。理想恒定照明、同光圈且未饱和时，曝光时间翻倍，接收光量约翻倍。

片中所说的快门是有效曝光时间控制，机械与电子方式均可实现。具体帘幕扫描、滚动快门与闪光同步另属更深入的主题。

## 制作参考与工具

- [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos)：代码动画与解释类短片的展示形式。
- [Playwright](https://playwright.dev/) 与 [FFmpeg](https://ffmpeg.org/)：逐帧采集、编码与播放检查。
- [edge-tts](https://github.com/rany2/edge-tts)：中文语音合成客户端；本次使用 `zh-CN-YunxiNeural`。

片中没有复用上述资料的图片、视频或书籍页面。配乐与音效使用 NumPy 合成。
