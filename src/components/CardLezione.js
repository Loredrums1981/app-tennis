export default function CardLezione({ lesson }) {
  return (
    <div className="card">
      <h3>{lesson.date}</h3>
      <p>Partecipanti: {lesson.lessons_participants.map(lp => lp.participants.name).join(', ') || 'Nessuno'}</p>
    </div>
  );
}
