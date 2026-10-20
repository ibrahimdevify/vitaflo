export default function Container({ children, className = "" }) {
  return <div className={`px-6 lg:px-[12%] ${className}`}>{children}</div>;
}
