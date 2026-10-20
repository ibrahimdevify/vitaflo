export default function GridBackdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="page-grid pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="page-dots pointer-events-none absolute inset-0"
      />
    </>
  );
}
