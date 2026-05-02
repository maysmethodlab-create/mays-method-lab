import {
  DEFAULT_MODEL,
  buildCachedSystem,
  getClient,
  isApiKeyConfigured,
} from '@/lib/evaluation-letters/claude';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';
import { assembleLetter } from '@/lib/endowed-positions/assemble';
import { draftPrompt } from '@/lib/endowed-positions/prompts';
import type { GeneratedParts, MRCVote, SetupData } from '@/lib/endowed-positions/types';

export const runtime = 'nodejs';
export const maxDuration = 240;

type Body = {
  setup: SetupData;
  votes: MRCVote[];
  sourceDocuments: string;
};

function parseFenced(text: string): GeneratedParts | null {
  const matches = [...text.matchAll(/```(?:json)?\n([\s\S]*?)```/g)];
  const candidate = matches[matches.length - 1]?.[1]?.trim();
  if (!candidate) return null;
  try {
    const parsed = JSON.parse(candidate);
    if (
      typeof parsed?.subjectLine === 'string' &&
      typeof parsed?.openingSentence === 'string' &&
      typeof parsed?.summaryReasonsClause === 'string' &&
      typeof parsed?.achievementParagraph === 'string'
    ) {
      return parsed as GeneratedParts;
    }
  } catch {
    return null;
  }
  return null;
}

function placeholderParts(setup: SetupData): GeneratedParts {
  return {
    subjectLine: `Recommendation to ${setup.nominationType.startsWith('reappoint') ? 'reappoint' : 'appoint'} Dr. ${setup.candidateName}, ${setup.candidateCurrentTitle}, as holder of the endowed ${setup.recommendedPositionName}`,
    openingSentence: `This memorandum includes our recommendation for Dr. ${setup.candidateName} to be ${setup.nominationType.startsWith('reappoint') ? 'reappointed' : 'appointed'} to the ${setup.recommendedPositionName} for a ${setup.termYears} (${setup.termYears}) year term.`,
    summaryReasonsClause:
      'his (her/their) sustained scholarly impact, leadership in the field, and consistent record of high-quality publications in top-tier journals',
    achievementParagraph: `(Placeholder. With a real ANTHROPIC_API_KEY, Claude would write a 150-250 word paragraph here citing specific publication counts, journals, citation totals, and awards from the candidate's CV and the dept-head letter.) The members of the Mays Research Council concurred with the department head's recommendation for Dr. ${setup.candidateName}.`,
  };
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.setup) {
    return new Response('setup is required', { status: 400 });
  }
  if (!body.setup.candidateName || !body.setup.recommendedPositionName) {
    return new Response('candidateName and recommendedPositionName are required.', { status: 400 });
  }

  const encoder = new TextEncoder();

  // Placeholder mode if no API key
  if (!isApiKeyConfigured()) {
    const parts = placeholderParts(body.setup);
    const assembled = assembleLetter({
      setup: body.setup,
      votes: body.votes || [],
      parts,
    });
    const sentinel = `<<<MODEL_JSON>>>${JSON.stringify(parts)}<<<END_MODEL_JSON>>>`;
    const text = `${sentinel}${placeholderNotice('Draft')}\n${assembled}`;

    const stream = new ReadableStream({
      async start(controller) {
        const chunks = text.match(/.{1,80}/gs) || [text];
        for (const c of chunks) {
          controller.enqueue(encoder.encode(c));
          await new Promise((r) => setTimeout(r, 4));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
    });
  }

  try {
    const { cachedReference, user } = await draftPrompt({
      setup: body.setup,
      votes: body.votes || [],
      sourceDocuments: body.sourceDocuments || '',
    });

    const client = getClient();
    // We collect the full response and parse the JSON envelope before
    // streaming. Streaming chunks of JSON to the user would be confusing —
    // instead we wait, parse, assemble, then stream the assembled letter.
    const resp = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system: buildCachedSystem(cachedReference, 'Produce only the JSON envelope as instructed.'),
      messages: [{ role: 'user', content: user }],
    });
    const raw = resp.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const parts = parseFenced(raw);
    if (!parts) {
      return new Response(
        `Model did not return a parsable JSON envelope. Raw output:\n\n${raw}`,
        { status: 502 },
      );
    }
    const assembled = assembleLetter({
      setup: body.setup,
      votes: body.votes || [],
      parts,
    });

    // Stream the assembled letter so the UI sees a streaming experience
    // even though the model call is non-streaming. The total payload is
    // small (a few KB).
    const stream = new ReadableStream({
      async start(controller) {
        // Emit the model JSON in a leading sentinel so the client can
        // stash it. The client splits on the sentinel.
        controller.enqueue(encoder.encode(`<<<MODEL_JSON>>>${JSON.stringify(parts)}<<<END_MODEL_JSON>>>`));
        const chunks = assembled.match(/.{1,80}/gs) || [assembled];
        for (const c of chunks) {
          controller.enqueue(encoder.encode(c));
          await new Promise((r) => setTimeout(r, 4));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
    });
  } catch (e) {
    return new Response(
      e instanceof Error ? e.message : 'Draft phase failed.',
      { status: 500 },
    );
  }
}
