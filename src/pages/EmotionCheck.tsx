import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mic, Camera, Square, Loader2, Wind, BookOpen, Users, Moon, Phone, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Mode = 'text' | 'voice' | 'face';
type Result = { text: number | null; voice: number | null; face: number | null; emotion: string; contexts: string[]; summary: string };
const WEIGHTS = { text: 0.45, voice: 0.3, face: 0.25 };
const CRISIS = /suicid|kill myself|end (my|it all)|self.?harm|no reason to live|want to die|hopeless/i;
const HISTORY_KEY = 'emotion-history';

function fuse(r: Result) {
  let s = 0, w = 0;
  (['text', 'voice', 'face'] as const).forEach((k) => { if (r[k] != null) { s += (r[k] as number) * WEIGHTS[k]; w += WEIGHTS[k]; } });
  return w ? s / w : 0;
}

// Safety layer first, then recommendation engine
function decide(r: Result, fused: number, rawText: string) {
  const hist: number[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const repeated = hist.slice(-3).filter((x) => x >= 0.7).length >= 2 && fused >= 0.7;
  if (CRISIS.test(rawText) || r.contexts.includes('severe') || fused >= 0.85 || repeated) return 'severe';
  if (r.contexts.includes('sleep')) return 'sleep';
  if (r.contexts.includes('academic')) return 'academic';
  if (r.contexts.includes('loneliness')) return 'loneliness';
  return 'mild_stress';
}

const level = (s: number) => (s < 0.35 ? 'Low' : s < 0.6 ? 'Moderate' : s < 0.8 ? 'High' : 'Very high');

export default function EmotionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [features, setFeatures] = useState<Record<string, number> | null>(null);
  const [bars, setBars] = useState<number[]>(Array(24).fill(4));
  const [camOn, setCamOn] = useState(false);
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Result & { fused: number; plan: string }) | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<{ ctx: AudioContext; stream: MediaStream; raf: number; rec: any; samples: number[]; zc: number[]; t0: number } | null>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); stopVoice(); }, []);

  async function startVoice() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser(); an.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Float32Array(an.fftSize);
      const state = { ctx, stream, raf: 0, rec: null as any, samples: [] as number[], zc: [] as number[], t0: Date.now() };
      const loop = () => {
        an.getFloatTimeDomainData(buf);
        let sum = 0, z = 0;
        for (let i = 0; i < buf.length; i++) { sum += buf[i] * buf[i]; if (i && buf[i - 1] * buf[i] < 0) z++; }
        const rms = Math.sqrt(sum / buf.length);
        state.samples.push(rms); if (rms > 0.02) state.zc.push(z);
        setBars((b) => [...b.slice(1), Math.min(60, 4 + rms * 400)]);
        state.raf = requestAnimationFrame(loop);
      };
      loop();
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-IN';
        rec.onresult = (e: any) => setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(' '));
        rec.start(); state.rec = rec;
      }
      audioRef.current = state; setTranscript(''); setRecording(true);
    } catch { toast({ title: 'Microphone unavailable', description: 'Please allow microphone access.', variant: 'destructive' }); }
  }

  function stopVoice() {
    const s = audioRef.current; if (!s) return;
    cancelAnimationFrame(s.raf); s.rec?.stop(); s.stream.getTracks().forEach((t) => t.stop()); s.ctx.close();
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
    const sd = (a: number[]) => { const m = mean(a); return Math.sqrt(mean(a.map((x) => (x - m) ** 2))); };
    setFeatures({
      seconds: Math.round((Date.now() - s.t0) / 1000),
      avgEnergy: +mean(s.samples).toFixed(4),
      energyVariability: +sd(s.samples).toFixed(4),
      pitchProxyVariability: +sd(s.zc).toFixed(2),
      voicedRatio: +(s.zc.length / (s.samples.length || 1)).toFixed(2),
    });
    audioRef.current = null; setRecording(false);
  }

  async function startCam() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = s; setCamOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 50);
    } catch { toast({ title: 'Camera unavailable', description: 'You can upload a photo instead.', variant: 'destructive' }); }
  }
  function snap() {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement('canvas'); const scale = 480 / (v.videoWidth || 480);
    c.width = 480; c.height = (v.videoHeight || 360) * scale;
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    setPhoto(c.toDataURL('image/jpeg', 0.8));
    streamRef.current?.getTracks().forEach((t) => t.stop()); setCamOn(false);
  }
  function upload(f?: File) {
    if (!f || !f.type.startsWith('image/') || f.size > 4_000_000) return toast({ title: 'Please choose an image under 4 MB', variant: 'destructive' });
    const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f);
  }

  async function analyze() {
    if (!text.trim() && !transcript && !features && !photo) return toast({ title: 'Add at least one input first' });
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('emotion-analyze', { body: { text, transcript, voiceFeatures: features, image: photo } });
    setLoading(false);
    if (error) {
      const d = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
      return toast({ title: 'Analysis failed', description: d?.error || error.message, variant: 'destructive' });
    }
    const r = data as Result;
    const fused = fuse(r);
    const plan = decide(r, fused, `${text} ${transcript}`);
    const hist: number[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    localStorage.setItem(HISTORY_KEY, JSON.stringify([...hist, fused].slice(-10)));
    setResult({ ...r, fused, plan });
  }

  const tabs: { id: Mode; label: string; icon: any; done: boolean }[] = [
    { id: 'text', label: 'Text', icon: MessageSquare, done: !!text.trim() },
    { id: 'voice', label: 'Voice', icon: Mic, done: !!features },
    { id: 'face', label: 'Face', icon: Camera, done: !!photo },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-20">
      <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="h-7 w-7 text-primary" /> Emotion Check-in</h1>
          <p className="text-muted-foreground">Share how you feel by text, voice or a photo. We combine them into one stress estimate and suggest support that fits.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setMode(t.id)}
                  className={cn('flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all duration-300',
                    mode === t.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  <t.icon className="h-4 w-4" /> {t.label}{t.done && <span className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div key={mode} className="animate-fade-in min-h-[220px]">
              {mode === 'text' && (
                <Textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 3000))} rows={8}
                  placeholder="How are you feeling today? What's on your mind?" />
              )}
              {mode === 'voice' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 items-center gap-1">
                    {bars.map((h, i) => <div key={i} className={cn('w-1.5 rounded-full transition-all', recording ? 'bg-primary' : 'bg-muted-foreground/30')} style={{ height: recording ? h : 4 }} />)}
                  </div>
                  <Button size="lg" variant={recording ? 'destructive' : 'default'} onClick={recording ? stopVoice : startVoice} className="rounded-full">
                    {recording ? <><Square className="mr-2 h-4 w-4" /> Stop</> : <><Mic className="mr-2 h-4 w-4" /> Start speaking</>}
                  </Button>
                  {transcript && <p className="text-sm text-muted-foreground italic text-center">"{transcript}"</p>}
                  {features && !recording && <p className="text-xs text-muted-foreground">Recorded {features.seconds}s of voice</p>}
                </div>
              )}
              {mode === 'face' && (
                <div className="flex flex-col items-center gap-4">
                  {camOn ? <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm rounded-xl border scale-x-[-1]" />
                    : photo ? <img src={photo} alt="Your snapshot" className="w-full max-w-sm rounded-xl border" />
                    : <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-xl border border-dashed text-muted-foreground"><Camera className="h-10 w-10" /></div>}
                  <div className="flex flex-wrap justify-center gap-2">
                    {camOn ? <Button onClick={snap}>Capture</Button> : <Button onClick={startCam}><Camera className="mr-2 h-4 w-4" /> Open camera</Button>}
                    <Button variant="outline" asChild><label className="cursor-pointer">Upload photo<input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} /></label></Button>
                    {photo && <Button variant="ghost" onClick={() => setPhoto('')}>Remove</Button>}
                  </div>
                  <p className="text-xs text-muted-foreground">Your photo is only used for this check-in and is not saved.</p>
                </div>
              )}
            </div>
            <Button className="mt-4 w-full" size="lg" onClick={analyze} disabled={loading || recording}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing…</> : 'Analyse how I feel'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
            <Card>
              <CardHeader><CardTitle>Stress breakdown</CardTitle><CardDescription>Detected feeling: <Badge variant="secondary">{result.emotion}</Badge></CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {(['text', 'voice', 'face'] as const).map((k) => (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{k === 'face' ? 'Facial' : k} stress</span>
                      <span className="font-mono">{result[k] == null ? 'not used' : (result[k] as number).toFixed(2)}</span></div>
                    <Progress value={(result[k] ?? 0) * 100} className={cn(result[k] == null && 'opacity-30')} />
                  </div>
                ))}
                <div className="rounded-xl bg-primary/10 p-4">
                  <div className="flex justify-between font-semibold"><span>Estimated stress</span><span className="font-mono">{result.fused.toFixed(2)}</span></div>
                  <Progress value={result.fused * 100} className="mt-2 h-3" />
                  <p className="mt-2 text-sm text-muted-foreground">{level(result.fused)} · {result.summary}</p>
                </div>
              </CardContent>
            </Card>
            <Intervention plan={result.plan} navigate={navigate} />
          </div>
        )}
      </div>
    </div>
  );
}

function Intervention({ plan, navigate }: { plan: string; navigate: (p: string) => void }) {
  if (plan === 'severe') return (
    <Card className="border-2 border-destructive bg-destructive/5">
      <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><Phone className="h-5 w-5" /> You don't have to carry this alone</CardTitle>
        <CardDescription>It sounds like things feel really heavy. Please reach out to someone you trust: a friend, family member, or a professional.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="destructive" className="w-full"><a href="tel:14416">Call Tele-MANAS 14416 (24x7, free)</a></Button>
        <Button variant="outline" className="w-full" onClick={() => navigate('/book-appointment')}>Book a counsellor</Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/crisis-support')}>Open Crisis Support</Button>
      </CardContent>
    </Card>
  );
  if (plan === 'academic') return <Planner />;
  if (plan === 'loneliness') return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Reconnect gently</CardTitle><CardDescription>Small steps toward people can lift loneliness.</CardDescription></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {['Text one friend: "Hey, thinking of you, how have you been?"', 'Call a family member for 5 minutes tonight', 'Join a club, study group or hostel activity this week', 'Share in the peer forum, others feel this too'].map((s) => <div key={s} className="rounded-lg bg-muted p-3">{s}</div>)}
        <Button className="w-full" onClick={() => navigate('/forum')}>Go to Peer Forum</Button>
      </CardContent></Card>
  );
  if (plan === 'sleep') return <Checklist />;
  return <Breathing />;
}

function Breathing() {
  const [on, setOn] = useState(false); const [phase, setPhase] = useState('Breathe in');
  useEffect(() => { if (!on) return; const seq = ['Breathe in', 'Hold', 'Breathe out', 'Hold']; let i = 0;
    const id = setInterval(() => { i = (i + 1) % 4; setPhase(seq[i]); }, 4000); setPhase(seq[0]); return () => clearInterval(id); }, [on]);
  const big = phase === 'Breathe in' || (phase === 'Hold' && on);
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /> Box breathing</CardTitle><CardDescription>Four seconds each: in, hold, out, hold.</CardDescription></CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className={cn('flex h-40 w-40 items-center justify-center rounded-full bg-primary/20 transition-transform duration-[4000ms] ease-in-out', on && big ? 'scale-110' : 'scale-75')}>
          <span className="font-medium">{on ? phase : 'Ready'}</span></div>
        <Button onClick={() => setOn(!on)}>{on ? 'Stop' : 'Start'}</Button>
      </CardContent></Card>
  );
}

function Planner() {
  const [task, setTask] = useState(''); const [steps, setSteps] = useState<{ t: string; d: boolean }[]>([]); const [s, setS] = useState('');
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Break it into small steps</CardTitle><CardDescription>Big tasks feel lighter in 25-minute pieces.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <input className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="What's the big task? (e.g. DBMS exam)" value={task} onChange={(e) => setTask(e.target.value)} />
        <div className="flex gap-2"><input className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" placeholder="Add a small step" value={s} onChange={(e) => setS(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && s.trim()) { setSteps([...steps, { t: s.trim(), d: false }]); setS(''); } }} />
          <Button onClick={() => { if (s.trim()) { setSteps([...steps, { t: s.trim(), d: false }]); setS(''); } }}>Add</Button></div>
        {steps.map((x, i) => <label key={i} className="flex items-center gap-2 text-sm"><Checkbox checked={x.d} onCheckedChange={() => setSteps(steps.map((y, j) => j === i ? { ...y, d: !y.d } : y))} /><span className={cn(x.d && 'line-through text-muted-foreground')}>{x.t}</span></label>)}
        {steps.length > 0 && <Progress value={(steps.filter((x) => x.d).length / steps.length) * 100} />}
        <p className="text-xs text-muted-foreground">Tip: work 25 min, rest 5 min. After 4 rounds, take a longer break.</p>
      </CardContent></Card>
  );
}

function Checklist() {
  const items = ['Same bedtime and wake time daily', 'No screens 30 min before bed', 'No caffeine after 4 PM', 'Keep the room dark and cool', 'Write tomorrow\'s worries down before bed', 'Avoid long naps after 3 PM'];
  const [done, setDone] = useState<boolean[]>(items.map(() => false));
  return (
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /> Sleep hygiene checklist</CardTitle><CardDescription>Tick what you can do tonight.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {items.map((t, i) => <label key={t} className="flex items-center gap-2 text-sm"><Checkbox checked={done[i]} onCheckedChange={() => setDone(done.map((d, j) => j === i ? !d : d))} />{t}</label>)}
        <Progress value={(done.filter(Boolean).length / items.length) * 100} />
        <p className="text-xs text-muted-foreground">If poor sleep lasts more than 2 weeks, consider talking to a counsellor.</p>
      </CardContent></Card>
  );
}
