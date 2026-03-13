"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const BRAND = "KOVA";

/* ─── Data ─── */
const FEATURES = [
  {
    title: "40mm Drivers",
    desc: "Neodymium drivers tuned for thunderous bass, transparent mids, and crystalline highs across the full spectrum.",
    stat: "20Hz–20kHz",
    label: "Frequency",
  },
  {
    title: "Adaptive ANC",
    desc: "Six microphones sample your environment 200× per second, eliminating up to 98% of external noise in real time.",
    stat: "–45dB",
    label: "Reduction",
  },
  {
    title: "Spatial Audio",
    desc: "Head-tracking sensors create a 360° sound field that adapts to your movement. Music stays in place; you move through it.",
    stat: "360°",
    label: "Sound field",
  },
];

const STATS = [
  { value: "50h", label: "Battery life" },
  { value: "280g", label: "Featherweight" },
  { value: "98%", label: "Noise blocked" },
  { value: "10m", label: "Fast charge → 3h" },
];

const COLOR_OPTIONS = [
  { name: "Void Black", hex: "#1a1a1a", display: "#111111", accent: "#333" },
  { name: "Arctic", hex: "#c8c4bc", display: "#d4d0c8", accent: "#999" },
  { name: "Signal Red", hex: "#8b1a1a", display: "#8b1a1a", accent: "#cc3333" },
  { name: "Midnight Blue", hex: "#1a2a4a", display: "#1a2a4a", accent: "#3366aa" },
];

const SPECS: [string, string][] = [
  ["Driver size", "40mm neodymium"],
  ["Frequency response", "20Hz – 20kHz"],
  ["Impedance", "32Ω"],
  ["Noise cancellation", "Adaptive ANC, –45dB"],
  ["Battery", "50 hours (ANC on)"],
  ["Charging", "USB-C · 10min = 3h playback"],
  ["Weight", "280g"],
  ["Connectivity", "Bluetooth 5.3 · 3.5mm"],
  ["Codecs", "LDAC · AAC · SBC"],
  ["Water resistance", "IPX4"],
];

/* ─── 3D Headphones (Desktop — scroll-driven) ─── */
function Headphones({
  scrollProgress,
  offsetX,
  targetColor,
}: {
  scrollProgress: React.MutableRefObject<number>;
  offsetX: React.MutableRefObject<number>;
  targetColor: string;
}) {
  const { scene } = useGLTF("/model.glb");
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const colorTarget = useRef(new THREE.Color(targetColor));
  const currentPosX = useRef(0);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    scene.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, maxDim * 2.2);
    camera.lookAt(0, 0, 0);

    const mats: THREE.MeshStandardMaterial[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          const cloned = mat.clone();
          child.material = cloned;
          mats.push(cloned);
        }
      }
    });
    materialsRef.current = mats;
  }, [scene, camera]);

  useEffect(() => {
    colorTarget.current.set(targetColor);
  }, [targetColor]);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetY = scrollProgress.current * Math.PI * 2;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.1;
    currentPosX.current += (offsetX.current - currentPosX.current) * 0.05;
    groupRef.current.position.x = currentPosX.current;
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.02;
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(colorTarget.current, 0.04);
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/* ─── 3D Headphones (Mobile device — simple auto-rotate) ─── */
function MobileHeadphones({ targetColor }: { targetColor: string }) {
  const { scene } = useGLTF("/model-draco.glb", true);
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const colorTarget = useRef(new THREE.Color(targetColor));
  const { camera } = useThree();

  useEffect(() => {
    const clone = scene.clone(true);
    clonedScene.current = clone;

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    clone.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, maxDim * 2.4);
    camera.lookAt(0, 0, 0);

    const mats: THREE.MeshStandardMaterial[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          const cloned = mat.clone();
          cloned.color.set(targetColor);
          child.material = cloned;
          mats.push(cloned);
        }
      }
    });
    materialsRef.current = mats;

    if (groupRef.current) {
      while (groupRef.current.children.length) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(clone);
    }
  }, [scene, camera, targetColor]);

  useEffect(() => {
    colorTarget.current.set(targetColor);
  }, [targetColor]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.015;
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(colorTarget.current, 0.06);
    });
  });

  return <group ref={groupRef} />;
}

/* ─── Loader ─── */
function Loader({ onReady }: { onReady: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const t = setTimeout(onReady, 600);
    return () => clearTimeout(t);
  }, [gl, onReady]);
  return null;
}

/* ─── Page ─── */
export default function Page() {
  const scrollProgress = useRef(0);
  const modelOffsetX = useRef(0);
  const [ready, setReady] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kova-color");
    if (saved !== null) setActiveColor(Number(saved));
    /* Detect actual mobile device, not just small screen */
    const isTouchDevice = navigator.maxTouchPoints > 0;
    const isMobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
    setIsMobileDevice(isTouchDevice && isMobileUA);
  }, []);

  const handleColorChange = useCallback((index: number) => {
    setActiveColor(index);
    localStorage.setItem("kova-color", String(index));
  }, []);

  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    /* Skip scroll-driven 3D on mobile devices */
    if (!isMobileDevice) {
      /* ── Scroll rotation ── */
      ScrollTrigger.create({
        trigger: "#scroll-driver",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });

      /* ── Model slides right at rotate-zone: 0 → 2.8 ── */
      ScrollTrigger.create({
        trigger: "#rotate-zone",
        start: "top 90%",
        end: "top 30%",
        scrub: true,
        onUpdate: (self) => {
          modelOffsetX.current = self.progress * 2.8;
        },
      });

      /* ── Model returns to center at CTA: 2.8 → 0 ── */
      ScrollTrigger.create({
        trigger: "#cta-section",
        start: "top 90%",
        end: "top 40%",
        scrub: true,
        onUpdate: (self) => {
          modelOffsetX.current = 2.8 - self.progress * 2.8;
        },
      });

      /* ── Fade hero ── */
      gsap.to("#hero-text", {
        opacity: 0,
        y: -60,
        scrollTrigger: {
          trigger: "#rotate-zone",
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      });
    }

    /* ── Tagline ── */
    gsap.fromTo("#tagline", { opacity: 0, y: 80 }, {
      opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: "#tagline", start: "top 85%" },
    });
    gsap.fromTo("#tagline-sub", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out",
      scrollTrigger: { trigger: "#tagline-sub", start: "top 85%" },
    });

    /* ── Feature cards ── */
    gsap.fromTo(".feature-card", { opacity: 0, y: 80 }, {
      opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out",
      scrollTrigger: { trigger: "#features-grid", start: "top 80%" },
    });

    /* ── Stats ── */
    gsap.fromTo(".stat-item", { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: "#stats-section", start: "top 75%" },
    });

    /* ── Color heading ── */
    gsap.fromTo("#color-heading", { opacity: 0, x: -60 }, {
      opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: "#color-heading", start: "top 80%" },
    });

    /* ── Spec rows ── */
    gsap.fromTo(".spec-row", { opacity: 0, x: -30 }, {
      opacity: 1, x: 0, duration: 0.6, stagger: 0.06, ease: "power2.out",
      scrollTrigger: { trigger: "#specs-list", start: "top 80%" },
    });

    /* ── CTA ── */
    gsap.fromTo("#cta-inner", { opacity: 0, scale: 0.95 }, {
      opacity: 1, scale: 1, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: "#cta-section", start: "top 75%" },
    });

    /* Nav background */
    const onScroll = () => setNavSolid(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("scroll", onScroll);
    };
  }, [isMobileDevice]);

  return (
    <main>
      {/* ── Loading overlay ── */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black ${
          ready ? "loader-exit pointer-events-none" : ""
        }`}
        onAnimationEnd={(e) => {
          if (ready) (e.currentTarget as HTMLElement).style.display = "none";
        }}
      >
        <span className="mb-8 font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,4rem)] italic tracking-tight text-[#f0ede6] animate-pulse">
          {BRAND}
        </span>
        <div className="h-px w-48 overflow-hidden rounded-full bg-white/10">
          <div className="loading-bar h-full w-full bg-[#c8ff00]" />
        </div>
        <span className="mt-4 font-[family-name:var(--font-body)] text-xs tracking-[0.3em] text-white/50">
          Loading experience...
        </span>
      </div>

      {/* ── Nav ── */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500 ${
          navSolid ? "border-b border-white/5 bg-black/60 backdrop-blur-xl" : ""
        }`}
        style={{ padding: "20px clamp(32px, 5vw, 80px)" }}
      >
        <a href="/" aria-label="KOVA home" className="font-[family-name:var(--font-display)] text-xl italic tracking-tight text-[#f0ede6]">
          {BRAND}
        </a>
        <div className="flex items-center gap-8">
          {["Sound", "Design", "Specs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="hidden font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-[#c8ff00] md:inline-block"
            >
              {item}
            </a>
          ))}
          <a href="/preorder" className="font-[family-name:var(--font-body)] border border-[#c8ff00] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#c8ff00] transition-all duration-300 hover:bg-[#c8ff00] hover:text-black">
            Pre-order
          </a>
        </div>
      </nav>

      {/* ── Three.js Scene (Desktop: fixed fullscreen / Mobile device: contained in hero) ── */}
      {!isMobileDevice && (
        <div className="fixed inset-0 z-10" role="img" aria-label="3D interactive KOVA headphones model rotating as you scroll">
          <Canvas
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            dpr={[1, 2]}
            camera={{ fov: 35, near: 0.1, far: 100 }}
          >
            <Suspense fallback={null}>
              <Headphones
                scrollProgress={scrollProgress}
                offsetX={modelOffsetX}
                targetColor={COLOR_OPTIONS[activeColor].hex}
              />
              <Environment preset="city" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
              <Loader onReady={handleReady} />
            </Suspense>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#c8ff00" />
          </Canvas>
        </div>
      )}

      {/* ── Scroll driver (hero + rotate + features) ── */}
      <div id="scroll-driver">
        {/* Hero */}
        <section className="relative z-20 flex min-h-screen flex-col items-center justify-center">
          <div id="hero-text" className={`text-center ${ready ? "page-enter" : "opacity-0"}`} style={{ padding: "0 clamp(24px, 5vw, 80px)", animationDelay: "0.3s" }}>
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="rule-accent" />
              <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.4em] text-[#c8ff00]">
                Introducing
              </span>
              <div className="rule-accent" />
            </div>
            <h1 className="text-glow font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,10rem)] italic leading-[0.85] tracking-tight text-[#f0ede6]">
              {BRAND}
            </h1>
            <p className="mt-6 font-[family-name:var(--font-body)] text-sm tracking-[0.3em] text-white/50">
              IMMERSIVE SOUND — PURE SILENCE
            </p>
          </div>

          {/* Mobile device: contained 3D model in hero */}
          {isMobileDevice && (
            <div className="relative mt-4 h-[45vh] w-full" role="img" aria-label="3D KOVA headphones model">
              <Canvas
                gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
                dpr={[1, 1]}
                camera={{ fov: 30, near: 0.1, far: 100 }}
              >
                <Suspense fallback={null}>
                  <MobileHeadphones targetColor={COLOR_OPTIONS[activeColor].hex} />
                  <Loader onReady={handleReady} />
                </Suspense>
                <ambientLight intensity={0.5} />
                <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#333333" />
                <directionalLight position={[5, 5, 5]} intensity={0.7} />
              </Canvas>
              {/* Glow under model */}
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-2/3 -translate-x-1/2 blur-3xl"
                style={{ background: `radial-gradient(ellipse, ${COLOR_OPTIONS[activeColor].accent}30, transparent 70%)` }}
              />
            </div>
          )}

          {!isMobileDevice && (
            <div className={`absolute bottom-10 flex flex-col items-center gap-3 ${ready ? "page-fade" : "opacity-0"}`} style={{ animationDelay: "0.8s" }}>
              <span className="font-[family-name:var(--font-body)] text-[9px] uppercase tracking-[0.3em] text-white/50">
                Scroll
              </span>
              <div className="relative h-10 w-px">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#c8ff00]/50 to-transparent" />
              </div>
            </div>
          )}
        </section>

        {/* Rotate zone */}
        <section id="rotate-zone" className="relative" style={{ height: isMobileDevice ? "auto" : "200vh" }}>
          <div className={isMobileDevice ? "py-20" : "sticky top-0 flex h-screen items-center"} style={{ padding: isMobileDevice ? "clamp(48px, 8vh, 80px) clamp(24px, 5vw, 80px)" : "0 clamp(24px, 5vw, 80px)" }}>
            <div className="relative z-20 grid w-full grid-cols-1 md:grid-cols-[55fr_45fr]">
              <div>
                <h2
                  id="tagline"
                  className="text-glow font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,6rem)] italic leading-[1.05] tracking-tight text-[#f0ede6]"
                >
                  Sound that <span className="text-[#c8ff00]">surrounds</span>
                  <br />you completely
                </h2>
                <div className="mt-8 h-px w-16 bg-[#c8ff00]/40" />
                <p
                  id="tagline-sub"
                  className="text-glow mt-8 max-w-md font-[family-name:var(--font-body)] text-base leading-relaxed text-white/50"
                >
                  40mm custom-engineered drivers. Adaptive noise cancellation with
                  six microphones. Spatial audio that puts you at the center of
                  every note, every beat, every silence.
                </p>
              </div>
              {/* Right column intentionally empty — model lives here on desktop */}
              <div className="hidden md:block" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features-section" className="relative" style={{ height: isMobileDevice ? "auto" : "150vh" }}>
          <div id="sound" className={isMobileDevice ? "py-12" : "sticky top-0 flex h-screen items-end"} style={{ padding: isMobileDevice ? "0 clamp(24px, 5vw, 80px)" : "0 clamp(24px, 5vw, 80px) clamp(40px, 5vh, 96px)" }}>
            <div id="features-grid" className="relative z-20 flex w-full md:max-w-[50%] flex-col">
              {FEATURES.map((f, i) => (
                <div key={f.title} className={`feature-card group py-8 ${i !== FEATURES.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-[family-name:var(--font-body)] text-[9px] uppercase tracking-[0.3em] text-[#c8ff00]/60">{f.label}</span>
                    <div className="h-px flex-1 bg-white/[0.04]" />
                    <span className="text-glow font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] italic leading-none text-[#c8ff00]">{f.stat}</span>
                  </div>
                  <h3 className="text-glow font-[family-name:var(--font-display)] text-xl italic text-[#f0ede6]">{f.title}</h3>
                  <p className="text-glow mt-2 max-w-sm font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/50">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══════════ Content sections ══════════ */}
      <div id="content-sections">

        {/* ── Stats — Strategy A: transparent, no gradient ── */}
        <section
          id="stats-section"
          className="relative z-20"
          style={{
            padding: "clamp(48px, 8vh, 112px) clamp(24px, 5vw, 80px)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:max-w-[55%] md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="stat-item">
                  <div className="mb-6 h-px w-8 bg-white/10" />
                  <span className="text-glow font-[family-name:var(--font-display)] text-[clamp(3rem,6vw,5rem)] italic text-[#f0ede6]">{s.value}</span>
                  <p className="text-glow mt-2 font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.25em] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Colors — Strategy A: transparent, grid layout ── */}
        <section
          id="design"
          className="relative z-20"
          style={{
            padding: "clamp(48px, 8vh, 144px) clamp(24px, 5vw, 80px)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-[45%_1fr]">
              <div>
                <div className="mb-6 flex items-center gap-4">
                  <div className="rule-accent" />
                  <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-[#c8ff00]">
                    Colorways
                  </span>
                </div>
                <h2
                  id="color-heading"
                  className="text-glow font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,6rem)] italic leading-[1.1] tracking-tight text-[#f0ede6]"
                >
                  Your color.
                  <br />
                  <span className="text-white/50">Your sound.</span>
                </h2>
                <p className="text-glow mt-6 max-w-md font-[family-name:var(--font-body)] text-base leading-relaxed text-white/50">
                  Each colorway is crafted with premium anodized aluminum.
                  Pick the one that matches your style.
                </p>

                {/* Vertical color picker stack */}
                <div className="mt-12 flex flex-col gap-3">
                  {COLOR_OPTIONS.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorChange(i)}
                      className={`group flex items-center gap-4 border py-4 px-6 transition-all duration-500 ${
                        activeColor === i
                          ? "border-[#c8ff00]/40 bg-white/5"
                          : "border-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full transition-all duration-300 ${
                          activeColor === i ? "ring-2 ring-[#c8ff00]/50 ring-offset-2 ring-offset-black" : ""
                        }`}
                        style={{ backgroundColor: c.display }}
                      />
                      <span
                        className={`font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 ${
                          activeColor === i ? "text-[#f0ede6]" : "text-white/50"
                        }`}
                      >
                        {c.name}
                      </span>
                      {activeColor === i && (
                        <span className="ml-auto font-[family-name:var(--font-body)] text-[9px] uppercase tracking-[0.3em] text-[#c8ff00]/60">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right column: large watermark color name */}
              <div className="hidden items-end justify-end overflow-hidden md:flex">
                <span
                  className="font-[family-name:var(--font-display)] text-[8rem] italic leading-none text-white/[0.03] select-none"
                >
                  {COLOR_OPTIONS[activeColor].name}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Specs — Strategy A+B: heading transparent, table in glass card ── */}
        <section
          id="specs"
          className="relative z-20"
          style={{
            padding: "clamp(48px, 8vh, 144px) clamp(24px, 5vw, 80px)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="md:max-w-[50%]">
              <div className="mb-16">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rule-accent" />
                  <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-[#c8ff00]">
                    Specifications
                  </span>
                </div>
                <h2 className="text-glow font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,6rem)] italic tracking-tight text-[#f0ede6]">
                  The details
                </h2>
                <p className="text-glow mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.5rem)] italic tracking-tight text-white/50">
                  that matter
                </p>
              </div>
              <div id="specs-list" className="glass-card rounded-lg p-8 md:p-10">
                {SPECS.map(([label, value]) => (
                  <div key={label} className="spec-row flex items-center justify-between border-b border-white/[0.06] py-5">
                    <span className="font-[family-name:var(--font-body)] text-xs text-white/50">{label}</span>
                    <span className="font-[family-name:var(--font-body)] text-base text-[#f0ede6]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA — transparent, model returns to center ── */}
        <section
          id="cta-section"
          className="relative z-20 flex items-center justify-center"
          style={{ minHeight: "80vh", padding: "0 clamp(24px, 5vw, 80px)" }}
        >
          <div id="cta-inner" className="text-center">
            <span className="text-glow font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.4em] text-[#c8ff00]">
              Available now
            </span>
            <h2 className="text-glow mt-6 font-[family-name:var(--font-display)] text-[clamp(5rem,12vw,11rem)] italic leading-none tracking-tight text-[#f0ede6]">
              $349
            </h2>
            <p className="text-glow mx-auto mt-6 max-w-md font-[family-name:var(--font-body)] text-base leading-relaxed text-white/50">
              Free worldwide shipping. 30-day returns.
              <br />
              2-year warranty included.
            </p>
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="/preorder" className="w-full text-center font-[family-name:var(--font-body)] bg-[#c8ff00] px-12 py-5 text-[11px] uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-[#d4ff33] sm:w-auto">
                Pre-order now
              </a>
              <a href="/compare" className="w-full text-center font-[family-name:var(--font-body)] border border-white/10 px-12 py-5 text-[11px] uppercase tracking-[0.2em] text-white/50 transition-all duration-300 hover:border-white/30 hover:text-white sm:w-auto">
                Compare models
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          role="contentinfo"
          className="relative z-20 border-t border-white/[0.06] bg-black"
          style={{ padding: "64px clamp(24px, 5vw, 80px)" }}
        >
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:gap-8 md:flex-row">
            <span className="font-[family-name:var(--font-display)] text-lg italic text-white/50">{BRAND}</span>
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
      </div>
    </main>
  );
}
