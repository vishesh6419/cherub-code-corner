import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, CheckCircle2, BookOpen } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";

const TASKS = [
  { id: "cbt", type: "CBT", label: "Write down one worrying thought and a balanced alternative" },
  { id: "journal", type: "Journaling", label: "Journal three things you're grateful for" },
  { id: "breathe", type: "Relaxation", label: "Do 5 minutes of box breathing" },
  { id: "affirm", type: "Affirmation", label: "Say: \"I am doing my best, and that is enough.\"" },
  { id: "move", type: "Habit", label: "Take a 15-minute walk" },
  { id: "water", type: "Habit", label: "Drink 8 glasses of water" },
];

const COURSES = [
  { id: "exam", title: "Beat Exam Stress", days: ["Map your syllabus into small chunks", "Try the Pomodoro method (25/5)", "Challenge 'I will fail' thoughts", "Plan sleep before exam day", "Practise a mock test calmly", "Reward yourself after study", "Reflect on what worked"] },
  { id: "sleep", title: "Manage Sleep", days: ["Fix a wake-up time", "No screens 30 min before bed", "Cut caffeine after 4 pm", "Make your room dark and cool", "Wind-down routine: read or stretch", "Keep a sleep diary", "Review your week's sleep"] },
  { id: "social", title: "Overcome Social Anxiety", days: ["Notice your anxious predictions", "Say hi to one classmate", "Ask one question in class", "Join a club or forum thread", "Practise slow breathing before talking", "Have a 5-minute chat", "Celebrate your brave moments"] },
];

const BADGES = [
  { days: 3, label: "3-day spark" },
  { days: 7, label: "1-week warrior" },
  { days: 14, label: "Fortnight champion" },
  { days: 30, label: "Self-care master" },
];

type Store = { done: Record<string, string[]>; courses: Record<string, number> };
const KEY = "selfcare-v1";
const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

const SelfCare: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const storeKey = `${KEY}-${user?.id ?? "anon"}`;
  const [store, setStore] = useState<Store>({ done: {}, courses: {} });
  const [moods, setMoods] = useState<{ entry_date: string; mood: number }[]>([]);
  const [range, setRange] = useState("7");

  useEffect(() => {
    if (!user) return;
    try { setStore(JSON.parse(localStorage.getItem(storeKey) || "") as Store); } catch { /* empty */ }
    supabase.from("mood_entries").select("entry_date, mood").eq("user_id", user.id)
      .then(({ data }) => setMoods((data ?? []) as { entry_date: string; mood: number }[]));
  }, [user, storeKey]);

  const save = (s: Store) => { setStore(s); localStorage.setItem(storeKey, JSON.stringify(s)); };
  const today = todayKey();
  const doneToday = store.done[today] ?? [];

  const toggle = (id: string) => {
    const next = doneToday.includes(id) ? doneToday.filter((x) => x !== id) : [...doneToday, id];
    save({ ...store, done: { ...store.done, [today]: next } });
  };

  const streak = useMemo(() => {
    let n = 0; const d = new Date();
    if (!(store.done[todayKey(d)]?.length)) d.setDate(d.getDate() - 1);
    while (store.done[todayKey(d)]?.length) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [store]);

  const chart = useMemo(() => {
    const n = Number(range); const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const k = todayKey(d);
      out.push({ day: k.slice(5), activities: store.done[k]?.length ?? 0, mood: moods.find((m) => m.entry_date === k)?.mood ?? null });
    }
    return out;
  }, [range, store, moods]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) { navigate("/auth"); return null; }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24 md:pt-16">
      <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Back"><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Self-Care Plan</h1>
            <p className="text-sm text-muted-foreground">Small daily steps, streaks and guided courses.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Today's tasks ({doneToday.length}/{TASKS.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Progress value={(doneToday.length / TASKS.length) * 100} />
              {TASKS.map((t) => (
                <label key={t.id} className="flex items-start gap-3 p-3 rounded-md border border-border cursor-pointer hover:bg-muted/50">
                  <Checkbox checked={doneToday.includes(t.id)} onCheckedChange={() => toggle(t.id)} aria-label={t.label} />
                  <div className="flex-1">
                    <p className={doneToday.includes(t.id) ? "line-through text-muted-foreground" : ""}>{t.label}</p>
                    <Badge variant="outline" className="mt-1">{t.type}</Badge>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> Streak</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold">{streak} <span className="text-base font-normal text-muted-foreground">day{streak === 1 ? "" : "s"}</span></p>
              <div className="space-y-2">
                {BADGES.map((b) => (
                  <div key={b.days} className={`flex items-center gap-2 text-sm ${streak >= b.days ? "" : "opacity-40"}`}>
                    <Trophy className="h-4 w-4 text-primary" /> {b.label} <span className="text-muted-foreground">({b.days} days)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Mood vs self-care</CardTitle>
            <Tabs value={range} onValueChange={setRange}><TabsList><TabsTrigger value="7">Week</TabsTrigger><TabsTrigger value="30">Month</TabsTrigger></TabsList></Tabs>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis domain={[0, 10]} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="activities" name="Tasks done" fill="hsl(var(--primary))" opacity={0.5} />
                <Line dataKey="mood" name="Mood (1-10)" stroke="hsl(var(--accent-foreground))" strokeWidth={2} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {COURSES.map((c) => {
            const day = store.courses[c.id] ?? 0;
            const finished = day >= c.days.length;
            return (
              <Card key={c.id}>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-primary" /> {c.title}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={(day / c.days.length) * 100} />
                  <p className="text-sm text-muted-foreground">{finished ? "Course complete — well done!" : `Day ${day + 1} of ${c.days.length}`}</p>
                  {!finished && <p className="text-sm">{c.days[day]}</p>}
                  <div className="flex gap-2">
                    {!finished && <Button size="sm" onClick={() => save({ ...store, courses: { ...store.courses, [c.id]: day + 1 } })}>Mark day done</Button>}
                    {day > 0 && <Button size="sm" variant="ghost" onClick={() => save({ ...store, courses: { ...store.courses, [c.id]: 0 } })}>Restart</Button>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelfCare;
