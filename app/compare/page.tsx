"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const BRAND = "KOVA";

/* ─── Models ─── */
const MODELS = [
  {
    id: "lite",
    name: "KOVA Lite",
    tagline: "Essential sound",
    price: 149,
    badge: null,
    accent: "#4ec9b0",
    modelColor: "#607080",
    specs: {
      drivers: "30mm composite",
      frequency: "20Hz – 18kHz",
      impedance: "16Ω",
      anc: "Passive isolation",
      ancLevel: "—",
      battery: "30 hours",
      charging: "USB-C · 10min = 2h",
      weight: "210g",
      bluetooth: "Bluetooth 5.2",
      codecs: "AAC · SBC",
      spatial: false,
      waterResistance: "IPX2",
      colors: 2,
      material: "Polycarbonate",
      foldable: true,
      case: "Soft pouch",
    },
  },
  {
    id: "standard",
    name: "KOVA",
    tagline: "Immersive sound",
    price: 349,
    badge: "Most popular",
    accent: "#c8ff00",
    modelColor: "#1a1a1a",
    specs: {
      drivers: "40mm neodymium",
      frequency: "20Hz – 20kHz",
      impedance: "32Ω",
      anc: "Adaptive ANC",
      ancLevel: "–45dB",
      battery: "50 hours",
      charging: "USB-C · 10min = 3h",
      weight: "280g",
      bluetooth: "Bluetooth 5.3 · 3.5mm",
      codecs: "LDAC · AAC · SBC",
      spatial: true,
      waterResistance: "IPX4",
      colors: 4,
      material: "Anodized aluminum",
      foldable: true,
      case: "Hardshell case",
    },
  },
  {
    id: "ultra",
    name: "KOVA Ultra",
    tagline: "No compromise",
    price: 549,
    badge: null,
    accent: "#d4a0ff",
    modelColor: "#2a1a3a",
    specs: {
      drivers: "50mm planar magnetic",
      frequency: "10Hz – 40kHz",
      impedance: "47Ω",
      anc: "Adaptive ANC Pro",
      ancLevel: "–52dB",
      battery: "60 hours",
      charging: "USB-C + Qi · 5min = 3h",
      weight: "320g",
      bluetooth: "Bluetooth 5.4 · 3.5mm · USB-C DAC",
      codecs: "LDAC · aptX Lossless · AAC · SBC",
      spatial: true,
      waterResistance: "IPX5",
      colors: 6,
      material: "Titanium + ceramic",
      foldable: false,
      case: "Premium leather case",
    },
  },
];

const SPEC_ROWS: { key: keyof (typeof MODELS)[0]["specs"]; label: string }[] = [
  { key: "drivers", label: "Driver size" },
  { key: "frequency", label: "Frequency response" },
  { key: "impedance", label: "Impedance" },
  { key: "anc", label: "Noise cancellation" },
  { key: "ancLevel", label: "ANC reduction" },
  { key: "battery", label: "Battery life" },
  { key: "charging", label: "Charging" },
  { key: "weight", label: "Weight" },
  { key: "bluetooth", label: "Connectivity" },
  { key: "codecs", label: "Codecs" },
  { key: "spatial", label: "Spatial audio" },
  { key: "waterResistance", label: "Water resistance" },
  { key: "colors", label: "Colorways" },
  { key: "material", label: "Build" },
  { key: "foldable", label: "Foldable" },
  { key: "case", label: "Included case" },
];

const HIGHER_IS_BETTER = new Set([
  "drivers", "frequency", "battery", "codecs", "spatial",
  "waterResistance", "colors", "material", "case",
]);

function formatValue(val: string | number | boolean): string {
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
}

/* ─── 3D Headphones for compare ─── */
function CompareHeadphones({
  color,
  isHovered,
}: {
  color: string;
  isHovered: boolean;
}) {
  const { scene } = useGLTF("/model.glb");
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const colorTarget = useRef(new THREE.Color(color));
  const { camera } = useThree();
  const baseRotation = useRef(0);

  useEffect(() => {
    /* Clone scene so each instance is independent */
    const clone = scene.clone(true);
    clonedScene.current = clone;

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    clone.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, maxDim * 2.4);
    camera.lookAt(0, 0, 0);

    /* Collect materials */
    const mats: THREE.MeshStandardMaterial[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          const cloned = mat.clone();
          cloned.color.set(color);
          child.material = cloned;
          mats.push(cloned);
        }
      }
    });
    materialsRef.current = mats;

    if (groupRef.current) {
      /* Clear previous children */
      while (groupRef.current.children.length) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(clone);
    }
  }, [scene, camera, color]);

  useEffect(() => {
    colorTarget.current.set(color);
  }, [color]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    /* Slow idle rotation, faster on hover */
    const speed = isHovered ? 2.0 : 0.3;
    baseRotation.current += delta * speed;
    groupRef.current.rotation.y = baseRotation.current;

    /* Subtle float */
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.015;

    /* Smooth color lerp */
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(colorTarget.current, 0.06);
    });
  });

  return <group ref={groupRef} />;
}

/* ─── Single model viewer ─── */
function ModelViewer({ color, accent }: { color: string; accent: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="img"
      aria-label="3D interactive headphones model"
      className="relative aspect-[4/5] w-full cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        camera={{ fov: 30, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <CompareHeadphones color={color} isHovered={hovered} />
          <Environment preset="city" />
        </Suspense>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <directionalLight position={[-3, 2, -2]} intensity={0.25} color={accent} />
      </Canvas>
      {/* Glow underneath */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-3/4 blur-3xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse, ${accent}30, transparent 70%)`,
          opacity: hovered ? 1 : 0.4,
        }}
      />
    </div>
  );
}

/* ─── Page ─── */
export default function ComparePage() {
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);

    gsap.fromTo("#compare-hero", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
    });

    gsap.fromTo(".model-col", { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.15, delay: 0.3, ease: "power3.out",
    });

    gsap.fromTo(".compare-row", { opacity: 0, x: -20 }, {
      opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power2.out",
      scrollTrigger: { trigger: "#spec-table", start: "top 85%" },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black" style={{ background: "#000" }}>
      {/* ── Nav ── */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500 ${
          navSolid ? "border-b border-white/5 bg-black/60 backdrop-blur-xl" : ""
        }`}
        style={{ padding: "20px clamp(32px, 5vw, 80px)" }}
      >
        <Link href="/" aria-label="KOVA home" className="font-[family-name:var(--font-display)] text-xl italic tracking-tight text-[#f0ede6] transition-opacity hover:opacity-70">
          {BRAND}
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="hidden font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-[#c8ff00] md:inline-block"
          >
            Back to home
          </Link>
          <Link href="/preorder" className="font-[family-name:var(--font-body)] border border-[#c8ff00] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#c8ff00] transition-all duration-300 hover:bg-[#c8ff00] hover:text-black">
            Pre-order
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="compare-hero"
        className="flex flex-col items-center"
        style={{ padding: "clamp(120px, 15vh, 200px) clamp(24px, 5vw, 80px) clamp(40px, 5vh, 80px)" }}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="rule-accent" />
          <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.4em] text-[#c8ff00]">
            Compare
          </span>
          <div className="rule-accent" />
        </div>
        <h1 className="text-center font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,7rem)] italic leading-[0.9] tracking-tight text-[#f0ede6]">
          Find your
          <br />
          <span className="text-white/50">perfect sound</span>
        </h1>
        <p className="mt-8 max-w-lg text-center font-[family-name:var(--font-body)] text-base leading-relaxed text-white/50">
          Three models. One obsession with sound. Choose the {BRAND} that
          fits your life.
        </p>
      </section>

      {/* ── 3 Model Columns — Apple style ── */}
      <section style={{ padding: "0 clamp(24px, 5vw, 80px)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {MODELS.map((m) => (
              <div key={m.name} className="model-col flex flex-col">

                {/* 3D Model viewer — big */}
                <div className="relative">
                  <ModelViewer color={m.modelColor} accent={m.accent} />
                  {m.badge && (
                    <span
                      className="absolute top-4 right-4 font-[family-name:var(--font-body)] text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 backdrop-blur-md"
                      style={{ color: m.accent, border: `1px solid ${m.accent}30`, background: "rgba(0,0,0,0.4)" }}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>

                {/* Info below model */}
                <div className="mt-4 flex flex-col items-center text-center">
                  <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {m.tagline}
                  </span>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] italic tracking-tight text-[#f0ede6]">
                    {m.name}
                  </h2>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] italic leading-none"
                      style={{ color: m.accent }}
                    >
                      ${m.price}
                    </span>
                  </div>
                  <Link
                    href={`/preorder?model=${m.id}`}
                    className="mt-6 block w-full max-w-[240px] py-4 text-center font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-80"
                    style={{
                      background: m.accent,
                      color: "#000",
                    }}
                  >
                    Pre-order
                  </Link>
                  <Link
                    href="/"
                    className="mt-3 font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white/50"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Spec Comparison Table ── */}
          <div id="spec-table" className="mt-32 mb-8">
            <div className="mb-12 flex items-center gap-4">
              <div className="rule-accent" />
              <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-[#c8ff00]">
                Full specifications
              </span>
            </div>

            {/* Sticky header row */}
            <div className="sticky top-16 z-40 hidden border-b border-white/[0.08] bg-black/80 backdrop-blur-xl pb-4 pt-4 md:grid md:grid-cols-[1.2fr_1fr_1fr_1fr]">
              <div />
              {MODELS.map((m) => (
                <span
                  key={m.name}
                  className="font-[family-name:var(--font-display)] text-lg italic"
                  style={{ color: m.accent }}
                >
                  {m.name}
                </span>
              ))}
            </div>

            {/* Spec rows */}
            {SPEC_ROWS.map(({ key, label }) => (
              <div
                key={key}
                className="compare-row spec-row grid grid-cols-1 gap-y-2 border-b border-white/[0.04] py-5 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center md:gap-y-0"
              >
                <span className="font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.15em] text-white/50">
                  {label}
                </span>
                {MODELS.map((m, i) => {
                  const val = m.specs[key];
                  const isHighest = key === "ancLevel"
                    ? MODELS.every((o) => {
                        const a = parseFloat(String(m.specs[key]).replace("–", "-"));
                        const b = parseFloat(String(o.specs[key]).replace("–", "-"));
                        return isNaN(a) || isNaN(b) || a <= b;
                      })
                    : i === MODELS.length - 1 && HIGHER_IS_BETTER.has(key);

                  return (
                    <div key={m.name} className="flex items-center gap-2 md:block">
                      <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.15em] text-white/50 md:hidden">
                        {m.name}:
                      </span>
                      <span
                        className={`font-[family-name:var(--font-body)] text-sm transition-colors duration-300 ${
                          isHighest ? "text-[#f0ede6]" : "text-white/50"
                        }`}
                      >
                        {formatValue(val)}
                        {typeof val === "boolean" && val && (
                          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#c8ff00]" />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Bottom CTA ── */}
          <section className="flex flex-col items-center py-24">
            <h2 className="text-center font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,4rem)] italic tracking-tight text-[#f0ede6]">
              Ready to decide?
            </h2>
            <p className="mt-4 max-w-md text-center font-[family-name:var(--font-body)] text-base text-white/50">
              Every {BRAND} comes with free shipping, 30-day returns, and a 2-year warranty.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {MODELS.map((m) => (
                <Link
                  key={m.name}
                  href={`/preorder?model=${m.id}`}
                  className="px-8 py-4 text-center font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-80"
                  style={{
                    background: m.accent,
                    color: "#000",
                  }}
                >
                  {m.name} — ${m.price}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        role="contentinfo"
        className="border-t border-white/[0.06] bg-black"
        style={{ padding: "64px clamp(24px, 5vw, 80px)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:gap-8 md:flex-row">
          <Link href="/" aria-label="KOVA home" className="font-[family-name:var(--font-display)] text-lg italic text-white/50">{BRAND}</Link>
          <nav aria-label="Footer navigation" className="flex gap-8">
            {["Support", "Privacy", "Terms", "Press"].map((link) => (
              <a key={link} href={`/${link.toLowerCase()}`} className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-white/60">
                {link}
              </a>
            ))}
          </nav>
          <span className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.2em] text-white/50">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
