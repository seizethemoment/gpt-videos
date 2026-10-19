# 光，如何成为照片

[返回作品集](../../README.md) · [制作提示词](../../prompts/002-camera-physics.md) · [原理参考与图示说明](sources.md)

90 秒中文摄影原理动画：从小孔成像出发，解释镜头对焦、光圈、景深，以及快门怎样记录运动。

- 成片：[`output/camera-physics-90s.mp4`](output/camera-physics-90s.mp4)
- 规格：1920 × 1080、16:9、30 fps、90 秒，H.264 / AAC 双声道。
- 声音：中文神经语音旁白、原创程序合成配乐与音效。
- 字幕：画面内中文字幕，以及可编辑的 [`subtitles.srt`](output/subtitles.srt)。
- 封面与关键帧：[`poster.png`](output/poster.png)、[`contact-sheet.png`](output/contact-sheet.png)。

## 观看

打开 MP4，或在本目录运行：

```sh
npm start
```

浏览器访问 `http://127.0.0.1:8791/preview.html`。播放器支持进度拖动。离线版 `camera-physics-offline.html` 内嵌视频与封面，下载后可直接双击播放。

## 叙事与视觉

采用深色光学实验室的视觉语言：细网格、精细镜片、青色与暖金的光路、流动的光点，以及简洁的大标题。用于比较景深与运动模糊的图像均为本项目绘制的原创示意插画。

| 时间 | 内容 |
| --- | --- |
| 00:00–00:08 | 相机与光：提出成像问题 |
| 00:08–00:22 | 光线穿过小孔，为何上下倒立 |
| 00:22–00:32 | 孔径、进光量、几何模糊与衍射的取舍 |
| 00:32–00:46 | 薄透镜会聚与对焦 |
| 00:46–00:57 | f 数、入瞳直径与光量 |
| 00:57–01:08 | 离焦光斑与景深 |
| 01:08–01:22 | 短曝光冻结运动，长曝光累积轨迹 |
| 01:22–01:30 | 归纳：会聚在哪里、光束多宽、记录多久 |

## 修改与渲染

1. 修改 `narration.json` 中的章节和旁白；修改 `animation.js` 中的画面。
2. 安装渲染依赖。
3. 按需生成语音与音乐，再逐帧导出。

```sh
npm ci
python3 -m pip install -r requirements.txt
# 未安装本机 Chrome 时，安装 Playwright Chromium：
npx playwright install chromium

# 仅修改画面时，可以直接使用仓库中现有音轨。
# 需要重新生成旁白时执行（edge-tts 需要网络）：
python3 make_audio.py --neural

npm run preview
npm run render
```

macOS 也可执行 `python3 make_audio.py`，使用系统 Tingting 语音离线生成旁白。`CHROME_PATH` 可指定浏览器，`FFMPEG_PATH` 可指定 FFmpeg；默认寻找本机 Chrome、Playwright Chromium 和 imageio-ffmpeg。

中文使用系统 PingFang SC 或 Noto Sans CJK SC。字体文件未随项目分发；跨系统渲染可能出现少量字体差异。

## 文件

- `animation.js`：纯时间函数 `renderFrame(t)`，8 个动画段落、光路和原创插画。
- `narration.json`：章节、旁白和时间范围。
- `narration-data.js`：供浏览器读取的章节与字幕时间数据。
- `make_audio.py`：语音合成、字幕、原创配乐、音效与语音避让混音。
- `render.mjs`：关键帧、光学关系检查、2700 帧渲染与视频解码检查。
- `serve.mjs`：支持字节范围请求的本地播放器服务。
- `sources.md`：原理来源和示意图的适用范围。

视觉呈现参考 [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) 中代码动画与解释类视频的形式，所有画面、图示和配乐在本项目中重新制作。
