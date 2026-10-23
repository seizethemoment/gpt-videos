from pathlib import Path
import subprocess,os,shutil,sys,wave
import numpy as np
ROOT=Path(__file__).resolve().parent;os.chdir(ROOT)
subprocess.run([sys.executable,'score.py'],check=True)
subprocess.run(['swift','render_audio.swift'],check=True)
ffmpeg=os.environ.get('FFMPEG_PATH') or shutil.which('ffmpeg')
if not ffmpeg:
 local=ROOT.parents[2]/'negroni-motion/.runtime/imageio_ffmpeg/binaries/ffmpeg-macos-x86_64-v7.1'
 if local.exists():ffmpeg=str(local)
 else:
  import imageio_ffmpeg
  ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
# Subtle synthesized breeze and distant chirps, never sampled from a recording.
sr=48000;duration=96;n=sr*duration;t=np.arange(n)/sr;rng=np.random.default_rng(508)
coarse=rng.normal(0,1,duration*120)
wind=np.interp(t,np.arange(len(coarse))/120,coarse)
wind=np.convolve(wind,np.ones(31)/31,mode='same')*.0023*(.6+.4*np.sin(t*.19)**2)
left=wind.copy();right=np.roll(wind,311)*.88
for when in [3.8,7.5,16,23,29,35,43,49,54,64,69,77,83,88]:
 start=int(when*sr);d=.22;tt=np.arange(int(d*sr))/sr
 chirp=np.sin(2*np.pi*(2750*tt+1600*tt**2))*np.sin(np.pi*tt/d)**3*.007
 left[start:start+len(chirp)]+=chirp;right[start+120:start+120+len(chirp)]+=chirp*.6
envelope=np.minimum(1,t/2)*np.minimum(1,(duration-t)/3)
data=np.stack([left*envelope,right*envelope],axis=1)
with wave.open('output/ambience.wav','wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
subprocess.run([ffmpeg,'-y','-hide_banner','-loglevel','warning','-i','output/music.caf','-i','output/ambience.wav','-filter_complex','[0:a]loudnorm=I=-20:TP=-2:LRA=10[m];[m][1:a]amix=inputs=2:normalize=0,alimiter=limit=0.8,afade=t=in:d=1.3,afade=t=out:st=92:d=4[a]','-map','[a]','-t','96','-ar','48000','-c:a','aac','-b:a','256k','output/soundtrack.m4a'],check=True)
print('Original score + spring ambience: output/soundtrack.m4a')
