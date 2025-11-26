// src/services/lessons.js
import { supabase } from '../utils/supabaseClient';

/** Fetch tutte le lezioni con partecipanti e orario */
export async function fetchLessons() {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id,
      date,
      start_time,
      lessons_participants (
        participant_id,
        participants (id, name, surname)
      )
    `)
    .order('date', { ascending: true });

  if (error) throw error;

  return (data || []).map(lesson => ({
    id: lesson.id,
    date: lesson.date,
    start_time: lesson.start_time || '10:00',
    participants: (lesson.lessons_participants || []).map(lp => ({
      id: lp.participant_id,
      name: lp.participants?.name || '',
      surname: lp.participants?.surname || ''
    }))
  }));
}

/** Fetch lezioni con stato "fatta" o futura */
export async function fetchLessonsWithStatus() {
  const lessons = await fetchLessons();
  const today = new Date().toISOString().split("T")[0];

  return lessons.map(l => ({
    ...l,
    isDone: l.date < today
  }));
}

/** Aggiunge una lezione con partecipanti opzionali */
export async function addLesson(date, start_time = '10:00', participantIds = []) {
  const { data: inserted, error } = await supabase
    .from('lessons')
    .insert([{ date, start_time }])
    .select()
    .single();

  if (error) throw error;

  if (participantIds.length > 0) {
    const bulk = participantIds.map(pid => ({ lesson_id: inserted.id, participant_id: pid }));
    const { error: err2 } = await supabase.from('lessons_participants').insert(bulk);
    if (err2) throw err2;
  }

  return inserted;
}

/** Aggiorna una lezione */
export async function updateLesson(id, { date, start_time }) {
  const { data, error } = await supabase
    .from('lessons')
    .update({ date, start_time })
    .eq('id', id);

  if (error) throw error;
  return data;
}

/** Elimina lezione + partecipanti */
export async function deleteLesson(lessonId) {
  await supabase.from('lessons_participants').delete().eq('lesson_id', lessonId);
  const { data, error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;
  return data;
}

/** Gestione partecipanti */
export async function addParticipantToLesson(lessonId, participantId) {
  const { data, error } = await supabase
    .from('lessons_participants')
    .insert([{ lesson_id: lessonId, participant_id: participantId }]);
  if (error) throw error;
  return data;
}

export async function removeParticipantFromLesson(lessonId, participantId) {
  const { data, error } = await supabase
    .from('lessons_participants')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('participant_id', participantId);
  if (error) throw error;
  return data;
}
