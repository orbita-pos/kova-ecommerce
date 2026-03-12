import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black" style={{ padding: "0 clamp(24px, 5vw, 80px)", background: "#000" }}>
      <span className="font-[family-name:var(--font-display)] text-[clamp(6rem,15vw,12rem)] italic leading-none tracking-tight text-white/[0.06]">
        404
      </span>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] italic tracking-tight text-[#f0ede6]">
        Page not found
      </h1>
      <p className="mt-4 font-[family-name:var(--font-body)] text-base text-white/50">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-10 font-[family-name:var(--font-body)] border border-[#c8ff00] px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-[#c8ff00] transition-all duration-300 hover:bg-[#c8ff00] hover:text-black"
      >
        Back to home
      </Link>
    </main>
  );
}
