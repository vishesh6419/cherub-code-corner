import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const systemPrompt = `You are a warm, supportive mental health first-aid assistant for college students in India.

Guidelines:
- Be empathetic, non-judgmental and culturally sensitive.
- Offer practical coping strategies (breathing, grounding, sleep hygiene, study-stress planning).
- Never diagnose or replace professional care; encourage booking a campus counsellor when appropriate.
- If there is any sign of self-harm or crisis, gently urge immediate help and mention the Tele-MANAS helpline 14416 and the app's Crisis Support page.
- Keep replies concise, friendly and actionable.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI is not configured yet.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history: ChatTurn[] = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory.slice(-20).filter(
          (m: ChatTurn) =>
            (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string',
        )
      : [];

    if (!message || message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Please send a message (max 4000 characters).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const input = [
      ...history.map((m) => ({
        role: m.role,
        content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: m.content }],
      })),
      { role: 'user', content: [{ type: 'input_text', text: message }] },
    ];

    const res = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
        'X-Lovable-AIG-SDK': 'fetch',
      },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        instructions: systemPrompt,
        input,
        stream: true,
        reasoning: { effort: 'low', summary: 'auto' },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => '');
      console.error('AI gateway error', res.status, detail);
      const message =
        res.status === 429
          ? 'The assistant is busy right now. Please try again in a moment.'
          : res.status === 402
            ? 'AI credits are exhausted. Please add credits to continue.'
            : 'The assistant could not respond right now.';
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'response.output_text.delta' && typeof evt.delta === 'string') {
            text += evt.delta;
          } else if (evt.type === 'response.completed' && !text) {
            text = evt.response?.output_text ?? '';
          }
        } catch (_) {
          // ignore keep-alive / partial frames
        }
      }
    }

    if (!text.trim()) {
      text = "I'm here with you, but I couldn't form a reply just now. Could you tell me a bit more?";
    }

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ai-chat failed', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
