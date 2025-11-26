import Link from 'next/link';

export default function Menu() {
  return (
    <nav style={{
      display: "flex",
      gap: "20px",
      padding: "15px",
      background: "#f3f3f3",
      borderBottom: "1px solid #ddd"
    }}>
      <Link href="/">Corso</Link>
      <Link href="/lezioni">Stato Lezioni</Link>
      <Link href="/calendario">Calendario</Link>
    </nav>
  );
}

