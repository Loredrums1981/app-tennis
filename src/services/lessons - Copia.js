// src/services/lessons.js
import { supabase } from '../utils/supabaseClient';

/**
 * Restituisce tutte le lezioni con partecipanti (nome/cognome)
 * Output: [{ id, date, start_time, participants: [...] }]
 */
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
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  return (data || []).map(lesson => ({
    id: lesson.id,
    date: lesson.date,
    start_time: lesson.start_time,
    participants: (lesson.lessons_participants || []).map(lp => ({
      id: lp.participant_id,
      name: lp.participants?.name || '',
      surname: lp.participants?.surname || ''
    }))
  }));
}

/**
 * Restituisce tutte le lezioni con lo stato "isDone" (date <= oggi)
 * Output: [{ id, date, start_time, participants, isDone }]
 */
export async function fetchLessonsWithStatus() {
  const lessons = await fetchLessons();
  const today = new Date().toISOString().split("T")[0];

  return lessons.map(l => ({
    ...l,
    isDone: l.date <= today
  }));
}

/**
 * Versione RAW: utile per calcoli nella pagina "lezioni"
 * Output: [{ lesson_id, participant_id }]
 */
export async function fetchLessonParticipantsRaw() {
  const { data, error } = await supabase
    .from('lessons_participants')
    .select('lesson_id, participant_id');

  if (error) throw error;
  return data || [];
}

/** Aggiunge lezione con data + start_time + partecipanti opzionali */
export async function addLesson(date, start_time, participantIds = []) {
  const { data: inserted, error } = await supabase
    .from('lessons')
    .insert([{ date, start_time }])
    .select()
    .single();

  if (error) throw error;

  if (Array.isArray(participantIds) && participantIds.length > 0) {
    const bulk = participantIds.map(pid => ({
      lesson_id: inserted.id,
      participant_id: pid
    }));
    const { error: err2 } = await supabase
      .from('lessons_participants')
      .insert(bulk);
    if (err2) throw err2;
  }

  return inserted;
}

/** Elimina lezione + partecipanti associati */
export async function deleteLesson(lessonId) {
  await supabase
    .from('lessons_participants')
    .delete()
    .eq('lesson_id', lessonId);

  const { data, error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
  return data;
}

/** Aggiunge partecipante a una lezione */
export async function addParticipantToLesson(lessonId, participantId) {
  const { data, error } = await supabase
    .from('lessons_participants')
    .insert([{ lesson_id: lessonId, participant_id: participantId }]);

  if (error) throw error;
  return data;
}

/** Rimuove partecipante da una lezione */
export async function removeParticipantFromLesson(lessonId, participantId) {
  const { data, error } = await supabase
    .from('lessons_participants')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('participant_id', participantId);

  if (error) throw error;
  return data;
}

/** Restituisce solo le lezioni <= oggi */
export async function fetchPastLessons() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from('lessons')
    .select('id, date, start_time')
    .lte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

// in src/services/lessons.js
export async function updateLesson(lessonId, payload) {
  const { data, error } = await supabase
    .from('lessons')
    .update(payload)
    .eq('id', lessonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

