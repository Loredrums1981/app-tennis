import { useEffect, useState } from 'react';
import { fetchParticipants } from '../services/participants';
//import { fetchLessons, fetchLessonParticipants } from '../services/lessons';

//import { useEffect, useState } from 'react';
//import { fetchParticipants } from '../services/participants';
import { fetchLessons, fetchLessonParticipantsRaw } from '../services/lessons';


export default function Partecipanti() {
  const [participants, setParticipants] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const p = await fetchParticipants();
    const l = await fetchLessons();
    setParticipants(p);
    setLessons(l);

    const s = await Promise.all(p.map(async (part) => {
      let count = 0;
      for (let lesson of l) {
        const lp = await fetchLessonParticipantsRaw(lesson.id);
        if (lp.find(x=>x.participant_id===part.id)) count++;
      }
      return { ...part, lezioni_fatte: count, lezioni_rimanenti: (l.length-count), costo_a_lezione: part.cost / (count||1) };
    }));
    setStats(s);
  };

  return (
    <div>
      <h1>Statistiche Partecipanti</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Nome</th><th>Cognome</th><th>Lezioni Fatto</th><th>Lezioni Rimanenti</th><th>Costo a Lezione</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.surname}</td>
              <td>{s.lezioni_fatte}</td>
              <td>{s.lezioni_rimanenti}</td>
              <td>{s.costo_a_lezione.toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
