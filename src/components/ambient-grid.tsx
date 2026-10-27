/** Static site-wide grid backdrop. */
export function AmbientGrid() {
  return (
    <div
      aria-hidden
      className="ambient-grid pointer-events-none fixed inset-0 -z-10"
    />
  );
}
