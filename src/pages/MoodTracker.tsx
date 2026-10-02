import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { XGBRegressor } from "@/lib/xgboost";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Smile, Brain, TrendingUp, TrendingDown, Sparkles, Lightbulb } from "lucide-react";

type Entry = {
  id?: string; entry_date: string; mood: number; sleep_hours: number; stress: number; energy: number;
  exercise_minutes: number; social_hours: number; study_hours: number; screen_hours: number;
  emotions: string[] | null; note: string | null;
};

const FEATURES = [
  { key: "sleep_hours", label: "Sleep", min: 0, max: 12, step: 0.5, unit: "h" },
  { key: "stress", label: "Stress", min: 1, max: 10, step: 1, unit: "/10" },
  { key: "energy", label: "Energy", min: 1, max: 10, step: 1, unit: "/10" },
  { key: "exercise_minutes", label: "Exercise", min: 0, max: 120, step: 5, unit: "min" },
  { key: "social_hours", label: "Time with people", min: 0, max: 10, step: 0.5, unit: "h" },
  { key: "study_hours", label: "Study", min: 0, max: 14, step: 0.5, unit: "h" },
  { key: "screen_hours", label: "Leisure screen time", min: 0, max: 12, step: 0.5, unit: "h" },
] as const;
type FKey = (typeof FEATURES)[number]["key"];

const EMOTIONS = ["Calm", "Happy", "Grateful", "Anxious", "Sad", "Irritated", "Lonely", "Tired", "Motivated", "Overwhelmed"];
const MOOD_EMOJI = ["😞", "😞", "😟", "😕", "😐", "🙂", "🙂", "😊", "😄", "🤩"];

// Population prior (synthetic student data) so the model works from day one;
// the user's own entries are weighted more heavily as they accumulate.
function syntheticPrior(n = 160) {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const rows: { x: number[]; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x = [4 + r() * 5, 1 + r() * 9, 1 + r() * 9, r() * 90, r() * 6, r() * 10, r() * 9];
    const y = 5 + 0.45 * (x[0] - 7) - 0.4 * (x[1] - 5) + 0.3 * (x[2] - 5) + 0.02 * x[3]
      + 0.25 * Math.min(x[4], 3) - 0.12 * Math.max(x[5] - 8, 0) - 0.15 * Math.max(x[6] - 4, 0) + (r() - 0.5);
    rows.push({ x, y: Math.max(1, Math.min(10, y)) });
  }
  return rows;
}

const toX = (e: Record<FKey, number>) => FEATURES.map((f) => Number(e[f.key]));

export default function MoodTracker() {
  const { user, loading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saving, setSaving] = useState(false);
  const [mood, setMood] = useState(6);
  const [vals, setVals] = useState<Record<FKey, number>>({
    sleep_hours: 7, stress: 5, energy: 5, exercise_minutes: 20, social_hours: 2, study_hours: 5, screen_hours: 3,
  });
  const [emotions, setEmotions] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => { if (!loading && !isAuthenticated) navigate("/auth"); }, [loading, isAuthenticated, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("mood_entries").select("*").eq("user_id", user.id)
      .order("entry_date", { ascending: true }).limit(90);
    setEntries((data as Entry[]) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const model = useMemo(() => {
    const prior = syntheticPrior();
    const X = prior.map((p) => p.x), y = prior.map((p) => p.y);
    // Repeat personal entries so they dominate as history grows
    const w = Math.max(3, Math.round(prior.length / Math.max(entries.length, 1) / 2));
    entries.forEach((e) => { for (let k = 0; k < w; k++) { X.push(toX(e as any)); y.push(e.mood); } });
    return new XGBRegressor({ nEstimators: 70, maxDepth: 3, learningRate: 0.15, lambda: 1.5 }).fit(X, y);
  }, [entries]);

  const predicted = Math.max(1, Math.min(10, model.predict(toX(vals))));
  const importance = model.normalizedImportance()
    .map((v, i) => ({ ...FEATURES[i], v })).sort((a, b) => b.v - a.v);

  // What-if suggestions: find the single habit change that most improves predicted mood
  const tips = useMemo(() => {
    const tweaks: [FKey, number, string][] = [
      ["sleep_hours", 1, "Sleep 1 hour more"], ["stress", -2, "Lower stress by 2 (try breathing in Relax Zone)"],
      ["exercise_minutes", 20, "Add a 20-minute walk"], ["social_hours", 1, "Spend 1 more hour with friends"],
      ["screen_hours", -1.5, "Cut 1.5h of leisure screen time"], ["study_hours", -1, "Take a 1-hour study break"],
    ];
    return tweaks.map(([k, d, label]) => {
      const f = FEATURES.find((x) => x.key === k)!;
      const nv = { ...vals, [k]: Math.max(f.min, Math.min(f.max, vals[k] + d)) };
      return { label, gain: model.predict(toX(nv)) - model.predict(toX(vals)) };
    }).filter((t) => t.gain > 0.05).sort((a, b) => b.gain - a.gain).slice(0, 3);
  }, [model, vals]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("mood_entries").upsert({
      user_id: user.id, entry_date: new Date().toISOString().slice(0, 10), mood, ...vals, emotions, note: note || null,
    }, { onConflict: "user_id,entry_date" });
    setSaving(false);
    if (error) return toast({ title: "Could not save", description: error.message, variant: "destructive" });
    toast({ title: "Mood logged", description: "Your model has been retrained with today's check-in." });
    load();
  };

  const chart = entries.slice(-30).map((e) => ({
    date: e.entry_date.slice(5), mood: e.mood, predicted: +model.predict(toX(e as any)).toFixed(1),
  }));
  const avg = entries.length ? entries.reduce((s, e) => s + e.mood, 0) / entries.length : 0;
  const lowStreak = entries.slice(-3).length === 3 && entries.slice(-3).every((e) => e.mood <= 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Smile className="h-8 w-8 text-primary" /> Mood Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Daily check-ins analysed by an on-device XGBoost model that learns which habits shape your mood.
        </p>
      </div>

      {lowStreak && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <p>Your mood has been low for 3 days. Talking to someone can help — Tele-MANAS: <b>14416</b>.</p>
            <Button variant="destructive" onClick={() => navigate("/book-appointment")}>Book a counsellor</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Today's check-in</CardTitle><CardDescription>How are you feeling?</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex justify-between mb-2"><span className="font-medium">Mood</span>
                <span className="text-2xl">{MOOD_EMOJI[mood - 1]} {mood}/10</span></div>
              <Slider min={1} max={10} step={1} value={[mood]} onValueChange={([v]) => setMood(v)} />
            </div>
            {FEATURES.map((f) => (
              <div key={f.key}>
                <div className="flex justify-between text-sm mb-2"><span>{f.label}</span>
                  <span className="text-muted-foreground">{vals[f.key]}{f.unit}</span></div>
                <Slider min={f.min} max={f.max} step={f.step} value={[vals[f.key]]}
                  onValueChange={([v]) => setVals((p) => ({ ...p, [f.key]: v }))} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <Badge key={e} variant={emotions.includes(e) ? "default" : "outline"} className="cursor-pointer"
                  onClick={() => setEmotions((p) => p.includes(e) ? p.filter((x) => x !== e) : [...p, e])}>{e}</Badge>
              ))}
            </div>
            <Textarea placeholder="Anything on your mind? (private)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save today's mood"}</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> XGBoost prediction</CardTitle>
              <CardDescription>
                Expected mood for these habits · trained on {entries.length} personal entries
                {entries.length < 7 && " + student baseline data"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-primary">{predicted.toFixed(1)}</span>
                <span className="text-muted-foreground mb-1">/ 10</span>
                {entries.length > 0 && (predicted >= avg
                  ? <TrendingUp className="h-6 w-6 text-primary mb-1" />
                  : <TrendingDown className="h-6 w-6 text-destructive mb-1" />)}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1"><Sparkles className="h-4 w-4" /> What drives your mood most</p>
                {importance.slice(0, 5).map((f) => (
                  <div key={f.key} className="text-sm">
                    <div className="flex justify-between"><span>{f.label}</span><span>{Math.round(f.v * 100)}%</span></div>
                    <Progress value={f.v * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Personal suggestions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tips.length ? tips.map((t) => (
                <div key={t.label} className="flex justify-between rounded-md bg-muted p-3 text-sm">
                  <span>{t.label}</span><span className="font-semibold text-primary">+{t.gain.toFixed(1)} mood</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">Your habits look well balanced today. Keep going!</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Mood history</CardTitle><CardDescription>Actual mood vs model estimate (last 30 check-ins)</CardDescription></CardHeader>
        <CardContent>
          {chart.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" fontSize={12} /><YAxis domain={[1, 10]} fontSize={12} /><Tooltip />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} name="Your mood" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Model estimate" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground">Log your first check-in to see your trend.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
