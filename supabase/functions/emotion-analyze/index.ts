import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const instructions = `You are an emotion-analysis encoder for a student wellbeing app. You receive optional modalities:
TEXT (what the student typed), VOICE (speech transcript plus acoustic features: energy variability, pitch variability, speaking rate), FACE (a photo).
For each PROVIDED modality estimate a stress score 0..1. For missing modalities return null.
Detect contexts from this list only: "mild_stress","academic","loneliness","sleep","severe". Use "severe" for hopelessness, self-harm, crisis.
Reply with ONLY compact JSON, no markdown:
{"text":number|null,"voice":number|null,"face":number|null,"emotion":"one word","contexts":[...],"summary":"one warm sentence to the student"}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'AI is not configured.' }, 500);
    const b = await req.json().catch(() => null);
    const text = typeof b?.text === 'string' ? b.text.slice(0, 3000) : '';
    const transcript = typeof b?.transcript === 'string' ? b.transcript.slice(0, 3000) : '';
    const features = b?.voiceFeatures && typeof b.voiceFeatures === 'object' ? b.voiceFeatures : null;
    const image = typeof b?.image === 'string' && b.image.startsWith('data:image/') && b.image.length < 6_000_000 ? b.image : '';
    if (!text && !transcript && !features && !image) return json({ error: 'Provide at least one input.' }, 400);

    const content: unknown[] = [{
      type: 'input_text',
      text: `TEXT: ${text || '(none)'}\nVOICE: ${transcript || features ? `transcript="${transcript}" features=${JSON.stringify(features)}` : '(none)'}\nFACE: ${image ? 'attached' : '(none)'}`,
    }];
    if (image) content.push({ type: 'input_image', image_url: image });

    const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'fetch' },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        instructions,
        input: [{ role: 'user', content }],
        reasoning: { effort: 'low' },
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error('gateway', res.status, detail);
      const msg = res.status === 429 ? 'Busy right now, try again shortly.' : res.status === 402 ? 'AI credits are exhausted.' : 'Analysis failed.';
      return json({ error: msg }, res.status);
    }
    const data = await res.json();
    let out = data.output_text ?? '';
    if (!out && Array.isArray(data.output)) {
      for (const o of data.output) for (const c of o.content ?? []) if (c.type === 'output_text') out += c.text;
    }
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: 'Could not read analysis.' }, 502);
    return json(JSON.parse(m[0]));
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
