# 004 · 樱落，向北 · 制作提示词

## 简洁复用版

```text
制作一支《樱落，向北》春日樱花短片，约 96 秒，1080p 横屏。

从杭州曲院风荷、良渚大屋顶出发，按纬度由南向北，串联上海顾村公园、南京鸡鸣寺、东京千鸟渊、大连龙王塘、华盛顿潮汐湖、温哥华伊丽莎白女王公园。先搜索各地真实图片与视频作为参考，保留可辨认的地标。

采用细腻的日漫手绘背景：粉白樱花、青绿水面、柔和春光。让花瓣缓慢飘落、翻转，加入远近层次、水面微动和舒缓运镜，用柔和转场连接各地。整体安静、浪漫、有电影感。

每站简洁标注中英文地名与纬度，搭配原创钢琴和弦乐。可借助开源工具完成制作，交付 MP4、源码和参考链接。
```

这段提示词适合交给具备图像生成、代码执行和视频合成能力的创作助手。逐站画面提示词见下文，成片与复现步骤见[作品说明](../videos/004-sakura-latitudes/README.md)。

## 用户需求

参考“评估视频制作可行性”会话，制作春日樱花飘落、秒速五厘米主题的视频，保持日漫效果。取景包括杭州曲院风荷、大屋顶、日本、加拿大、美国、南京鸡鸣寺、上海、大连。设计合理顺序，网上找具体图片和视频参考，每地在画面中标注。

## 成片设计

96 秒，1920×1080，24 fps。八站各 12 秒，按景点约略纬度递增：曲院风荷 → 良渚大屋顶 → 上海顾村 → 南京鸡鸣寺 → 东京千鸟渊 → 大连龙王塘 → 华盛顿潮汐湖 → 温哥华伊丽莎白女王公园。

主题：“樱落，向北 / 秒速五厘米的春日旅行”。不沿用电影画面、音乐或台词。保持细腻日漫背景、粉白樱花、青绿水色、冷暖光影。花瓣单独运动，包含远近层次、缓慢下落、侧风、翻转；加入水波、慢推镜、叠化和地理字幕。原创配乐使用钢琴、竖琴、弦乐、长笛与大提琴，80 BPM，D 大调，32 小节。

## 背景生成方式

使用内置 `image_gen`，每站独立生成。实景参考照片先查看，作为地貌与建筑参考。最终 PNG 拷入 `videos/004-sakura-latitudes/assets/`。图片与视频来源见该目录 `sources.md`。

### 共同视觉指令

Final movie background: ONE cinematic wide 16:9 original Japanese anime landscape painting. Exquisite detailed hand-painted animation film environment, fine line architecture, layered atmosphere, pale pink-white sakura blossoms, luminous cyan and celadon with warm sunlight and lavender shadows. Romantic quiet spring. No text, typography, watermark, collage, borders, or panels. Use reference photo for real architecture and place character, reinterpret into original wide film composition. Leave bottom left simple for later location captions. No large falling petals, which will be animated later.

### 01 · 曲院风荷

Hangzhou West Lake Quyuan Fenghe / Fukui-Hangzhou Friendship Garden. Real Jiangnan waterside dark timber pavilion with curved gray roof centered right, zigzag pale stone bridge, serene pale jade pond in lower half. Pink-white cherry branches frame upper left, fresh green willow, hazy West Lake low hills in distance. Early morning peach light, turquoise reflections, cinematic 35mm establishing view near water. Spring; no lotus leaves or flowers.

### 02 · 良渚大屋顶

Hangzhou Liangzhu Culture and Art Center called Big Roof, designed by Tadao Ando. Preserve low broad sloping angular gray concrete roof uniting three concrete/glass volumes, roof skylights, water court and orderly cherry avenue. Ground-level oblique view from narrow reflecting water court with sakura row on left and building on right. Late morning spring daylight, pale concrete texture, delicate glass and pink blossom reflections. Not a traditional temple or pagoda.

### 03 · 上海顾村公园

Shanghai Gucun Park. Real tall white Ferris wheel with small pastel colored gondolas, in right background beyond abundant pale pink-white cherry groves. Low eye-level park footpath, foreground blossom branches frame left and upper edge, fresh green willows. Clear spring azure blue sky with soft handpainted clouds, gentle midday sun, very few tiny distant visitors. Wheel with coherent round rim and fine radial spokes.

### 04 · 南京鸡鸣寺

Nanjing Jiming Temple. Recognizable warm ochre yellow Chinese Buddhist temple wall with dark wooden arched gate, gray-green tile roof, delicate pink-white cherry branches in front. Hint of multistory Chinese pagoda above greenery far background. Wide 35mm view, stone path leading along yellow wall, warm afternoon light, lavender shadows, temple architecture well drawn. No Japanese torii or shrine, no text or signage.

### 05 · 日本东京千鸟渊

Tokyo, Chidorigafuchi moat in sakura season. A deep turquoise moat recedes centrally under huge arching pink-white cherry canopies on both grassy sloped banks. A few small realistic blue rowboats with tiny distant adults, distant discreet Tokyo office blocks, no other landmarks added. Late afternoon luminous blue and rose daylight, richly layered blossom branches upper left and right, flowing composition like a river of spring. Low angle 35mm sweeping wide shot, water foreground. Soft dramatic anime clouds.

### 06 · 大连龙王塘

Dalian, Longwangtang Cherry Blossom Park. Preserve the actual park's setting below a long stone reservoir dam with a railing and small traditional pavilion, backed by low brown-green Liaodong hills, from the geography reference. Compose a cinematic eye-level walkway beneath a tunnel of mature pale pink and white cherry trees with the low gray stone dam wall stretching across background and a restrained small pavilion upper right. Warm clear later spring light, wind from sea, pale petals carpet the path, few tiny visitors. No Japanese shrine, torii, Fuji, or invented castle. Avoid the parking lot dominating the reference.

### 07 · 美国华盛顿潮汐湖

Washington DC, Tidal Basin in spring. Frame the unmistakable white neoclassical Jefferson Memorial centered right across still blue water, low broad round dome, ring of slender columns and shallow steps, cherry branches overhanging foreground upper left and upper right. Pale pink-white sakura all around, distant soft shore. Delicate afternoon golden glints on water, pale violet and rose wisps of clouds, no other invented monuments. Calm dreamy anime movie landscape, refined architecture, recognizable memorial proportions.

### 08 · 加拿大温哥华伊丽莎白女王公园

Vancouver Queen Elizabeth Park in spring. Picturesque view from a cherry-lined gently rising footpath and fresh spring lawns toward the small Bloedel Conservatory silver geodesic glass dome at summit, gray-blue North Shore mountain silhouettes far beyond. Use image 1 for cherry colors and image 2 for dome/mountain geometry; invent a cohesive original wider view but keep recognizable park character. Tall mature flowering pink cherry trees frame upper corners, graceful dark branches, soft late-day sun from left, pink clouds, cool blue mountains and lavender shadows. No foreground people, tropical palms, or Japanese shrine.
