import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCourseInfo } from '../services/courses';
import { fetchParticipants } from '../services/participants';
import { fetchLessonsWithStatus } from '../services/lessons';

export default function Lezioni() {
  const { user, loading } = useAuth();
  const [course, setCourse] = useState({});
  const [participants, setParticipants] = useState([]);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const c = await fetchCourseInfo();
    setCourse(c || {});

    const p = await fetchParticipants();
    setParticipants(p || []);

    const l = await fetchLessonsWithStatus();
    setLessons(l || []);
  };

  const countLessonsDone = (participantId) =>
    lessons.filter(l => l.isDone && l.participants.some(p => p.id === participantId)).length;

  const countLessonsRemaining = (participantId) =>
    lessons.filter(l => !l.isDone && l.participants.some(p => p.id === participantId)).length;

  const totalScheduledLessons = (participantId) =>
    lessons.filter(l => l.participants.some(p => p.id === participantId)).length;

  const pricePerActualLesson = (participant) => {
    const total = totalScheduledLessons(participant.id);
    return total > 0 ? (participant.cost / total).toFixed(2) : '0.00';
  };

  const pricePerTheoreticalLesson = (participant) => {
    const totalLessonsCourse = course.numero_lezioni && Number(course.numero_lezioni) > 0
      ? Number(course.numero_lezioni)
      : 24;
    return (participant.cost / totalLessonsCourse).toFixed(2);
  };

  const getNextLesson = (participantId) => {
    const future = lessons
      .filter(l => !l.isDone && l.participants.some(p => p.id === participantId))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return future.length > 0 ? future[0] : null;
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    const nextA = getNextLesson(a.id);
    const nextB = getNextLesson(b.id);
    if (!nextA && !nextB) return 0;
    if (!nextA) return 1;
    if (!nextB) return -1;
    return new Date(nextA.date) - new Date(nextB.date);
  });

  const getProgressPercent = (participantId) => {
    const done = countLessonsDone(participantId);
    const future = countLessonsRemaining(participantId);
    const total = done + future;
    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  };

  if (loading) return <p className="p-6">⏳ Caricamento...</p>;
  if (!user) return <p className="p-6 text-red-600">⚠️ Devi essere loggato per accedere a questa pagina.</p>;

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">Lezioni del Corso: {course.nome_corso || '—'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedParticipants.map(p => {
          const fatteSingolo = lessons.filter(l => l.isDone && l.participants.length === 1 && l.participants.some(pp => pp.id === p.id)).length;
          const fatteDoppio = lessons.filter(l => l.isDone && l.participants.length === 2 && l.participants.some(pp => pp.id === p.id)).length;
          const fatteTre = lessons.filter(l => l.isDone && l.participants.length >= 3 && l.participants.some(pp => pp.id === p.id)).length;

          const futureSingolo = lessons.filter(l => !l.isDone && l.participants.length === 1 && l.participants.some(pp => pp.id === p.id)).length;
          const futureDoppio = lessons.filter(l => !l.isDone && l.participants.length === 2 && l.participants.some(pp => pp.id === p.id)).length;
          const futureTre = lessons.filter(l => !l.isDone && l.participants.length >= 3 && l.participants.some(pp => pp.id === p.id)).length;

          const totaleFatte = fatteSingolo + fatteDoppio + fatteTre;
          const totaleFuture = futureSingolo + futureDoppio + futureTre;
          const totaleProgrammate = totaleFatte + totaleFuture;

          const next = getNextLesson(p.id);
          const nextCount = next ? next.participants.length : 0;
          const typeLabel = next
            ? (nextCount === 1 ? '🎾 Lezione Singola' : nextCount === 2 ? '👥 Lezione di Coppia' : '👨‍👩‍👧 Lezione Multipla')
            : null;

          const typeColorClass = next
            ? (nextCount === 1 ? 'bg-green-50 border-green-200 text-green-800' : nextCount === 2 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-purple-50 border-purple-200 text-purple-800')
            : 'bg-gray-50 border-gray-200 text-gray-600';

          const daysRemaining = next
            ? Math.max(0, Math.ceil((new Date(next.date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))
            : null;

          const progressPercent = getProgressPercent(p.id);
          const progressColor = progressPercent > 70 ? 'bg-green-500' : progressPercent > 30 ? 'bg-yellow-400' : 'bg-red-500';

          return (
            <div key={p.id} className="p-5 bg-white shadow rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold">{p.name} {p.surname}</h2>

              {next ? (
                <div className={`mt-3 mb-4 p-3 rounded border ${typeColorClass}`}>
                  <p className="font-medium">Prossima lezione:</p>
                  <p className="text-sm">📅 {next.date} — 🕒 {next.start_time || '10:00'}</p>
                  <p className="text-sm">{typeLabel}</p>
                  <p className="text-sm mt-1 opacity-80">⏳ Mancano {daysRemaining} giorni</p>
                </div>
              ) : (
                <p className="text-gray-400 mb-4">Nessuna lezione programmata</p>
              )}

              <div className="mb-2">
                <p className="text-sm text-gray-700 mb-1">Progresso lezioni: {progressPercent}%</p>
                <div className="w-full bg-gray-200 h-3 rounded">
                  <div className={`${progressColor} h-3 rounded`} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Lezioni fatte: <strong>{totaleFatte}</strong> / <strong>{totaleProgrammate}</strong> totali programmate
              </p>

              <div className="text-sm mb-4">
                <p className="font-medium">Lezioni Fatte:</p>
                <ul className="ml-5 list-disc text-gray-700">
                  <li>🎾 Lezioni Singole: {fatteSingolo}</li>
                  <li>👥 Lezioni di Coppia: {fatteDoppio}</li>
                  <li>👨‍👩‍👧 Lezioni Multiple: {fatteTre}</li>
                </ul>

                <p className="font-medium mt-3">Lezioni Programmate:</p>
                <ul className="ml-5 list-disc text-gray-700">
                  <li>🎾 Lezioni Singole: {futureSingolo}</li>
                  <li>👥 Lezioni di Coppia: {futureDoppio}</li>
                  <li>👨‍👩‍👧 Lezioni Multiple: {futureTre}</li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-700">
                  Prezzo medio per lezione: <strong>{pricePerActualLesson(p)} €</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Prezzo teorico per lezione: <strong>{pricePerTheoreticalLesson(p)} €</strong>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
