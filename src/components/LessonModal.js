import { useState } from "react";

export default function LessonModal({
  lesson,
  allParticipants,
  onClose,
  onSave,
  onDelete,
  onAddParticipant,
  onRemoveParticipant
}) {
  const [date, setDate] = useState(lesson.date);
  const [startTime, setStartTime] = useState(lesson.start_time || "10:00");

  const participantsInLesson = lesson.participants.map(p => p.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-[1001]">
        <h2 className="text-xl font-semibold mb-4">Lezione {lesson.id}</h2>

        <div className="mb-3">
          <label className="block mb-1">Data:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Ora inizio:</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-2">Partecipanti:</label>
          <ul className="mb-2">
            {lesson.participants.map(p => (
              <li key={p.id} className="flex justify-between items-center mb-1">
                {p.name} {p.surname} 
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => onRemoveParticipant(lesson.id, p.id)}
                >
                  Rimuovi
                </button>
              </li>
            ))}
          </ul>

          <select
            onChange={e => {
              const pid = parseInt(e.target.value);
              if(pid) onAddParticipant(lesson.id, pid);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">Aggiungi partecipante</option>
            {allParticipants
              .filter(p => !participantsInLesson.includes(p.id))
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.surname}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-gray-500 text-white px-3 py-1 rounded" onClick={onClose}>Chiudi</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => onDelete(lesson.id)}>Elimina</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => onSave({ ...lesson, date, start_time: startTime })}>Salva</button>
        </div>
      </div>
    </div>
  );
}
