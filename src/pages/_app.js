import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-20">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
