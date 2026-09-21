import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Wind, Grid3X3, Sparkles, BookHeart, RotateCcw } from "lucide-react";

/* ---------------- Breathing bubble ---------------- */
const phases = [
  { label: "Breathe in", seconds: 4, scale: "scale-100" },
  { label: "Hold", seconds: 4, scale: "scale-100" },
  { label: "Breathe out", seconds: 6, scale: "scale-50" },
];

function BreathingGame() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(phases[0].seconds);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhase((p) => {
          const next = (p + 1) % phases.length;
          if (next === 0) setCycles((c) => c + 1);
          setLeft(phases[next].seconds);
          return next;
        });
        return phases[(phase + 1) % phases.length].seconds;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase]);

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-[3000ms] ease-in-out ${
            running ? phases[phase].scale : "scale-75"
          }`}
        />
        <div className="relative text-center">
          <p className="text-lg font-semibold">{running ? phases[phase].label : "Ready?"}</p>
          <p className="text-4xl font-bold text-primary">{running ? left : "4-4-6"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start breathing"}</Button>
        <Badge variant="secondary">Cycles: {cycles}</Badge>
      </div>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        A 4-4-6 breathing rhythm calms the nervous system. Three to five cycles is enough to feel a shift.
      </p>
    </div>
  );
}

/* ---------------- Memory match ---------------- */
const emojis = ["🌸", "🌿", "🌊", "☀️", "🌙", "🍃", "⭐", "🪷"];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MemoryGame() {
  const [cards, setCards] = useState(() => shuffle([...emojis, ...emojis]));
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open;
    const timer = setTimeout(() => {
      if (cards[a] === cards[b]) setDone((d) => [...d, a, b]);
      setOpen([]);
    }, 700);
    return () => clearTimeout(timer);
  }, [open, cards]);

  const reset = () => {
    setCards(shuffle([...emojis, ...emojis]));
    setOpen([]);
    setDone([]);
    setMoves(0);
  };

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || done.includes(i)) return;
    setOpen((o) => [...o, i]);
    if (open.length === 1) setMoves((m) => m + 1);
  };

  const won = done.length === cards.length;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">Moves: {moves}</Badge>
        {won && <Badge>Calm achieved! 🎉</Badge>}
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const visible = open.includes(i) || done.includes(i);
          return (
            <button
              key={i}
              onClick={() => flip(i)}
              aria-label={visible ? `Card ${c}` : "Hidden card"}
              className={`flex aspect-square items-center justify-center rounded-xl border text-3xl transition-all ${
                visible ? "bg-primary/10 border-primary/30" : "bg-muted hover:bg-muted/70"
              }`}
            >
              {visible ? c : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Tic tac toe ---------------- */
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(b: (string | null)[]) {
  for (const [x, y, z] of lines) if (b[x] && b[x] === b[y] && b[y] === b[z]) return b[x];
  return null;
}

function TicTacToe() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const winner = winnerOf(board);
  const full = board.every(Boolean);

  const play = (i: number) => {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = "X";
    const w = winnerOf(next);
    if (!w) {
      const empty = next.map((v, idx) => (v ? -1 : idx)).filter((v) => v >= 0);
      if (empty.length) next[empty[Math.floor(Math.random() * empty.length)]] = "O";
    }
    setBoard(next);
  };

  return (
    <div className="space-y-4 py-4 text-center">
      <p className="text-sm text-muted-foreground">
        {winner ? (winner === "X" ? "You win! 🎉" : "Computer wins — try again") : full ? "A draw!" : "You are X"}
      </p>
      <div className="mx-auto grid max-w-[260px] grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            aria-label={`Square ${i + 1}`}
            className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-3xl font-bold hover:bg-muted/70"
          >
            {v}
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => setBoard(Array(9).fill(null))}>
        <RotateCcw className="mr-2 h-4 w-4" /> New game
      </Button>
    </div>
  );
}

/* ---------------- Colour focus ---------------- */
function ColourFocus() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const size = Math.min(2 + Math.floor(round / 2), 6);
  const odd = useMemo(() => Math.floor(Math.random() * size * size), [round, size]);
  const hue = useMemo(() => Math.floor(Math.random() * 360), [round]);
  const diff = Math.max(18 - round, 5);

  const pick = (i: number) => {
    if (i === odd) {
      setScore((s) => s + 1);
      setRound((r) => r + 1);
    } else {
      setRound(1);
      setScore(0);
    }
  };

  return (
    <div className="space-y-4 py-4 text-center">
      <div className="flex items-center justify-center gap-3">
        <Badge variant="secondary">Round {round}</Badge>
        <Badge>Score {score}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Spot the tile with a slightly different shade.</p>
      <div
        className="mx-auto grid max-w-[300px] gap-2"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: size * size }).map((_, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            aria-label={`Tile ${i + 1}`}
            className="aspect-square rounded-lg transition-transform hover:scale-95"
            style={{
              backgroundColor: `hsl(${hue} 60% ${i === odd ? 55 + diff : 55}%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Case study reflection ---------------- */
const cases = [
  {
    title: "Exam night spiral",
    text: "Riya has an exam tomorrow. It's 1 a.m., she's read the same page five times and her heart is racing. What helps most right now?",
    options: [
      { label: "Push through until 4 a.m. to finish the syllabus", ok: false, why: "Sleep loss makes recall worse — fatigue beats extra hours." },
      { label: "Close the book, do 5 minutes of slow breathing, sleep, revise key points early", ok: true, why: "Rest plus a short focused revision improves recall far more than an all-nighter." },
      { label: "Scroll social media to distract herself", ok: false, why: "Scrolling raises arousal and delays sleep even further." },
    ],
  },
  {
    title: "A friend goes quiet",
    text: "Your hostel friend has skipped classes for a week and barely replies. What's the most supportive first step?",
    options: [
      { label: "Give them space and wait until they reach out", ok: false, why: "Withdrawal often means reaching out is the hardest thing to do." },
      { label: "Knock, sit with them and ask openly how they've been feeling", ok: true, why: "Non-judgemental presence and a direct, kind question opens the door." },
      { label: "Tell the whole friend group so everyone confronts them", ok: false, why: "Group confrontation can feel shaming and increase isolation." },
    ],
  },
  {
    title: "Panic before presenting",
    text: "Aman's chest tightens minutes before a class presentation. Which grounding move fits best?",
    options: [
      { label: "Name 5 things he can see, 4 he can hear, 3 he can touch", ok: true, why: "5-4-3-2-1 grounding pulls attention out of the panic loop into the present." },
      { label: "Repeat 'don't panic' as fast as he can", ok: false, why: "Fighting the feeling usually amplifies it." },
      { label: "Skip the presentation entirely", ok: false, why: "Avoidance lowers anxiety now but strengthens it next time." },
    ],
  },
];

function CaseStudyGame() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const current = cases[index];

  const next = () => {
    setPicked(null);
    setIndex((i) => (i + 1) % cases.length);
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <Badge variant="secondary" className="mb-2">
          Case {index + 1} of {cases.length}
        </Badge>
        <h3 className="text-lg font-semibold">{current.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{current.text}</p>
      </div>
      <div className="space-y-2">
        {current.options.map((o, i) => {
          const chosen = picked === i;
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                chosen
                  ? o.ok
                    ? "border-primary bg-primary/10"
                    : "border-destructive bg-destructive/10"
                  : "hover:bg-muted"
              }`}
            >
              <span className="font-medium">{o.label}</span>
              {chosen && <p className="mt-1 text-xs text-muted-foreground">{o.why}</p>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <Button onClick={next} variant="outline" size="sm">
          Next case
        </Button>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */
const games = [
  { id: "breathe", label: "Breathing Bubble", icon: Wind, node: <BreathingGame /> },
  { id: "memory", label: "Memory Match", icon: Brain, node: <MemoryGame /> },
  { id: "tic", label: "Tic-Tac-Toe", icon: Grid3X3, node: <TicTacToe /> },
  { id: "colour", label: "Colour Focus", icon: Sparkles, node: <ColourFocus /> },
  { id: "cases", label: "Case Studies", icon: BookHeart, node: <CaseStudyGame /> },
];

export default function Games() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-24" ref={containerRef}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Relax Zone</h1>
          <p className="mt-2 text-muted-foreground">
            Five light games to slow your mind down between classes. No scores to chase — just a few calm minutes.
          </p>
        </div>

        <Tabs defaultValue="breathe">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1">
            {games.map((g) => (
              <TabsTrigger key={g.id} value={g.id} className="flex items-center gap-2">
                <g.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{g.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {games.map((g) => (
            <TabsContent key={g.id} value={g.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <g.icon className="h-5 w-5 text-primary" />
                    {g.label}
                  </CardTitle>
                  <CardDescription>Take your time. You can stop whenever you like.</CardDescription>
                </CardHeader>
                <CardContent>{g.node}</CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
