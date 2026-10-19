"""Compose an original 20-bar D-major waltz. 100 BPM, 3/4, 36 seconds."""
from pathlib import Path
import json,random
random.seed(17)
notes=[];beat=.6
# Instrument index: piano, harp, strings, flute, cello (macOS General MIDI).
def add(bar,b,n,d=1,vel=65,inst=0):
 if n is not None:notes.append(dict(time=round((bar*3+b)*beat,5),duration=round(d*beat,5),note=n,velocity=vel,instrument=inst))
chords=[(50,[62,66,69]),(45,[61,64,69]),(50,[62,66,69]),(47,[62,66,71]),(43,[59,62,67]),(45,[61,64,69]),(50,[62,66,69]),(47,[62,66,71]),(43,[59,62,67]),(45,[61,64,69]),(54,[61,66,69]),(47,[62,66,71]),(43,[59,62,67]),(45,[61,64,69]),(50,[62,66,69]),(43,[59,62,67]),(45,[61,64,67]),(45,[61,64,69]),(50,[62,66,69]),(38,[57,62,66])]
melody=[[74,78,81],[83,81,78],[79,78,74],[76,73,69],[74,78,81],[83,86,85],[83,79,78],[76,73,76],[78,81,85],[86,85,83],[79,83,81],[78,76,73],[74,78,81],[83,81,79],[76,78,73],[76,73,69]]
for bar,(bass,chord) in enumerate(chords):
 final=bar>=18
 add(bar,0,bass,2.8 if final else .82,58,4)
 if final:
  for n in chord+[74]:add(bar,0,n,3.0 if bar==18 else 2.3,50,0)
  for j,n in enumerate(chord):add(bar,j*.25,n+12,2.5-j*.25,42,1)
 else:
  add(bar,0,bass+12,.9,57,0)
  for b in [1,2]:
   for n in chord:add(bar,b,n,.75,42+(b==1)*4,0)
  for j in range(6):add(bar,j*.5,chord[j%3]+(12 if j>2 else 0),1.2,36+(j==0)*12,1)
  if bar>=2:
   for n in chord:add(bar,0,n,2.93,35 if bar<10 else 42,2)
   for j,n in enumerate(melody[bar-2]):
    dur=.95 if j<2 else .88
    add(bar,j,n,dur,62 if j==0 else 56,3)
    if bar<6 or bar>=14:add(bar,j,n,.88,44,0)
Path('output/score.json').write_text(json.dumps(sorted(notes,key=lambda x:x['time']),indent=2))
print(f'{len(notes)} notes; 20 bars; D major; 100 BPM')
