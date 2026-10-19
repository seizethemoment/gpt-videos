from pathlib import Path
import subprocess,os,shutil,sys
ROOT=Path(__file__).resolve().parent;os.chdir(ROOT)
subprocess.run([sys.executable,'score.py'],check=True)
subprocess.run(['swift','render_audio.swift'],check=True)
ffmpeg=os.environ.get('FFMPEG_PATH') or shutil.which('ffmpeg')
if not ffmpeg:
 import imageio_ffmpeg
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ffmpeg,'-y','-hide_banner','-loglevel','warning','-i','output/music.caf','-af','loudnorm=I=-18:TP=-1.5:LRA=9,afade=t=in:d=0.4,afade=t=out:st=34.8:d=1.2','-ar','48000','-c:a','aac','-b:a','256k','output/soundtrack.m4a'],check=True)
