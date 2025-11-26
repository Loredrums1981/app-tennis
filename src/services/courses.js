import { supabase } from '../utils/supabaseClient';

export async function fetchCourseInfo() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw error;
  return data;
}

export async function updateCourseInfo(updateData) {
  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}
