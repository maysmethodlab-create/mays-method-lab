import { promises as fs } from 'fs';
import path from 'path';
import { describeTally, tallyVotes } from './mrc';
import type { MRCVote, SetupData } from './types';

let _boivieCache: string | null = null;

async function loadBoivieExample(): Promise<string> {
  if (_boivieCache) return _boivieCache;
  try {
    const p = path.join(
      process.cwd(),
      'apps',
      'Endowed Positions Letter Writer',
      'Boivie-Example-2025.txt',
    );
    _boivieCache = await fs.readFile(p, 'utf8');
    return _boivieCache;
  } catch {
    return '(Boivie example not available; relying on the structural description below.)';
  }
}

export type DraftPromptArgs = {
  setup: SetupData;
  votes: MRCVote[];
  /** Concatenated text of all uploaded source documents (dept-head letter, CV). */
  sourceDocuments: string;
};

export async function draftPrompt(args: DraftPromptArgs) {
  const boivie = await loadBoivieExample();
  const tally = tallyVotes(args.votes);
  const tallyDescription = describeTally(tally);

  const action = (() => {
    switch (args.setup.nominationType) {
      case 'new-chair':
      case 'new-professorship':
        return 'appoint';
      case 'reappoint-chair':
      case 'reappoint-professorship':
        return 'reappoint';
      case 'fellowship':
        return 'nominate';
    }
  })();

  const positionTypeForSubject = (() => {
    switch (args.setup.nominationType) {
      case 'new-chair':
      case 'reappoint-chair':
        return 'endowed Chair';
      case 'new-professorship':
      case 'reappoint-professorship':
        return 'endowed Professorship';
      case 'fellowship':
        return 'Fellowship';
    }
  })();

  const cachedReference = `You are the writing agent for the Mays Endowed Positions Committee Recommendation Memorandum (Stage 2: from Rogelio Oliva, Chair of the Mays Research Council, to Dean Nate Sharp).

Your job is NARROW: produce four short fields of variable content. The institutional boilerplate (Post-Tenure Review paragraph, Review Process paragraphs, MRC composition table prose, secret-ballot paragraph, signature-block intro) is stitched in by the assembler — do NOT regenerate any of it.

Reference: the FY25 Boivie reappointment memorandum, copied below verbatim. This is the structural template you must mirror.

============ BOIVIE EXAMPLE ============
${boivie}
============ END BOIVIE EXAMPLE ============

VOTE MODEL: Each MRC voting member casts a single ballot — Yes, No, or Abstain — on whether the Council concurs with the department head's recommendation.
- "Yes" = the member concurs with the department head's recommendation.
- "No" = the member rejects the department head's recommendation.
- "Abstain" = the member is recused.
The Council is described as voting "unanimously" only if every voter voted Yes. Otherwise, report the explicit Yes-No-Abstain count.

OUTPUT FORMAT — return ONLY a fenced JSON code block, like:

\`\`\`json
{
  "subjectLine": "Recommendation to ...",
  "openingSentence": "This memorandum includes our recommendation ...",
  "summaryReasonsClause": "his sustained record of high-impact publications, his ...",
  "achievementParagraph": "The members of the Mays Research Council ..."
}
\`\`\`

FIELD-BY-FIELD GUIDANCE:

1. subjectLine — single line, no leading "SUBJECT:". Pattern (from Boivie):
   "Recommendation to {action} Dr. {Full Name}, {Current Title}, as holder of the endowed {Position Name}"
   Use action = "${action}". For fellowships use "Recommendation to nominate Dr. {Name} for the {Position Name}".

2. openingSentence — ONE sentence. Pattern from Boivie:
   "This memorandum includes our recommendation for Dr. {Name} to be {action}ed to the {Position Name} for a {N} ({N}) year term."
   Use action = "${action}", term length spelled out (e.g. "five (5) year term").

3. summaryReasonsClause — a phrase fragment (NOT a full sentence). It will be inserted after the word "citing" in this template:
   "The Mays Research Council [unanimously supported / by a vote of Y-N-A supported] the {action} of Dr. {Name} to the {Position} for a {N} ({N}) year term, citing {YOUR CLAUSE}."
   The clause should list 2-3 SPECIFIC reasons drawn from the dept head's letter — not generic praise. Example from Boivie: "his exceptional research productivity, leadership in the field of corporate governance, and sustained scholarly impact as one of the most published scholars in top-tier journals". Do NOT include a trailing period; the assembler adds one.

4. achievementParagraph — 150-250 words. Single paragraph. Pattern from Boivie:
   "The members of the Mays Research Council {tally-language} concurred with the department head's recommendation for Dr. {Name}, citing {2-3 broader reasons}. {Sentences with SPECIFIC numbers — publication count, top journals named, citation totals, awards}. Dr. {Name}'s record firmly establishes him/her as {summary} and an outstanding choice for {action} to the {Position Name}."

   - Open with "The members of the Mays Research Council ${tallyDescription === 'unanimously' ? 'unanimously' : ''} concurred with the department head's recommendation"
   - Cite specific publication counts, journal names (use abbreviations Boivie uses — AMJ, ASQ, SMJ, JF, JFE, RFS, JM, MS, MISQ, ISR, POM, etc.), citation totals, and awards when these appear in the source documents.
   - Match Boivie's tone: formal, factual, no flowery language, no em-dashes.
   - End with a sentence affirming the recommendation.

CONSTRAINTS:
- NEVER invent specific numbers. If the dept-head letter gives no publication count, omit the number — do not fabricate it.
- NEVER use em-dashes (—) or en-dashes (–) — use a hyphen, comma, or restructure.
- NEVER use the words "delve", "leverage", "transformative", "utilize", "robust", "navigate" (verb), "tapestry", "landscape" (figurative), "pivotal", "showcases", "unprecedented".
- Keep all four fields aligned with the Boivie structural template above.`;

  const action_label = action;
  const position_label = positionTypeForSubject;

  const user = `CANDIDATE PROFILE
- Name: Dr. ${args.setup.candidateName}
- Current Title: ${args.setup.candidateCurrentTitle}
- Department: ${args.setup.candidateDepartment}
- Department Head: ${args.setup.candidateDepartmentHead}
- Recommended endowed position: ${args.setup.recommendedPositionName} (${position_label})
- Term: ${args.setup.termYears} years
- Action requested: ${action_label}

MRC VOTE TALLY (Yes/No/Abstain on the department head's recommendation)
- Yes (concur with dept head): ${tally.yes}
- No (reject dept head): ${tally.no}
- Abstain (recused): ${tally.abstain}
- Description: ${tallyDescription}

SOURCE DOCUMENTS (dept-head letter and CV — concatenated):

${args.sourceDocuments || '(No source documents provided.)'}

Now produce the JSON envelope with the four fields described in the system prompt.`;

  return { cachedReference, user };
}
