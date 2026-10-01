export default function AnimatedText({ children, className = "", speed = 10 }) {
  return (
    <span className={className}>
      {String(children)
        .split("")
        .map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="char-reveal"
            style={{
              animationDelay: `${index * speed}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
    </span>
  );
}
