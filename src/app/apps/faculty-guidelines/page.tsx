import FacultyGuidelinesClient from './FacultyGuidelinesClient';

export const metadata = {
  title: 'Mays Faculty Guidelines Chatbot | Mays Method Lab',
  description:
    'Ask any question about the October 2025 Mays Faculty Guidelines. The chatbot quotes the exact passage that answers it.',
};

/**
 * Faculty Guidelines Chatbot. Direct-URL only for now (not surfaced on the
 * staff or faculty Apps cards). The bot is gated by the standard Apps
 * layout (mml_session). A kill switch env var lets Hari pause the service
 * without a redeploy.
 */
export default function FacultyGuidelinesPage() {
  const enabled =
    (process.env.FACULTY_GUIDELINES_BOT_ENABLED || '').toLowerCase() !== 'false';
  return (
    <section className="section">
      <FacultyGuidelinesClient enabled={enabled} />
    </section>
  );
}
