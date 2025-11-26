import { supabase } from '../utils/supabaseClient';

export const fetchParticipants = async () => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
};

export const addParticipant = async (name, surname, cost) => {
  const { data, error } = await supabase
    .from('participants')
    .insert([{ name, surname, cost }]);

  if (error) throw error;
  return data;
};
