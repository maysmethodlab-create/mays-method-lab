import { redirect } from 'next/navigation';

/**
 * /learning-community has been folded into /resources. This file kept as a
 * redirect so any saved bookmark or external link still lands on the right
 * page. The rich client and its data registry now live behind /resources.
 */
export default function LearningCommunityRedirect(): never {
  redirect('/resources');
}
