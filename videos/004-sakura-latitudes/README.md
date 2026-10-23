# 004 · 樱落，向北

**秒速五厘米的春日旅行**。96 秒、1920 × 1080、24 fps、16:9，中文地点与英文名称同屏，配原创钢琴与弦乐。

八幅日漫绘景以网上实景照片为参考，加入远近分层的花瓣飘落、翻转、微风、轻微水波与慢推镜。每站约 12 秒，以叠化连接。画面中的地点标注保留约略纬度，按南到北递增。

[本地播放页面](preview.html) · [MP4 成片](output/sakura-latitudes-96s.mp4) · [下载 MP4](https://raw.githubusercontent.com/seizethemoment/gpt-videos/main/videos/004-sakura-latitudes/output/sakura-latitudes-96s.mp4) · [简洁生成提示词](../../prompts/004-sakura-latitudes.md#简洁复用版) · [B 站发布文案](#b-站发布文案) · [八站关键帧](output/contact-sheet.png) · [逐站参考页](references.html) · [完整来源](sources.md)

| 时间 | 地点 | 纬度 |
| --- | --- | --- |
| 00:00 | 杭州 · 曲院风荷 | 30.25°N |
| 00:12 | 杭州 · 良渚大屋顶 | 30.37°N |
| 00:24 | 上海 · 顾村公园 | 31.35°N |
| 00:36 | 南京 · 鸡鸣寺 | 32.06°N |
| 00:48 | 日本东京 · 千鸟渊 | 35.69°N |
| 01:00 | 大连 · 龙王塘樱花园 | 38.84°N |
| 01:12 | 美国华盛顿 · 潮汐湖 | 38.88°N |
| 01:24 | 加拿大温哥华 · 伊丽莎白女王公园 | 49.24°N |

这是一条实景参考的日漫绘景动画短片，采用绘画背景与程序运动。景观视角和距离做了构图处理，非实地摄影纪录；路线按纬度设计，不表示同年花期或交通路线。详细图片与视频逐站列于 `sources.md`。

## 预览与重渲染

```sh
npm ci
npm start
```

打开 <http://127.0.0.1:8793/preview.html>。播放器支持八站章节跳转；`index.html` 可实时运行程序动画。

完整渲染需要 Node.js、Chrome/Chromium 与 FFmpeg。可以设置 `CHROME_PATH` 和 `FFMPEG_PATH`；没有系统 FFmpeg 时可用 Python 包 `imageio-ffmpeg`。导出 H.264 / AAC，使用 CRF 19 与 7.5 Mbps 峰值约束，支持渐进播放；视频内嵌八站章节。

```sh
npm run preview
npm run render
```

仓库已包含 `output/soundtrack.m4a`，重新渲染画面可直接使用。重写配乐时，在 macOS 上安装 Python NumPy，运行：

```sh
python3 make_audio.py
```

音色使用 macOS 自带 General MIDI，Swift / AVAudioEngine 离线渲染。配乐为新写的 D 大调钢琴、竖琴、长笛、弦乐与大提琴，80 BPM、32 小节；轻风和远处鸟鸣由程序合成。

## 文件

- `assets/`：8 幅内置 imagegen 绘景。
- `scenes.js`：地点、中英文名称、坐标、镜头与字幕数据。
- `animation.js`：Three.js 着色、Canvas 花瓣、过渡、字幕与片头片尾。
- `score.py` / `render_audio.swift` / `make_audio.py`：原创音轨。
- `render.mjs`：逐帧导出、章节嵌入、完整解码检查与关键帧。
- `serve.mjs`：支持视频 Range 请求与进度拖动的本地服务器。
- `output/render-report.json`：画幅、帧数、地点顺序及解码验证结果。
- `sources.md` / `references.html`：逐站实景图片与具体视频链接。

提示词见[简洁复用版与逐站画面指令](../../prompts/004-sakura-latitudes.md)。背景使用内置 imagegen；生成结果已拷入本目录 `assets/`。

## 已完成检查

2304 帧全部解码通过，音轨为 48 kHz 立体声 AAC。浏览器已验证实际播放、八站章节跳转与视频 Range 请求；八站纬度严格递增，参考页包含 28 个外部来源链接。最终文件约 78.7 MB，详细参数与校验值见 `output/render-report.json`。

## B 站发布文案

推荐标题：**樱落，向北｜把八处春天，寄给你**

备选标题：**用 AI，把八处春天画成日漫｜樱落，向北**

简介：

```text
如果春天可以被寄出，
我想让一片樱花，替我走远一点。

从杭州的曲桥与屋檐出发，经过上海、南京、东京、大连、华盛顿，最后落在温哥华的山色里。

八处风景，96 秒。
沿着纬度向北，收集不同地方的同一种温柔。

实景参考 · AI 日漫绘景 · 程序动画 · 原创配乐
每一站的名字，都标在了画面里。

你最想停在哪一站？

成片、提示词与源码：https://github.com/seizethemoment/gpt-videos
```

建议标签：`樱花` · `春天` · `日漫风` · `治愈系` · `风景` · `AI动画` · `原创音乐`
