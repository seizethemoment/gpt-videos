# 角色、画面与声音来源

本作品是个人同人动画实验，无任天堂官方参与。视觉目标参考《塞尔达传说：旷野之息》，实际成片使用简化的程序骨骼动画，不能作为“已达到任天堂制作水准”的证明。

## 角色

- **Link**：本次使用的 GLB 来自 [yaphi1/botw-link-demo-yb](https://github.com/yaphi1/botw-link-demo-yb/blob/50cd44b6a63814d2fcaf36a09c32a5dba8dda646/public/3d_assets/link.glb)，固定提交 `50cd44b6a63814d2fcaf36a09c32a5dba8dda646`。角色、原始游戏网格和贴图相关权利归 Nintendo。该仓库没有为该角色资源提供独立的开放许可。原模型为绿衣造型，本片在材质中改为蓝衣、去帽，并添加了代码绘制的白色徽记；不是游戏英杰服资产的准确复刻。
- **Zelda**：Christoph “Stoff” Schoch 的 [Game Ready Model – Zelda](https://thestoff.itch.io/game-ready-zelda)。本次使用其公开免费下载包中的 `zeldaSkelNoProps_V001_008.fbx`、长发和旅行装。作者限定个人用途，禁止用于营利。保持作者署名；模型文件及贴图不随本仓库重新分发。[作者说明与使用提示](https://animatorsresourcekit.blog/2019/11/04/botw-zelda-rig/)。
- 可编辑舞步、手臂与腿部 IK、微笑与眨眼、取景和灯光在本项目重新编写；未使用第三方舞蹈动画片段。
- 原始模型只保存在被 Git 忽略的 `.runtime/` 中。`fetch_assets.py` 从原始公开来源获取；来源失效时需重新取得相应模型。不要将它们视为本项目原创或开放授权素材。

## 环境

- 圆形石台、分块铺装、金色嵌线、遗迹石柱、拱券、藤叶、草、微光粒子和软接触阴影：本项目生成。
- [`assets/hyrule-panorama.png`](assets/hyrule-panorama.png)：使用内置 imagegen 生成的远景绘画，作为背景投影，未使用原作截图。完整提示词保存在 [`../../prompts/003-hyrule-waltz.md`](../../prompts/003-hyrule-waltz.md)。这是一张有轻微平移的二维远景，不是可环视的三维海拉鲁地图。
- 中文字形使用 macOS Songti SC 等系统字体，字体文件未分发。

## 声音

- D 大调、100 BPM、3/4、20 小节的原创华尔兹乐段，旋律与和声由 `score.py` 编排；没有使用或改编《塞尔达》原作旋律。
- 以 macOS 自带 General MIDI DLS 音色通过 AVAudioUnitSampler 离线演奏，含钢琴、竖琴、弦乐、长笛和大提琴。音色库本体未复制或分发。
- `render_audio.swift` 和 `make_audio.py` 生成混响与响度调整后的音轨。音频渲染接口参考 [Apple AVAudioEngine](https://developer.apple.com/documentation/avfaudio/avaudioengine) 与 [AVAudioUnitSampler](https://developer.apple.com/documentation/avfaudio/avaudiounitsampler/loadsoundbankinstrument(at:program:bankmsb:banklsb:))。

## 开源工具

[Three.js](https://threejs.org/)（MIT）、[Playwright](https://playwright.dev/)（Apache-2.0）、[FFmpeg](https://ffmpeg.org/)、[imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg)。各工具维持原有许可；这些工具的许可不授予 Nintendo 角色或第三方模型的使用权。
