import AcademicCalendarClient from './AcademicCalendarClient';

export const metadata = {
  title: 'Academic Calendar Chatbot | Mays Method Lab',
  description:
    'Ask about a date on the TAMU academic calendar. Registration windows, drop deadlines, finals, breaks, and commencement, grounded in the registrar.',
};

export default function AcademicCalendarPage() {
  return (
    <section className="section">
      <AcademicCalendarClient />
    </section>
  );
}
