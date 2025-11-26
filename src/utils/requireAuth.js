import { supabase } from "./supabaseClient";

export const requireAuth = async (context) => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
