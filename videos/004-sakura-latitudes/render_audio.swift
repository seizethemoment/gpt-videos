// macOS built-in orchestral instruments. No sound-bank data is copied into the project.
import Foundation
import AVFoundation
struct Note: Decodable { let time:Double;let duration:Double;let note:UInt8;let velocity:UInt8;let instrument:Int }
struct Event { let frame:Int64;let note:UInt8;let velocity:UInt8;let instrument:Int;let on:Bool }
let notes=try JSONDecoder().decode([Note].self,from:Data(contentsOf:URL(fileURLWithPath:"output/score.json")))
let rate=48000.0,duration=96.0,format=AVAudioFormat(standardFormatWithSampleRate:48000,channels:2)!
let engine=AVAudioEngine(),reverb=AVAudioUnitReverb(),instrumentMixer=AVAudioMixerNode()
engine.attach(reverb);engine.attach(instrumentMixer);engine.connect(instrumentMixer,to:reverb,format:format);reverb.loadFactoryPreset(.largeHall);reverb.wetDryMix=27
engine.connect(reverb,to:engine.mainMixerNode,format:format)
let programs:[UInt8]=[0,46,48,73,42]
var samplers:[AVAudioUnitSampler]=[]
for (i,program) in programs.enumerated(){
 let s=AVAudioUnitSampler();engine.attach(s);engine.connect(s,to:instrumentMixer,format:format)
 try s.loadSoundBankInstrument(at:URL(fileURLWithPath:"/System/Library/Components/CoreAudio.component/Contents/Resources/gs_instruments.dls"),program:program,bankMSB:UInt8(kAUSampler_DefaultMelodicBankMSB),bankLSB:0)
 s.masterGain = [-6.0,-14.0,-17.0,-17.0,-19.0][i];samplers.append(s)
}
try engine.enableManualRenderingMode(.offline,format:format,maximumFrameCount:1024)
engine.prepare();try engine.start()
var events:[Event]=[]
for n in notes{events.append(Event(frame:Int64(n.time*rate),note:n.note,velocity:n.velocity,instrument:n.instrument,on:true));events.append(Event(frame:Int64((n.time+n.duration)*rate),note:n.note,velocity:0,instrument:n.instrument,on:false))}
events.sort{a,b in a.frame==b.frame ? (!a.on && b.on) : a.frame<b.frame}
let file=try AVAudioFile(forWriting:URL(fileURLWithPath:"output/music.caf"),settings:format.settings)
let buffer=AVAudioPCMBuffer(pcmFormat:format,frameCapacity:1024)!
var cursor:Int64=0,index=0
let total=Int64(duration*rate)
while cursor<total{
 while index<events.count && events[index].frame<=cursor{let e=events[index];if e.on{samplers[e.instrument].startNote(e.note,withVelocity:e.velocity,onChannel:0)}else{samplers[e.instrument].stopNote(e.note,onChannel:0)};index+=1}
 let next=index<events.count ? min(total,events[index].frame) : total
 let count=AVAudioFrameCount(min(1024,max(1,next-cursor)))
 let status=try engine.renderOffline(count,to:buffer)
 if status == .success{try file.write(from:buffer);cursor+=Int64(count)}else if status == .error{throw NSError(domain:"AudioRender",code:1)}
}
engine.stop();print("Original spring nocturne rendered: 96 s, stereo 48 kHz")
