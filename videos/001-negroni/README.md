# Negroni — 三味等份，一杯经典

[返回作品集](../../README.md) · [制作提示词](../../prompts/001-negroni.md)

30 秒方形调酒步骤动画。暖白纸张质感、珊瑚红矢量插画、中文字幕、用量标注、六步进度，以及原创程序合成的轻音乐和音效。

- 成片：`output/negroni-30s.mp4`
- 规格：1080 × 1080，30 fps，30 秒，H.264 / AAC 双声道。
- 浏览器播放：打开 `preview.html`。
- 离线播放：双击 `negroni-offline.html`，视频与封面已内嵌在文件中。
- 本地服务：执行 `npm start`，访问 `http://127.0.0.1:8790/preview.html`，支持拖动视频进度。
- 可编辑动画：打开 `index.html`，或修改 `animation.js`。
- 关键帧总览：`output/contact-sheet.png`。

## 内容与时间轴

| 时间 | 内容 |
| --- | --- |
| 0–2 秒 | 标题与等份配方 |
| 2–5 秒 | 加冰 |
| 5–9 秒 | 金酒 30 mL |
| 9–13 秒 | 金巴利 30 mL |
| 13–17 秒 | 甜红味美思 30 mL |
| 17–24 秒 | 轻柔搅拌约 20 秒（画面为加速示意） |
| 24–27 秒 | 橙片装饰 |
| 27–30 秒 | 成品与配方回顾 |

## 重新渲染

依赖：Node.js、Python 3 + NumPy、Chrome 或 Playwright Chromium，以及 FFmpeg。

```sh
npm install
python3 -m pip install numpy
python3 -m pip install --target .runtime imageio-ffmpeg==0.6.0
python3 soundtrack.py
npm run preview
npm run render
```

如使用 Playwright 自带的 Chromium，先执行 `npx playwright install chromium`。
可用 `CHROME_PATH` 指定 Chrome 可执行文件，用 `FFMPEG_PATH` 指定现有 FFmpeg；不指定时，渲染脚本会寻找本机 Chrome 和 `.runtime` 中的 FFmpeg。

画面使用系统字体。macOS 使用 PingFang SC；其他系统建议安装 Noto Sans CJK SC，以获得完整的中文显示。不同系统字体会产生少量排版差异。

`renderFrame(t)` 按绝对时间绘制，导出时逐帧调用 900 次。浏览器实时预览与成片使用同一套绘制代码。音乐与音效在 `soundtrack.py` 中合成，无外部录音素材。

## 来源与制作说明

创意参考为 [30 秒调酒动画案例](https://skillry.dev/ai-videos/opus-5-5/ror-fly-880547)，来自 [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos)。本作品重新设计并编写画面与声音，没有使用参考视频的画面、音乐或源码。

配方按 [IBA Negroni](https://iba-world.com/iba-cocktail/negroni/)：金酒、金巴利、甜红味美思各 30 mL，杯中加冰调和，以橙片装饰。

工具：原生 Canvas 2D、[Playwright](https://playwright.dev/)、[FFmpeg](https://ffmpeg.org/)、[imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg)、[NumPy](https://numpy.org/)。中英文使用本机系统字体，字体文件未随项目分发。
