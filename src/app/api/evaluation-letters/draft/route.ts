import {
  DEFAULT_MODEL,
  getClient,
  isApiKeyConfigured,
  buildCachedSystem,
} from '@/lib/evaluation-letters/claude';
import { writingPrompt } from '@/lib/evaluation-letters/prompts';
import {
  loadLetterSkill,
  loadPeerComments,
  loadStyleBundle,
} from '@/lib/evaluation-letters/letter-skills';
import { getRoleCategory } from '@/lib/evaluation-letters/role-categories';
import { fromBlockLines, getWriter } from '@/lib/evaluation-letters/writers';
import { placeholderNotice, requireAuth } from '@/lib/evaluation-letters/api-helpers';

export const runtime = 'nodejs';
export const maxDuration = 180;

type Body = {
  setup: {
    writerId: string;
    evaluationYear: number;
    recipientName: string;
    recipientTitle: string;
    recipientDepartment: string;
    roleCategoryId: string;
  };
  researchBrief: string;
  writerNotes: string;
};

function firstNameOf(full: string): string {
  return full.split(/\s+/)[0]?.replace(/[^A-Za-z'-]/g, '') || full;
}

export async function POST(req: Request) {
  const guard = requireAuth(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.setup || !body?.researchBrief) {
    return new Response('setup and researchBrief are required', { status: 400 });
  }

  const writer = getWriter(body.setup.writerId);
  if (!writer) {
    return new Response('Unknown writer.', { status: 400 });
  }
  const role = getRoleCategory(body.setup.roleCategoryId);
  if (!role) {
    return new Response('Unknown role category.', { status: 400 });
  }

  const hasResearch = role.required.includes('research');
  const [skill, styleBundle, peerComments] = await Promise.all([
    loadLetterSkill(role.letterSkill).catch(() => null),
    loadStyleBundle().catch(() => ''),
    loadPeerComments().catch(() => ''),
  ]);
  if (!skill) {
    return new Response('Failed to load letter skill.', { status: 500 });
  }

  const writerFromLines = fromBlockLines(writer);

  const args = {
    writerName: writer.name,
    writerTitle: writer.title,
    writerFirstName: writer.firstName,
    writerFromLines,
    recipientName: body.setup.recipientName,
    recipientFirstName: firstNameOf(body.setup.recipientName),
    recipientTitle: body.setup.recipientTitle,
    recipientDepartment: body.setup.recipientDepartment,
    evaluationYear: body.setup.evaluationYear,
    roleCategory: role.label,
    letterSkill: skill.primary,
    patternsAnalysis: skill.patternsAnalysis,
    styleBundle,
    peerComments,
    hasResearchEvaluation: hasResearch,
    researchBrief: body.researchBrief,
    writerNotes: body.writerNotes || '',
  };

  const { cachedReference, role: instruction, user } = writingPrompt(args);

  const encoder = new TextEncoder();

  if (!isApiKeyConfigured()) {
    const fromLines = writerFromLines.map((l, i) => (i === 0 ? l : `        ${l}`)).join('\n');
    const placeholderLetter = `${placeholderNotice('Draft')}
May ${args.evaluationYear + 1}

MEMORANDUM

TO:     ${args.recipientName}
        ${args.recipientTitle}
FROM:   ${fromLines}
SUBJECT: ${args.evaluationYear} Performance Evaluation

Dear ${args.recipientFirstName},

Thank you for your Professional Activity Report covering January 1 to December 31, ${args.evaluationYear}, and for the conversation we had at our annual review meeting. This letter follows up on that discussion.

**Summary of Major Accomplishments**

(With a real ANTHROPIC_API_KEY, Claude would draft 4-6 paragraphs of flowing narrative here, citing specific publications, courses, and service contributions from the research brief.)

**My Observations and Our Discussion**

(Personal observations drawn from your notes would appear here.)

**Your Plan for the Upcoming Year**

- (Goals from the self-evaluation and your notes would be listed.)
`;

    const stream = new ReadableStream({
      async start(controller) {
        const chunks = placeholderLetter.match(/.{1,40}/gs) || [placeholderLetter];
        for (const c of chunks) {
          controller.enqueue(encoder.encode(c));
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
    });
  }

  try {
    const client = getClient();
    const stream = await client.messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: 4000,
      system: buildCachedSystem(cachedReference, instruction),
      messages: [{ role: 'user', content: user }],
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          controller.enqueue(
            encoder.encode(
              `\n\n[Streaming error: ${e instanceof Error ? e.message : 'unknown'}]`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
    });
  } catch (e) {
    return new Response(
      e instanceof Error ? e.message : 'Draft phase failed.',
      { status: 500 },
    );
  }
}
