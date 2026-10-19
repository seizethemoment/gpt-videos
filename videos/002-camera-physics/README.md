# 光，如何成为照片

[返回作品集](../../README.md) · [制作提示词](../../prompts/002-camera-physics.md) · [原理参考与图示说明](sources.md)

150 秒中文摄影原理动画：由小孔与镜头成像切入，聚焦光圈、快门速度、ISO 怎样配合，最后应用到人像、运动与夜景。保留深色光学实验室、暖金与青色光路的视觉风格，核心术语中英文同屏。

- 成片：[`output/camera-physics-exposure-triangle.mp4`](output/camera-physics-exposure-triangle.mp4)
- 规格：1920 × 1080、16:9、30 fps、150 秒，H.264 / AAC 双声道。
- 声音：中文神经语音旁白、原创程序合成配乐与音效。
- 字幕：画面内中文字幕，以及可编辑的 [`subtitles.srt`](output/subtitles.srt)。
- 封面与关键帧：[`poster.png`](output/poster.png)、[`contact-sheet.png`](output/contact-sheet.png)。
- 旧版：[`camera-physics-90s.mp4`](output/camera-physics-90s.mp4)，保留最初的 90 秒成像原理版本。

## 观看

打开 MP4，或在本目录运行 `npm start`，访问 `http://127.0.0.1:8791/preview.html`。播放器支持进度拖动。离线版 `camera-physics-offline.html` 内嵌新版视频与封面，下载后可直接双击播放。

## 叙事与视觉

| 时间 | 内容 |
| --- | --- |
| 00:00–00:07 | 光，如何成为照片 |
| 00:07–00:20 | 小孔倒立成像，镜头会聚光线 |
| 00:20–00:32 | 曝光三角 Exposure Triangle：三者各司其职 |
| 00:32–00:46 | 光圈 Aperture：f 数、进光与景深 Depth of Field |
| 00:46–01:00 | 快门速度 Shutter Speed：冻结动作与运动模糊 Motion Blur |
| 01:00–01:16 | ISO：增益 Gain、输出亮度、噪点与高光余量 |
| 01:16–01:40 | 同一场景，逐档联动补偿，同时显示采光量与输出亮度 |
| 01:40–01:54 | 人像 Portrait：先选择背景虚化 |
| 01:54–02:08 | 运动 Sports：先冻结动作 |
| 02:08–02:22 | 夜景 Nightscape：三脚架与长曝光 Long Exposure |
| 02:22–02:30 | 先选画面效果，再平衡三个参数 |

联动示例从 `f/4 · 1/125 s · ISO 100` 出发：开大光圈一档 → 快门加快一档 → 快门再加快两档 → ISO 提高两档。结束时输出亮度回到基准，收集的光只有基准的 1/4。用两个独立指标，说明 ISO 亮度补偿与实际采光的区别。

三个应用场景采用原创分层插画，亮度归一化，只比较虚化、运动痕迹或光轨。片中参数是示例起点，具体现场仍需测光、检查高光和根据机身镜头调整。模型与参考详见 [sources.md](sources.md)。

## 修改与渲染

```sh
npm ci
python3 -m pip install -r requirements.txt
# 未安装本机 Chrome 时：
npx playwright install chromium

# 修改 narration.json 后重新合成旁白、字幕与音乐（需要网络）：
python3 make_audio.py --neural

npm run preview
npm run render
```

仅修改画面时可保留现有音轨。macOS 可用 `python3 make_audio.py` 选择系统 Tingting 语音。`CHROME_PATH` 可指定浏览器，`FFMPEG_PATH` 可指定 FFmpeg；默认寻找本机 Chrome、Playwright Chromium 和 imageio-ffmpeg。

中文使用系统 PingFang SC 或 Noto Sans CJK SC，字体未随项目分发。`narration.json` 是时长、分段、旁白和导出文件名的统一入口。

## 文件

- `animation.js`：绝对时间函数 `renderFrame(t)`，11 段动画、光路、曝光模型与原创插画。
- `narration.json` / `narration-data.js`：章节、旁白、字幕与时间信息。
- `make_audio.py`：中文语音、字幕、原创配乐、音效与语音避让混音。
- `render.mjs`：关键帧、成像几何和曝光补偿数值检查、4500 帧渲染与完整解码检查。
- `serve.mjs`：支持字节范围请求的本地播放器服务。
- `sources.md`：来源与模型的适用范围。

视觉形式参考 [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) 中的代码解释动画。所有图示、插画与配乐在本项目中重新制作。
