// Button hover effect: the label slides up and out, and a copy slides in from
// below. Put `group/roll` on the button / link that should trigger it:
//
//   <a className="group/roll ..."><RollText>Join Now</RollText></a>
//
export default function RollText({ children, className = "" }) {
  return (
    <span
      className={`relative -mb-[0.12em] inline-block overflow-hidden whitespace-nowrap pb-[0.12em] align-bottom leading-[1.3] ${className}`}
    >
      <span className="block transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover/roll:-translate-y-[120%] group-focus-visible/roll:-translate-y-[120%] motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 block translate-y-[120%] transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover/roll:translate-y-0 group-focus-visible/roll:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}
