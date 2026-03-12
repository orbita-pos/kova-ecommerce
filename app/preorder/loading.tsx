export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black" style={{ background: "#000" }}>
      <span className="mb-8 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,4rem)] italic tracking-tight text-[#f0ede6] animate-pulse">
        KOVA
      </span>
      <div className="h-px w-48 overflow-hidden rounded-full bg-white/10">
        <div className="loading-bar h-full w-full bg-[#c8ff00]" />
      </div>
      <span className="mt-4 font-[family-name:var(--font-body)] text-xs tracking-[0.3em] text-white/50">
        Preparing checkout...
      </span>
    </div>
  );
}
