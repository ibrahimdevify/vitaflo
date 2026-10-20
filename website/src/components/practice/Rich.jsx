// Renders **bold** parts of a string:  "Hello **VitalFlo**"  ->  Hello <strong>VitalFlo</strong>
export default function Rich({ children }) {
  return String(children)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) =>
      i % 2 ? (
        <strong key={i} className="font-semibold">
          {part}
        </strong>
      ) : (
        part
      ),
    );
}
