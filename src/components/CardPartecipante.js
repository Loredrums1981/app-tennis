export default function CardPartecipante({ participant }) {
  return (
    <div className="card">
      <p>{participant.name} {participant.surname} - €{participant.cost}</p>
    </div>
  );
}
