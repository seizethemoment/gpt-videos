"""Generate narration, timed captions, an original ambient score, and effects.

Use --neural for edge-tts (network required); default is macOS Tingting.
Only the final AAC mix and captions need to be kept with the project.
"""
from pathlib import Path
import argparse,asyncio,json,os,re,shutil,subprocess,sys,wave
import numpy as np

ROOT=Path(__file__).resolve().parent
TMP=ROOT/'.runtime';TMP.mkdir(exist_ok=True)
OUT=ROOT/'output';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(TMP))
SPEC=json.loads((ROOT/'narration.json').read_text())
SR=48000
def ffmpeg_path():
    if os.environ.get('FFMPEG_PATH'):return os.environ['FFMPEG_PATH']
    if shutil.which('ffmpeg'):return shutil.which('ffmpeg')
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()
FF=ffmpeg_path()
def run(args):return subprocess.run([FF,'-y','-hide_banner','-loglevel','error',*map(str,args)],check=True,capture_output=True)
def read_wave(path):
    with wave.open(str(path),'rb') as f:
        assert f.getframerate()==SR and f.getnchannels()==1
        return np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(float)/32768
def write_wave(path,a):
    channels=1 if a.ndim==1 else a.shape[1]
    with wave.open(str(path),'wb') as f:
        f.setnchannels(channels);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes(np.round(np.clip(a,-.999,.999)*32767).astype('<i2').tobytes())
def stamp(t):
    ms=round(t*1000);return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'

async def neural(chapter,index):
    import edge_tts
    target=TMP/f'voice-{index:02d}.mp3'
    await asyncio.wait_for(edge_tts.Communicate(''.join(chapter['parts']),'zh-CN-YunxiNeural',rate='-3%').save(str(target)),timeout=35)
    return target

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--neural',action='store_true');args=parser.parse_args()
    voice=np.zeros(SR*SPEC['duration'],dtype=float);captions=[];metadata=[]
    backend='edge-tts / zh-CN-YunxiNeural' if args.neural else 'macOS / Tingting'
    for i,c in enumerate(SPEC['chapters']):
        if args.neural:
            source=asyncio.run(neural(c,i))
        else:
            if not shutil.which('say'):raise SystemExit('Use --neural on platforms without macOS speech synthesis.')
            source=TMP/f'voice-{i:02d}.aiff'
            textfile=TMP/f'voice-{i:02d}.txt';textfile.write_text(''.join(c['parts']))
            subprocess.run(['say','-v','Tingting','-r','205','-o',str(source),'-f',str(textfile)],check=True)
        raw=TMP/f'voice-{i:02d}-raw.wav'
        run(['-i',source,'-ar',SR,'-ac','1','-c:a','pcm_s16le',raw])
        a=read_wave(raw)
        # Leave breathing room on either side of each narrated chapter.
        available=c['end']-c['start']-1.30
        ratio=max(1,len(a)/SR/available)
        if ratio>1.25:raise SystemExit(f'Chapter {c["id"]} needs a shorter script ({ratio:.2f}× speed).')
        processed=TMP/f'voice-{i:02d}.wav'
        run(['-i',raw,'-af',f'atempo={ratio:.7f},highpass=f=70,loudnorm=I=-18:TP=-2:LRA=7','-ar',SR,'-ac','1','-c:a','pcm_s16le',processed])
        a=read_wave(processed);start=c['start']+.60;at=round(start*SR)
        voice[at:at+len(a)]+=a
        duration=len(a)/SR
        weights=[len(re.sub(r'[\s，。；：、？！]', '',p))+.8*len(re.findall(r'[，。；：、？！]',p)) for p in c['parts']]
        pos=start
        for text,weight in zip(c['parts'],weights):
            end=pos+duration*weight/sum(weights)
            captions.append({'start':round(pos,3),'end':round(end,3),'text':text})
            pos=end
        metadata.append({'chapter':c['id'],'start':round(start,3),'duration':round(duration,3),'speed':round(ratio,4)})
        print(f'Narration {i+1}/8: {duration:.2f}s, speed {ratio:.3f}×',flush=True)

    n=len(voice);music=np.zeros((n,2),dtype=float);fx=np.zeros_like(music)
    rng=np.random.default_rng(20261019)
    def put(track,sound,start,gain=1,pan=0):
        index=int(start*SR);sound=np.asarray(sound)[:max(0,n-index)]*gain
        if index>=n or not len(sound):return
        angle=(pan+1)*np.pi/4
        track[index:index+len(sound),0]+=sound*np.cos(angle)
        track[index:index+len(sound),1]+=sound*np.sin(angle)
    def note(midi,dur=4):
        t=np.arange(int(dur*SR))/SR;f=440*2**((midi-69)/12)
        sound=np.sin(2*np.pi*f*t+.15*np.sin(2*np.pi*.4*t))+.20*np.sin(2*np.pi*f*2*t)*np.exp(-t*1.2)
        return sound*(1-np.exp(-t*25))*np.exp(-t*.85)*np.minimum(1,(dur-t)*2)
    # Slow, open chords with a restrained glassy arpeggio.
    chords=[[50,57,62,64,69],[46,53,58,62,65],[53,60,65,69,72],[48,55,60,64,67]]
    for bar in range(23):
        start=bar*4.0;chord=chords[bar%4]
        for i,m in enumerate(chord):put(music,note(m,5.4),start+i*.045,.012,-.45+i*.225)
        for i,m in enumerate([chord[2]+12,chord[3]+12,chord[4]+12,chord[3]+12]):put(music,note(m,2.0),start+i, .007, -.35+(.7 if i%2 else 0))
    # Small transition swells, light strikes, iris detents, and shutter clicks.
    for at in [7.8,21.8,31.8,45.8,56.8,67.8,81.8]:
        dur=.75;t=np.arange(int(dur*SR))/SR;noise=rng.normal(size=len(t))
        colored=np.convolve(noise,np.ones(23)/23,mode='same')
        put(fx,colored*np.sin(np.pi*t/dur)**2,at-.25,.045,0)
    for at in [2.8,12.1,18.2,35.7,42.2,51.7,60.2,85.0]:put(fx,note(81 if at<40 else 76,1.6),at,.025,.25)
    for at in [5.8,69.1,73.0,77.6]:
        t=np.arange(int(.19*SR))/SR
        click=rng.normal(size=len(t))*np.exp(-t*90)+.24*np.sin(2*np.pi*680*t)*np.exp(-t*45)
        put(fx,click,at,.055,-.15)
    for at in np.arange(47.9,49.3,.16):
        t=np.arange(int(.06*SR))/SR
        put(fx,np.sin(2*np.pi*1600*t)*np.exp(-t*130),float(at),.018,.25)
    # Smooth narration-aware music ducking; no effect on narration itself.
    block=4800
    power=np.array([np.sqrt(np.mean(voice[i:i+block]**2)) for i in range(0,n,block)])
    gate=np.interp(np.arange(n),np.arange(len(power))*block,(power>.009).astype(float))
    music*= (1-.55*gate)[:,None]
    combined=music+fx+voice[:,None]*.7071
    time=np.arange(n)/SR
    combined*= (np.minimum(1,time/1.2)*np.minimum(1,(SPEC['duration']-time)/1.4))[:,None]
    peak=np.max(np.abs(combined))
    if peak>.88:combined*=.88/peak
    rawmaster=TMP/'master.wav';write_wave(rawmaster,combined)
    run(['-i',rawmaster,'-af','loudnorm=I=-16:TP=-1.5:LRA=9','-ar',SR,'-c:a','aac','-b:a','192k',OUT/'soundtrack.m4a'])
    (OUT/'captions.json').write_text(json.dumps(captions,ensure_ascii=False,indent=2)+'\n')
    (OUT/'subtitles.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(captions))+'\n')
    (OUT/'audio-info.json').write_text(json.dumps({'narrator':backend,'music':'Original procedural composition','duration':SPEC['duration'],'chapters':metadata},ensure_ascii=False,indent=2)+'\n')
    (ROOT/'narration-data.js').write_text('window.NARRATION='+json.dumps({'spec':SPEC,'captions':captions},ensure_ascii=False,separators=(',',':'))+';\n')
    print('Audio and timed captions ready.',flush=True)

if __name__=='__main__':main()
