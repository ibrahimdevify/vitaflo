export const PageFallback = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
    </div>
  );
};
