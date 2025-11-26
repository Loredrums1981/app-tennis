import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import dynamic from "next/dynamic";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import Menu from "../components/Menu";
import LessonModal from "../components/LessonModal";
import {
  fetchLessons,
  addLesson,
  deleteLesson,
  addParticipantToLesson,
  removeParticipantFromLesson
} from "../services/lessons";
import { fetchParticipants } from "../services/participants";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export default function Calendario() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [rawLessons, setRawLessons] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  const loadAll = async () => {
    const [lessons, participants] = await Promise.all([
      fetchLessons(),
      fetchParticipants()
    ]);
    setRawLessons(lessons || []);
    setAllParticipants(participants || []);
    setEvents(lessons.map(l => ({
      id: String(l.id),
      title: l.participants.map(p => p.name).join(", ") || "Nessun partecipante",
      start: l.start_time ? `${l.date}T${l.start_time}` : `${l.date}T10:00`,
      allDay: false,
      extendedProps: { lesson: l, tooltip: l.participants.map(p => p.name).join(", ") },
      color: l.date < new Date().toISOString().split("T")[0] ? "#94a3b8" : "#1976d2"
    })));
  };

  const handleDateClick = async (arg) => {
    const date = arg.dateStr;
    if (!confirm(`Aggiungere lezione il ${date} alle 10:00?`)) return;
    await addLesson(date, "10:00", []);
    await loadAll();
  };

  const handleEventClick = (arg) => {
    const lessonId = parseInt(arg.event.id);
    const lesson = rawLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    setSelectedLesson(lesson);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLesson(null);
    loadAll();
  };

  const handleEventDidMount = (info) => {
    tippy(info.el, {
      content: info.event.extendedProps.tooltip,
      placement: "top",
      theme: "light",
      delay: [100, 100],
    });
  };

  if (!user) {
    return <p className="p-6 font-sans text-red-600">⚠️ Devi essere loggato per accedere a questa pagina.</p>;
  }

  return (
    <div className="p-4 font-inter">
      <h1 className="text-2xl font-semibold mb-4">Calendario Lezioni</h1>

      <FullCalendar
        plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDidMount={handleEventDidMount}
        height="auto"
        eventDisplay="block"
        displayEventTime={false}
      />

      {showModal && selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          allParticipants={allParticipants}
          onClose={handleCloseModal}
          onAddParticipant={addParticipantToLesson}
          onRemoveParticipant={removeParticipantFromLesson}
          onDelete={deleteLesson}
        />
      )}
    </div>
  );
}
