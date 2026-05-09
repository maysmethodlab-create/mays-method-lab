/**
 * /learning-community is now a redirect-only route — see page.tsx. The
 * previous TAMU-member auth gate has been removed because the redirect
 * to /resources should fire for any visitor (bookmarks, old links)
 * without forcing them through login first.
 */
export default function LearningCommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
