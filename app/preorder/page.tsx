"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";

const BRAND = "KOVA";

/* ─── Products ─── */
const PRODUCTS = [
  {
    id: "lite",
    name: "KOVA Lite",
    price: 149,
    accent: "#4ec9b0",
    modelColor: "#607080",
    tagline: "Essential sound",
    features: ["30mm composite drivers", "30h battery", "Passive isolation", "IPX2"],
  },
  {
    id: "standard",
    name: "KOVA",
    price: 349,
    accent: "#c8ff00",
    modelColor: "#1a1a1a",
    tagline: "Immersive sound",
    features: ["40mm neodymium drivers", "50h battery", "Adaptive ANC –45dB", "Spatial audio", "IPX4"],
  },
  {
    id: "ultra",
    name: "KOVA Ultra",
    price: 549,
    accent: "#d4a0ff",
    modelColor: "#2a1a3a",
    tagline: "No compromise",
    features: ["50mm planar magnetic drivers", "60h battery", "ANC Pro –52dB", "Spatial audio", "Qi charging", "IPX5"],
  },
];

const COLOR_OPTIONS = [
  { name: "Void Black", hex: "#1a1a1a" },
  { name: "Arctic", hex: "#c8c4bc" },
  { name: "Signal Red", hex: "#8b1a1a" },
  { name: "Midnight Blue", hex: "#1a2a4a" },
];

/* ─── 3D Model ─── */
function PreorderHeadphones({ color }: { color: string }) {
  const { scene } = useGLTF("/model.glb");
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const colorTarget = useRef(new THREE.Color(color));
  const { camera } = useThree();

  useEffect(() => {
    const clone = scene.clone(true);
    clonedScene.current = clone;

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    clone.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    (camera as THREE.PerspectiveCamera).position.set(0, 0, maxDim * 2.2);
    camera.lookAt(0, 0, 0);

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
    groupRef.current.rotation.y += delta * 0.25;
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.015;
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(colorTarget.current, 0.06);
    });
  });

  return <group ref={groupRef} />;
}

/* ─── Form steps ─── */
type Step = "product" | "customize" | "shipping" | "confirm";
const STEPS: { key: Step; label: string }[] = [
  { key: "product", label: "Model" },
  { key: "customize", label: "Customize" },
  { key: "shipping", label: "Shipping" },
  { key: "confirm", label: "Confirm" },
];

/* ─── Page ─── */
function PreorderContent() {
  const searchParams = useSearchParams();
  const initialModel = searchParams.get("model") || "standard";

  const [step, setStep] = useState<Step>("product");
  const [selectedProduct, setSelectedProduct] = useState(
    PRODUCTS.findIndex((p) => p.id === initialModel) !== -1
      ? PRODUCTS.findIndex((p) => p.id === initialModel)
      : 1
  );
  const [selectedColor, setSelectedColor] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zip: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const product = PRODUCTS[selectedProduct];
  const currentModelColor = selectedColor === 0
    ? product.modelColor
    : COLOR_OPTIONS[selectedColor].hex;

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Animate form step transitions */
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, x: 30 }, {
        opacity: 1, x: 0, duration: 0.5, ease: "power3.out",
      });
    }
  }, [step]);

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  }, [step]);

  const goBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  }, [step]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  /* ── Success screen ── */
  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black" style={{ padding: "0 clamp(24px, 5vw, 80px)", background: "#000" }}>
        <div className="page-enter text-center" style={{ animationDelay: "0.1s" }}>
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#c8ff00]/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,5rem)] italic tracking-tight text-[#f0ede6]">
            Order confirmed
          </h1>
          <p className="mt-4 font-[family-name:var(--font-body)] text-base text-white/50">
            Thank you for your pre-order of the <span className="text-[#f0ede6]">{product.name}</span> in{" "}
            <span className="text-[#f0ede6]">{COLOR_OPTIONS[selectedColor].name}</span>.
          </p>
          <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-white/50">
            A confirmation email has been sent to <span className="text-white/50">{formData.email}</span>
          </p>

          <div className="mx-auto mt-12 w-full max-w-sm glass-card rounded-lg p-8 text-left">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.2em] text-white/50">Order total</span>
              <span className="font-[family-name:var(--font-display)] text-2xl italic" style={{ color: product.accent }}>
                ${product.price}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-xs text-white/50">Model</span>
                <span className="font-[family-name:var(--font-body)] text-sm text-[#f0ede6]">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-xs text-white/50">Color</span>
                <span className="font-[family-name:var(--font-body)] text-sm text-[#f0ede6]">{COLOR_OPTIONS[selectedColor].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-[family-name:var(--font-body)] text-xs text-white/50">Shipping</span>
                <span className="font-[family-name:var(--font-body)] text-sm text-[#c8ff00]">Free</span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="font-[family-name:var(--font-body)] border border-white/10 px-10 py-4 text-[11px] uppercase tracking-[0.2em] text-white/50 transition-all duration-300 hover:border-white/30 hover:text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
        <Link
          href="/"
          className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-[#c8ff00]"
        >
          Back to home
        </Link>
      </nav>

      <div
        className="mx-auto grid min-h-screen grid-cols-1 md:grid-cols-2"
        style={{ paddingTop: "100px" }}
      >
        {/* ── Left: 3D Model ── */}
        <div className="relative flex items-center justify-center md:sticky md:top-0 md:h-screen">
          <div className="relative h-[35vh] w-full sm:h-[45vh] md:h-[70vh]">
            <Canvas
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              dpr={[1, 1.5]}
              camera={{ fov: 30, near: 0.1, far: 100 }}
            >
              <Suspense fallback={null}>
                <PreorderHeadphones color={currentModelColor} />
                <Environment preset="city" />
                <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2.5} far={4} />
              </Suspense>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.7} />
              <directionalLight position={[-3, 2, -2]} intensity={0.25} color={product.accent} />
            </Canvas>
          </div>
          {/* Glow */}
          <div
            className="pointer-events-none absolute bottom-[10%] left-1/2 h-20 sm:h-24 md:h-32 w-1/2 -translate-x-1/2 blur-3xl"
            style={{ background: `radial-gradient(ellipse, ${product.accent}25, transparent 70%)` }}
          />
          {/* Model name watermark */}
          <span className="pointer-events-none absolute bottom-[5%] left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,7rem)] italic text-white/[0.03] select-none">
            {product.name}
          </span>
        </div>

        {/* ── Right: Form ── */}
        <div
          className="flex flex-col justify-center"
          style={{ padding: "clamp(24px, 4vw, 60px) clamp(24px, 5vw, 80px) clamp(48px, 6vh, 80px)" }}
        >
          {/* Step indicator */}
          <div className="mb-12 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (i < stepIndex) setStep(s.key);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-body)] text-[11px] transition-all duration-300 ${
                    i === stepIndex
                      ? "bg-[#c8ff00] text-black"
                      : i < stepIndex
                        ? "border border-[#c8ff00]/40 text-[#c8ff00] cursor-pointer hover:bg-[#c8ff00]/10"
                        : "border border-white/10 text-white/50"
                  }`}
                >
                  {i < stepIndex ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                <span className={`hidden font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] sm:inline ${
                  i === stepIndex ? "text-[#f0ede6]" : "text-white/50"
                }`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`mx-1 sm:mx-2 h-px w-4 sm:w-6 transition-colors duration-300 ${
                    i < stepIndex ? "bg-[#c8ff00]/40" : "bg-white/10"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div ref={formRef} className="min-h-[280px] sm:min-h-[400px]">

            {/* ── Step 1: Product ── */}
            {step === "product" && (
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] italic tracking-tight text-[#f0ede6]">
                  Choose your
                  <br />
                  <span className="text-white/50">model</span>
                </h1>

                <div className="mt-10 flex flex-col gap-3">
                  {PRODUCTS.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(i)}
                      className={`group flex items-center justify-between border py-5 px-6 transition-all duration-500 ${
                        selectedProduct === i
                          ? "border-[#c8ff00]/40 bg-white/5"
                          : "border-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                            selectedProduct === i ? "ring-2 ring-offset-2 ring-offset-black" : ""
                          }`}
                          style={{
                            background: p.accent,
                            // @ts-expect-error ring-color via CSS custom prop
                            "--tw-ring-color": p.accent,
                          }}
                        >
                          {selectedProduct === i && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.accent === "#888" ? "#fff" : "#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="text-left">
                          <span className={`block font-[family-name:var(--font-display)] text-lg italic transition-colors duration-300 ${
                            selectedProduct === i ? "text-[#f0ede6]" : "text-white/50"
                          }`}>
                            {p.name}
                          </span>
                          <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.2em] text-white/50">
                            {p.tagline}
                          </span>
                        </div>
                      </div>
                      <span
                        className="font-[family-name:var(--font-display)] text-2xl italic"
                        style={{ color: selectedProduct === i ? p.accent : "rgba(255,255,255,0.2)" }}
                      >
                        ${p.price}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Features preview */}
                <div className="mt-8 space-y-2">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <span className="inline-block h-1 w-1 rounded-full bg-[#c8ff00]/50" />
                      <span className="font-[family-name:var(--font-body)] text-sm text-white/50">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Customize ── */}
            {step === "customize" && (
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] italic tracking-tight text-[#f0ede6]">
                  Make it
                  <br />
                  <span className="text-white/50">yours</span>
                </h1>

                <div className="mt-10">
                  <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-white/50">
                    Colorway
                  </span>
                  <div className="mt-4 flex flex-col gap-3">
                    {COLOR_OPTIONS.map((c, i) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(i)}
                        className={`flex items-center gap-4 border py-4 px-6 transition-all duration-500 ${
                          selectedColor === i
                            ? "border-[#c8ff00]/40 bg-white/5"
                            : "border-white/[0.06] hover:border-white/10"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full transition-all duration-300 ${
                            selectedColor === i ? "ring-2 ring-[#c8ff00]/50 ring-offset-2 ring-offset-black" : ""
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={`font-[family-name:var(--font-body)] text-sm transition-colors duration-300 ${
                          selectedColor === i ? "text-[#f0ede6]" : "text-white/50"
                        }`}>
                          {c.name}
                        </span>
                        {selectedColor === i && (
                          <span className="ml-auto font-[family-name:var(--font-body)] text-[9px] uppercase tracking-[0.3em] text-[#c8ff00]/60">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary so far */}
                <div className="mt-10 glass-card rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-[family-name:var(--font-display)] text-lg italic text-[#f0ede6]">{product.name}</span>
                      <span className="ml-3 font-[family-name:var(--font-body)] text-xs text-white/50">
                        · {COLOR_OPTIONS[selectedColor].name}
                      </span>
                    </div>
                    <span className="font-[family-name:var(--font-display)] text-xl italic" style={{ color: product.accent }}>
                      ${product.price}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Shipping ── */}
            {step === "shipping" && (
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] italic tracking-tight text-[#f0ede6]">
                  Where to
                  <br />
                  <span className="text-white/50">ship it</span>
                </h1>

                <div className="mt-10 space-y-5">
                  {[
                    { key: "name" as const, label: "Full name", placeholder: "John Doe", type: "text" },
                    { key: "email" as const, label: "Email", placeholder: "john@example.com", type: "email" },
                    { key: "address" as const, label: "Address", placeholder: "123 Main St", type: "text" },
                    { key: "city" as const, label: "City", placeholder: "New York", type: "text" },
                    { key: "country" as const, label: "Country", placeholder: "United States", type: "text" },
                    { key: "zip" as const, label: "ZIP code", placeholder: "10001", type: "text" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.25em] text-white/50">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full border border-white/[0.08] bg-white/[0.03] px-3 py-3 sm:px-5 sm:py-4 font-[family-name:var(--font-body)] text-sm text-[#f0ede6] placeholder:text-white/50 transition-all duration-300 focus:border-[#c8ff00]/40 focus:bg-white/[0.05] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-block h-1 w-1 rounded-full bg-[#c8ff00]" />
                  <span className="font-[family-name:var(--font-body)] text-sm text-[#c8ff00]/60">Free worldwide shipping</span>
                </div>
              </div>
            )}

            {/* ── Step 4: Confirm ── */}
            {step === "confirm" && (
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.5rem)] italic tracking-tight text-[#f0ede6]">
                  Review your
                  <br />
                  <span className="text-white/50">order</span>
                </h1>

                <div className="mt-10 glass-card rounded-lg p-8 space-y-6">
                  {/* Product */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-6">
                    <div>
                      <span className="font-[family-name:var(--font-display)] text-xl italic text-[#f0ede6]">{product.name}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLOR_OPTIONS[selectedColor].hex }} />
                        <span className="font-[family-name:var(--font-body)] text-xs text-white/50">{COLOR_OPTIONS[selectedColor].name}</span>
                      </div>
                    </div>
                    <span className="font-[family-name:var(--font-display)] text-2xl italic" style={{ color: product.accent }}>
                      ${product.price}
                    </span>
                  </div>

                  {/* Shipping info */}
                  <div className="space-y-2 border-b border-white/[0.06] pb-6 break-words">
                    <span className="font-[family-name:var(--font-body)] text-[10px] uppercase tracking-[0.25em] text-white/50">Ship to</span>
                    <p className="font-[family-name:var(--font-body)] text-sm text-[#f0ede6]">{formData.name}</p>
                    <p className="font-[family-name:var(--font-body)] text-sm text-white/50">
                      {formData.address}, {formData.city}
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-sm text-white/50">
                      {formData.country} {formData.zip}
                    </p>
                    <p className="font-[family-name:var(--font-body)] text-sm text-white/50">{formData.email}</p>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-[family-name:var(--font-body)] text-xs text-white/50">Subtotal</span>
                      <span className="font-[family-name:var(--font-body)] text-sm text-[#f0ede6]">${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-[family-name:var(--font-body)] text-xs text-white/50">Shipping</span>
                      <span className="font-[family-name:var(--font-body)] text-sm text-[#c8ff00]">Free</span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-3">
                      <span className="font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.2em] text-[#f0ede6]">Total</span>
                      <span className="font-[family-name:var(--font-display)] text-3xl italic" style={{ color: product.accent }}>
                        ${product.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation buttons ── */}
          <div className="mt-10 flex items-center gap-4">
            {stepIndex > 0 && (
              <button
                onClick={goBack}
                className="font-[family-name:var(--font-body)] border border-white/10 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-white/50 transition-all duration-300 hover:border-white/30 hover:text-white"
              >
                Back
              </button>
            )}
            {step !== "confirm" ? (
              <button
                onClick={goNext}
                className="flex-1 py-4 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-80"
                style={{
                  background: product.accent,
                  color: "#000",
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 font-[family-name:var(--font-body)] text-[11px] uppercase tracking-[0.2em] bg-[#c8ff00] text-black transition-all duration-300 hover:bg-[#d4ff33]"
              >
                Place pre-order — ${product.price}
              </button>
            )}
          </div>

          {/* Security note */}
          <div className="mt-6 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="font-[family-name:var(--font-body)] text-[10px] tracking-[0.15em] text-white/50">
              Secure checkout · 256-bit encryption
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PreorderPage() {
  return (
    <Suspense>
      <PreorderContent />
    </Suspense>
  );
}
