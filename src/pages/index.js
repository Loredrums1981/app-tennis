import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { fetchCourseInfo, updateCourseInfo } from "../services/courses";
import { fetchParticipants, addParticipant } from "../services/participants";
import { fetchLessons } from "../services/lessons";

export default function Index() {
  const { user } = useAuth();
  const [course, setCourse] = useState({});
  const [participants, setParticipants] = useState([]);
  const [nextLesson, setNextLesson] = useState(null);

  const [newName, setNewName] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newCost, setNewCost] = useState("");

  useEffect(() => {
    if (user) {
      loadCourse();
      loadParticipants();
      loadNextLesson();
    }
  }, [user]);

  const loadCourse = async () => {
    const data = await fetchCourseInfo();
    setCourse(data || {});
  };

  const loadParticipants = async () => {
    const data = await fetchParticipants();
    setParticipants(data || []);
  };

  const loadNextLesson = async () => {
    const lessons = await fetchLessons();
    const today = new Date().toISOString().split("T")[0];
    const future = lessons.filter((l) => l.date >= today);
    if (future.length > 0) setNextLesson(future[0]);
  };

  const handleAddParticipant = async () => {
    if (!newName.trim()) return;
    await addParticipant(newName, newSurname, parseFloat(newCost) || 0);
    setNewName("");
    setNewSurname("");
    setNewCost("");
    loadParticipants();
  };

  const handleUpdateCourse = async () => {
    await updateCourseInfo(course);
    loadCourse();
  };

  if (!user) {
    return (
      <p className="p-6 font-sans text-red-600">
        ⚠️ Devi essere loggato per accedere a questa pagina.
      </p>
    );
  }

  const totalPaid = participants.reduce((sum, p) => sum + Number(p.cost), 0);
  const daysUntilNextLesson = nextLesson
    ? Math.max(
        0,
        Math.ceil((new Date(nextLesson.date) - new Date()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className="p-6 md:p-10 font-[Inter] bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold mb-10 text-gray-800 tracking-tight">
        🎾 Dashboard Corso
      </h1>

      {/* --- TOP GRID CARDS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informazioni Corso */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📘 Informazioni Corso</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: "Maestro", value: "maestro" },
              { label: "Tennis Club", value: "club" },
              { label: "Corso", value: "nome_corso" },
              { label: "Numero Lezioni", value: "numero_lezioni" },
              { label: "Costo del Corso", value: "costo" },
            ].map((field) => (
              <div key={field.value} className="flex flex-col">
                <label className="mb-1 text-gray-600 font-medium">{field.label}:</label>
                <input
                  type={field.value === "numero_lezioni" || field.value === "costo" ? "number" : "text"}
                  className="border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
                  placeholder={field.label}
                  value={course[field.value] || ""}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      [field.value]:
                        field.value === "numero_lezioni"
                          ? parseInt(e.target.value)
                          : field.value === "costo"
                          ? parseFloat(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              </div>
            ))}
            <button
              onClick={handleUpdateCourse}
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold mt-2"
            >
              💾 Aggiorna Corso
            </button>
          </div>
        </div>

        {/* Prossima Lezione */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📅 Prossima Lezione</h2>
          {nextLesson ? (
            <div className="text-gray-800">
              <p className="mb-2"><span className="font-semibold">Data:</span> {nextLesson.date}</p>
              <p className="mb-2">
                <span className="font-semibold">Giorni rimanenti:</span>{" "}
                <span className={daysUntilNextLesson <= 3 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                  {daysUntilNextLesson}
                </span>
              </p>
              <p className="font-semibold mt-3 mb-1">Partecipanti:</p>
              <ul className="list-disc pl-5 text-gray-700">
                {nextLesson.participants.length > 0
                  ? nextLesson.participants.map((p) => <li key={p.id}>{p.name} {p.surname}</li>)
                  : <li>Nessun partecipante</li>}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 italic">Nessuna lezione programmata</p>
          )}
        </div>

        {/* Statistiche Corso */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📊 Statistiche Corso</h2>
          <div className="space-y-3 text-gray-800">
            <p>👥 <strong>Iscritti:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{participants.length}</span></p>
            <p>💰 <strong>Totale incassato:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{totalPaid} €</span></p>
            <p>🏷️ <strong>Costo corso:</strong> <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{course.costo || 0} €</span></p>
            <p>🎾 <strong>Lezioni totali:</strong> <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{course.numero_lezioni || 0}</span></p>
            <p>🔜 <strong>Prossima lezione:</strong> {nextLesson ? nextLesson.date : "—"}</p>
          </div>
        </div>
      </div>

      {/* --- SEZIONE ISCRITTI --- */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">👥 Gestione Iscritti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            className="border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-green-400 transition"
            placeholder="Nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-green-400 transition"
            placeholder="Cognome"
            value={newSurname}
            onChange={(e) => setNewSurname(e.target.value)}
          />
          <input
            className="border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-green-400 transition"
            placeholder="Costo pagato"
            type="number"
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddParticipant}
          className="bg-green-600 hover:bg-green-700 transition text-white py-3 px-5 rounded-xl font-semibold w-full md:w-auto"
        >
          ➕ Aggiungi Partecipante
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-5 border rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-lg transition"
            >
              <p className="text-lg font-semibold">{p.name} {p.surname}</p>
              <p className="text-gray-600 mt-1">💰 Ha pagato: <strong>{p.cost} €</strong></p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
