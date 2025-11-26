import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchLessons } from "@/services/lessons";
import { fetchParticipants } from "@/services/participants";

export default function LessonCalendar() {
  const [lessons, setLessons] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const lessonData = await fetchLessons();
        const participantData = await fetchParticipants();

        setLessons(lessonData);
        setParticipants(participantData);
      } catch (err) {
        console.error("Errore caricamento calendario:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Caricamento calendario...</p>;
  if (!lessons || lessons.length === 0)
    return <p>Nessuna lezione programmata.</p>;

  // 🎨 Colori per lezioni future / passate
  const now = new Date();

  const events = lessons.map((lesson) => {
    const lessonParticipants = participants.filter((p) =>
      p.lessons?.includes(lesson.id)
    );

    const names =
      lessonParticipants.length > 0
        ? lessonParticipants.map((p) => p.name).join(", ")
        : "Nessun partecipante";

    const isPast = new Date(lesson.date) < now;

    return {
      id: lesson.id,
      title: `${lesson.title}`,
      start: lesson.date,
      extendedProps: {
        partecipanti: names,
      },
      backgroundColor: isPast ? "#999" : "#1e90ff",
      borderColor: isPast ? "#777" : "#1e90ff",
      textColor: "white",
    };
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendario Lezioni</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        editable={true}           // drag & drop
        droppable={true}
        eventResizableFromStart={true}
        events={events}
        displayEventTime={false}
        eventClick={(info) => setSelectedLesson(info.event)}
        eventDidMount={(info) => {
          // Tooltip sui partecipanti
          info.el.setAttribute("title", info.event.extendedProps.partecipanti);
        }}
      />

      {/* MODAL DETTAGLI LEZIONE */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-2">
              {selectedLesson.title}
            </h3>

            <p className="mb-2">
              <strong>Data:</strong> {selectedLesson.start.toLocaleString()}
            </p>

            <p className="mb-4">
              <strong>Partecipanti:</strong>{" "}
              {selectedLesson.extendedProps.partecipanti}
            </p>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setSelectedLesson(null)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
