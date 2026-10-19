# GPT Videos

用 GPT / Codex 通过代码制作的视频作品集。每个作品保存成片、封面、提示词、动画源码和渲染方法，方便观看、修改与继续创作。

当前收录 **3 个作品**：从一杯 Negroni，到相机里的光与时间，再到林克与塞尔达的华尔兹。

## 作品

### 003 · 旷野之舞 · Hyrule Waltz

<a href="videos/003-hyrule-waltz/output/hyrule-waltz-36s.mp4"><img src="videos/003-hyrule-waltz/output/poster.png" alt="黄昏舞台上的林克与塞尔达华尔兹同人动画" width="720"></a>

**[▶ 观看成片](videos/003-hyrule-waltz/output/hyrule-waltz-36s.mp4)** · [下载 MP4](https://raw.githubusercontent.com/seizethemoment/gpt-videos/main/videos/003-hyrule-waltz/output/hyrule-waltz-36s.mp4) · [提示词](prompts/003-hyrule-waltz.md) · [源码与制作说明](videos/003-hyrule-waltz/) · [素材来源](videos/003-hyrule-waltz/sources.md) · [关键帧](videos/003-hyrule-waltz/output/contact-sheet.png)

| 分类 | 时长 | 画面 | 声音 | 日期 |
| --- | --- | --- | --- | --- |
| 三维角色 / 同人舞蹈 | 36 秒 · 30 fps | 1920 × 1080 · 黄昏遗迹 | 原创 3/4 华尔兹配乐 | 2026-10-19 |

以《旷野之息》的角色与氛围为参考：邀舞、双人旋转、抬手转圈与收势，塞尔达在转身时微笑并自然眨眼。三维骨骼动画与绘画远景结合，配钢琴、竖琴、长笛和弦乐。这是同人程序动画实验，角色造型与动作细节有简化，未达到任天堂原作级精度。

技术：`Three.js` · `Skeletal IK` · `JavaScript` · `Python` · `Swift / AVAudioEngine` · `imagegen` · `Playwright` · `FFmpeg`

### 002 · 光，如何成为照片

<a href="videos/002-camera-physics/output/camera-physics-exposure-triangle.mp4"><img src="videos/002-camera-physics/output/poster.png" alt="摄影原理短片封面：深色背景下的精细相机插画，标题为光如何成为照片" width="720"></a>

**[▶ 观看成片](videos/002-camera-physics/output/camera-physics-exposure-triangle.mp4)** · [下载 MP4](https://raw.githubusercontent.com/seizethemoment/gpt-videos/main/videos/002-camera-physics/output/camera-physics-exposure-triangle.mp4) · [提示词](prompts/002-camera-physics.md) · [源码与制作说明](videos/002-camera-physics/) · [原理参考](videos/002-camera-physics/sources.md) · [关键帧](videos/002-camera-physics/output/contact-sheet.png)

| 分类 | 时长 | 画面 | 声音 | 日期 |
| --- | --- | --- | --- | --- |
| 摄影物理 / 动画讲解 | 150 秒 · 30 fps | 1920 × 1080 · 中英术语、中文字幕 | 中文旁白、原创配乐与音效 | 2026-10-19 |

以火柴人区分小孔倒立成像与镜头对焦，再用同一场景展示光圈、快门与 ISO 逐档联动，同时区分实际采光量和输出亮度。后段应用到人像、运动与夜景，核心术语中英文同屏。原理参考 OpenStax、Nikon、Cambridge in Colour 和 DPReview。

技术：`Canvas 2D` · `JavaScript` · `Python` · `NumPy` · `Playwright` · `FFmpeg` · `edge-tts`

### 001 · NEGRONI — 三味等份，一杯经典

<a href="videos/001-negroni/output/negroni-30s.mp4"><img src="videos/001-negroni/output/poster.png" alt="Negroni 调酒动画：橙片装饰的红色鸡尾酒，右侧为三种酒各 30 mL 的配方" width="540"></a>

**[▶ 观看成片](videos/001-negroni/output/negroni-30s.mp4)** · [下载 MP4](https://raw.githubusercontent.com/seizethemoment/gpt-videos/main/videos/001-negroni/output/negroni-30s.mp4) · [提示词](prompts/001-negroni.md) · [源码与制作说明](videos/001-negroni/) · [关键帧](videos/001-negroni/output/contact-sheet.png)

| 分类 | 时长 | 画面 | 声音 | 日期 |
| --- | --- | --- | --- | --- |
| 步骤讲解 / 动态插画 | 30 秒 · 30 fps | 1080 × 1080 · 中文字幕 | 原创轻音乐、倒酒与碰冰音效 | 2026-10-19 |

暖白纸张底色与珊瑚红插画，从加冰、倒入三种等份酒液，到搅拌与橙片装饰，完整展示一杯尼格罗尼的制作过程。

技术：`Canvas 2D` · `JavaScript` · `Python` · `NumPy` · `Playwright` · `FFmpeg`

画面由代码绘制，声音由程序合成。动画按绝对时间逐帧渲染，共 900 帧；成片已检查完整解码、浏览器播放与进度拖动。

## 观看与修改

- **直接观看**：点击作品封面或“观看成片”，打开仓库中的 MP4；也可下载到本地播放器。
- **离线预览**：下载整个仓库，双击 [`videos/001-negroni/negroni-offline.html`](videos/001-negroni/negroni-offline.html)。视频与封面已内嵌在文件中。
- **修改动画**：编辑 [`animation.js`](videos/001-negroni/animation.js)，通过 `index.html` 预览，再按作品说明重新渲染。

本地启动播放器只需要 Node.js：

```sh
cd videos/001-negroni
npm start
```

打开终端输出的 `http://127.0.0.1:8790/preview.html`。完整渲染依赖与操作见[作品说明](videos/001-negroni/README.md)。

## 仓库结构

```text
gpt-videos/
├── README.md                  # 作品展示与索引
├── data/videos.json           # 结构化作品信息
├── prompts/                   # 每个作品的制作提示词
└── videos/
    ├── 003-hyrule-waltz/      # 林克与塞尔达华尔兹同人短片
    ├── 002-camera-physics/    # 摄影物理原理短片
    └── 001-negroni/
        ├── README.md          # 配方、时间轴、渲染步骤与来源
        ├── animation.js       # 动画绘制
        ├── soundtrack.py      # 音乐与音效
        ├── render.mjs         # 逐帧渲染与 MP4 合成
        ├── serve.mjs          # 本地播放器服务
        ├── index.html         # 实时动画预览
        ├── preview.html       # 视频播放器
        ├── negroni-offline.html
        └── output/            # MP4、封面、关键帧和音轨
```

## 添加下一条视频

1. 在 `videos/` 下创建递增编号的目录，例如 `004-your-title/`，保存源码、说明与成片。
2. 将制作提示词保存到 `prompts/004-your-title.md`。
3. 在 `data/videos.json` 追加作品信息，使用相对于仓库根目录的资源路径。
4. 在本页增加封面、视频入口与作品规格，并更新作品数量。

## 参考与致谢

仓库的作品展示与提示词索引方式参考 [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos)。

首个作品的创意参考为 [@Ror_Fly 的调酒步骤动画](https://skillry.dev/ai-videos/opus-5-5/ror-fly-880547)（[原帖](https://x.com/Ror_Fly/status/2102853258582880547)）；配方参考 [IBA Negroni](https://iba-world.com/iba-cocktail/negroni/)。本仓库保存的是本次重新设计与编写的作品。
