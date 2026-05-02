import type { MRCMember, MRCVote, VoteTally } from './types';

/**
 * FY27 Mays Research Council composition. Five voting members (one per
 * academic department) plus Rogelio Oliva in the non-voting chair role.
 *
 * Per the Boivie example, Rogelio appears twice in the MRC composition
 * table — once as the INFO voting member, once as the non-voting Chair /
 * Associate Dean for Research.
 *
 * This is the source of truth for both the vote-collection UI and the
 * MRC composition table in the .docx.
 */
export const FY27_MRC: MRCMember[] = [
  {
    id: 'ahmed',
    name: 'Anwer Ahmed',
    administrativeAppointment: 'None',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: 'ACCT',
    typeOfMember: 'Member',
    votingRights: 'Yes',
  },
  {
    id: 'johnson',
    name: 'Shane Johnson',
    administrativeAppointment: 'None',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: 'FINC',
    typeOfMember: 'Member',
    votingRights: 'Yes',
  },
  {
    id: 'oliva-info',
    name: 'Rogelio Oliva',
    administrativeAppointment: 'None',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: 'INFO',
    typeOfMember: 'Member',
    votingRights: 'Yes',
  },
  {
    id: 'jones',
    name: 'Eli Jones',
    administrativeAppointment: 'None',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: 'MKTG',
    typeOfMember: 'Member',
    votingRights: 'Yes',
  },
  {
    id: 'boswell',
    name: 'Wendy Boswell',
    administrativeAppointment: 'None',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: 'MGMT',
    typeOfMember: 'Member',
    votingRights: 'Yes',
  },
  {
    id: 'oliva-chair',
    name: 'Rogelio Oliva',
    administrativeAppointment: 'Associate Dean for Research and Scholarship',
    rank: 'Professor',
    endowedPosition: 'Chair',
    department: "Dean's Office",
    typeOfMember: 'Chair',
    votingRights: 'No',
  },
];

/** Voting members only — used in the vote-collection UI and the signature block. */
export const VOTING_MEMBERS = FY27_MRC.filter((m) => m.votingRights === 'Yes');

export function getMember(id: string): MRCMember | undefined {
  return FY27_MRC.find((m) => m.id === id);
}

/** Compute the {chair, professorship, no-position} tally from a vote list. */
export function tallyVotes(votes: MRCVote[]): VoteTally {
  return votes.reduce<VoteTally>(
    (acc, v) => {
      if (v.choice === 'chair') acc.chair += 1;
      else if (v.choice === 'professorship') acc.professorship += 1;
      else if (v.choice === 'no-position') acc.noPosition += 1;
      return acc;
    },
    { chair: 0, professorship: 0, noPosition: 0 },
  );
}

export function describeTally(t: VoteTally): string {
  const total = t.chair + t.professorship + t.noPosition;
  if (total === 0) return 'no votes recorded';
  if (t.chair === total) return 'unanimously';
  if (t.professorship === total) return 'unanimously';
  if (t.noPosition === total) return 'unanimously';
  // Mixed → "by a vote of X to Y" or X-Y-Z
  return `by a vote of ${t.chair}-${t.professorship}-${t.noPosition} (Chair-Professorship-No position)`;
}
