// src/components/Navbar.js
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 fixed w-full top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Link principali */}
        <div className="flex space-x-4">
          <Link href="/" className="font-bold">🏠 Home</Link>
          {user && (
            <>
              <Link href="/" className="hover:underline">Corso</Link>
              <Link href="/lezioni" className="hover:underline">Lezioni</Link>
              <Link href="/calendario" className="hover:underline">Calendario</Link>
            </>
          )}
        </div>

        {/* Pulsanti autenticazione */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span>ciao, {user.email}!</span>
              <button
                onClick={logout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
