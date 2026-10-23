"""Original 96-second spring nocturne: 32 bars, 80 BPM, D major, 4/4."""
from pathlib import Path
import json,random
random.seed(508)
notes=[];beat=.75
def add(bar,b,n,d=1,vel=60,inst=0):
 if n is not None:notes.append(dict(time=round((bar*4+b)*beat,5),duration=round(d*beat,5),note=n,velocity=vel,instrument=inst))
# Piano, harp, strings, flute, cello; eight four-bar musical postcards.
chords=[(38,[57,62,66,69]),(45,[57,61,64,69]),(47,[59,62,66,69]),(43,[55,59,62,66]),
        (38,[57,62,66,69]),(40,[55,59,64,67]),(43,[55,59,62,66]),(45,[57,61,64,69]),
        (47,[59,62,66,69]),(42,[57,61,66,69]),(43,[55,59,62,66]),(45,[57,61,64,67]),
        (38,[57,62,66,69]),(43,[55,59,62,66]),(40,[55,59,64,67]),(45,[57,61,64,69]),
        (47,[59,62,66,71]),(43,[55,59,62,66]),(38,[57,62,66,69]),(45,[57,61,64,69]),
        (40,[55,59,64,67]),(43,[55,59,62,66]),(47,[59,62,66,69]),(45,[57,61,64,69]),
        (43,[55,59,62,66]),(38,[57,62,66,69]),(40,[55,59,64,67]),(45,[57,61,64,69]),
        (43,[55,59,62,66]),(45,[57,61,64,69]),(38,[57,62,66,69]),(38,[57,62,66,69])]
motifs=[[74,78,81,78],[76,73,69,73],[74,71,78,76],[74,71,67,69],
        [78,81,85,81],[79,76,74,71],[74,78,79,78],[76,73,71,69]]
for bar,(bass,chord) in enumerate(chords):
 final=bar>=30;energy=.8 if bar<4 or bar>=28 else 1
 add(bar,0,bass,3.85,47,4)
 for j,n in enumerate(chord):add(bar,0,n,3.85,25 if bar<8 else 31,2)
 if final:
  for j,n in enumerate(chord):add(bar,j*.07,n,5.2 if bar==30 else 2.1,43-j*2,0)
  if bar==30:
   for j,n in enumerate([74,78,81,86]):add(bar,j*.4,n,4-j*.4,40,1)
 else:
  pattern=[0,1,2,3,1,2,3,2]
  for j,k in enumerate(pattern):add(bar,j*.5,chord[k]+(12 if j in [3,6] else 0),1.25,int((42+(6 if j==0 else 0)+random.random()*6)*energy),0)
  if bar>=4:
   melody=motifs[bar%8]
   for j,n in enumerate(melody):
    b=j if bar%4 else j*.85
    add(bar,b,n,1.2 if j==3 else .87,48 if j==0 else 42,3 if bar<28 else 0)
  if bar%4==3:
   for j,n in enumerate(chord):add(bar,2+j*.33,n+12,1.4,31,1)
Path('output').mkdir(exist_ok=True)
Path('output/score.json').write_text(json.dumps(sorted(notes,key=lambda x:x['time']),indent=2))
print(f'{len(notes)} notes; 32 bars; D major; 80 BPM; 96 s')
