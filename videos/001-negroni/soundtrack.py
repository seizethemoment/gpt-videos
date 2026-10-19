"""Original procedural lounge music and synchronized glass / pouring effects.
No recordings, pretrained models, or third-party music assets are used.
"""
from pathlib import Path
import wave
import numpy as np

SR=48000
DURATION=30
rng=np.random.default_rng(1946)
mix=np.zeros((SR*DURATION,2),dtype=np.float64)

def place(signal,start,gain=1,pan=0):
    at=int(start*SR)
    if at>=len(mix):return
    signal=np.asarray(signal)[:len(mix)-at]*gain
    angle=(pan+1)*np.pi/4
    mix[at:at+len(signal),0]+=signal*np.cos(angle)
    mix[at:at+len(signal),1]+=signal*np.sin(angle)

def hz(midi):return 440*2**((midi-69)/12)

def rhodes(midi,duration=1.8):
    t=np.arange(int(duration*SR))/SR
    f=hz(midi)
    mod=np.sin(2*np.pi*f*2*t)*1.15*np.exp(-t*7)
    s=np.sin(2*np.pi*f*t+mod)+.18*np.sin(2*np.pi*f*3*t)*np.exp(-t*4)
    return s*(1-np.exp(-t*180))*np.exp(-t*2.3)*np.minimum(1,(duration-t)*15)

def bass(midi,duration=.5):
    t=np.arange(int(duration*SR))/SR
    s=np.sin(2*np.pi*hz(midi)*t)+.2*np.sin(4*np.pi*hz(midi)*t)*np.exp(-t*6)
    return s*(1-np.exp(-t*110))*np.exp(-t*5)*np.minimum(1,(duration-t)*25)

# A relaxed 100 BPM loop: Dm9, G13, Cmaj9, A7.
beat=.6
chords=[[62,65,69,72,76],[59,64,65,69,74],[60,64,67,71,74],[61,64,67,70,73]]
roots=[38,43,36,33]
for bar in range(13):
    start=bar*4*beat
    if start>=29:break
    c=bar%4
    for offset,amp in [(0,.024),(1.5,.018),(3,.016)]:
        for k,note in enumerate(chords[c]):
            place(rhodes(note),start+offset*beat+k*.012,amp,(-.35+k*.175))
    for b in [0,2]:place(bass(roots[c]),start+b*beat,.075,-.08)
    for b in range(4):
        t=np.arange(int(.14*SR))/SR
        noise=rng.normal(size=len(t));noise=np.concatenate(([0],np.diff(noise)))
        brush=noise*np.exp(-t*48)*(1-np.exp(-t*800))
        place(brush,start+(b+.5)*beat,.006,.4)
    for b in [0,2]:
        t=np.arange(int(.19*SR))/SR
        kick=np.sin(2*np.pi*(54*t+1.2*(1-np.exp(-t*24))))*np.exp(-t*30)
        place(kick,start+b*beat,.038,0)

# Ice clinks: several inharmonic, quickly decaying resonances.
for at in [2.75,3.14,3.51,3.90]:
    t=np.arange(int(.44*SR))/SR
    frequencies=[1980,3187,4721,6497]
    s=sum(np.sin(2*np.pi*f*t+rng.uniform(0,6.28))*np.exp(-t*(13+i*5))/(i+1) for i,f in enumerate(frequencies))
    s*=1-np.exp(-t*3000)
    place(s,at,.075,-.26)

# Pouring: gently colored noise with a low bubbling layer.
for k,at in enumerate([5.55,9.55,13.55]):
    dur=2.93;t=np.arange(int(dur*SR))/SR
    noise=rng.normal(size=len(t))
    colored=np.convolve(noise,np.ones(11)/11,mode='same')
    envelope=np.minimum(1,t*9)*np.minimum(1,(dur-t)*9)
    trickle=colored*(.6+.24*np.sin(t*53)+.16*np.sin(t*89))
    bubbles=np.sin(2*np.pi*(320*t+.8*np.sin(t*18)))*.1
    place((trickle+bubbles)*envelope,at,.065,-.18)

# A soft clink accompanies the stirring motion.
for at in np.arange(17.9,23.4,.72):
    t=np.arange(int(.15*SR))/SR
    s=(np.sin(2*np.pi*2640*t)+.45*np.sin(2*np.pi*4130*t))*np.exp(-t*45)
    place(s,at,.018,-.2)

# Final two-note chime.
for i,n in enumerate([76,81]):place(rhodes(n,2),25.75+i*.2,.05,.2)
time=np.arange(len(mix))/SR
fade=np.minimum(1,time/.9)*np.minimum(1,(DURATION-time)/1.4)
mix*=fade[:,None]
mix=np.tanh(mix*1.7)
peak=np.max(np.abs(mix))
if peak>0:mix*=.78/peak
pcm=np.round(np.clip(mix,-1,1)*32767).astype('<i2')
out=Path(__file__).parent/'output'/'soundtrack.wav'
out.parent.mkdir(exist_ok=True)
with wave.open(str(out),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
print(f'Original stereo soundtrack: {out} ({DURATION}s, {SR} Hz)')
