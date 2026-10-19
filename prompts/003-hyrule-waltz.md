# 003 · 旷野之舞 · Hyrule Waltz

## 用户原始要求

> 参考“评估视频制作可行性”会话，做一个同样品质、任天堂水准的《塞尔达：王国之泪》或《旷野之息》里的林克和塞尔达两个人跳华尔兹的视频，放在同一个 GitHub 仓库。

## 后续表情要求

> 塞尔达转身的时候脸上要有笑容，眼睛要眨一眨。

实现为转身段落渐进的闭嘴微笑，以及按完整帧对齐的 9 次眼皮闭合/睁开；不使用二维换脸帧。

## 制作规格与实际取舍

- 36 秒、1920 × 1080、30 fps 横屏，H.264 / AAC。
- 三维独立骨骼角色；邀舞、自然转、抬手转圈、收势；100 BPM、3/4 原创音乐。
- 圆形石台、遗迹石柱、风吹草地、黄昏绘画远景、微光粒子与柔和阴影。
- 林克由绿衣模型改为蓝衣并加白色徽记；塞尔达使用 Stoff 长发旅行装，不采用白裙。
- 任天堂原作级质量是用户目标，不能视为已达成。成片定位为同人程序动画实验，材质、接触、脚步与重心精度有限。
- 视频、封面、关键帧、源码、配乐乐谱与素材来源保存到 `videos/003-hyrule-waltz/`；外部角色原文件不再分发。

## imagegen 内置工具：远景绘画最终提示词

Use case: stylized-concept. Asset type: ultra-wide painted environment panorama texture for a 3D fan-animation, no characters. A majestic Breath of the Wild Hyrule landscape at golden hour, game cinematic environmental art, sophisticated painterly cel shading, soft gouache-like cloud masses, warm cream and peach sunlight through towering clouds, dreamy distant blue mountains, lush green grassy plateaus with scattered trees, a tiny recognizable Hyrule Castle spire silhouette very far in the distance. View from an ancient open stone terrace across the valley. Camera near eye level, panoramic landscape photograph composition, sky occupies upper 60 percent, horizon around 62 percent down. The bottom third shows rolling green meadow foothills gently tapering into the distance; no large foreground objects, no terrace railing, no columns, no people, no text, no logos. Render an edge-to-edge 3:2 or widest possible horizontal panorama, rich saturated but tasteful turquoise shadows, luminous golden highlights, detailed hand painted grassland and atmospheric perspective, high-budget Nintendo cutscene environment quality. This is a distant background texture; keep all structures tiny, no focal subject in the center so 3D dancers can be composited in front.

生成资产保存在 `videos/003-hyrule-waltz/assets/hyrule-panorama.png`。实际以二维背景投影使用，三维人物与石台单独渲染。
