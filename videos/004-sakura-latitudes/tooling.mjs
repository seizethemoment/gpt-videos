import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
export const root=path.dirname(fileURLToPath(import.meta.url));
export function findFFmpeg(){
 for(const p of [process.env.FFMPEG_PATH,'ffmpeg',path.resolve(root,'../../../negroni-motion/.runtime/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1')].filter(Boolean))if(spawnSync(p,['-version'],{stdio:'ignore'}).status===0)return p;
 const p=spawnSync(process.env.PYTHON_PATH||'python3',['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).stdout?.trim();
 if(p&&fs.existsSync(p))return p;throw Error('Set FFMPEG_PATH or install ffmpeg / imageio-ffmpeg.');
}
