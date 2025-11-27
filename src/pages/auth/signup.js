import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    alert('Registrazione completata! Ora puoi fare login.');
    router.push('/auth/login');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Registrati</button>
      </form>

      <p>
        Hai già un account? <a href="/auth/login">Accedi</a>
      </p>
    </div>
  );
}
