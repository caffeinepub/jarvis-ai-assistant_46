import { useEffect, useRef } from "react";

interface ArcReactorProps {
  isActive?: boolean;
  isSpeaking?: boolean;
  size?: number;
}

const PARTICLE_COUNT = 12;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function ArcReactor({
  isActive = false,
  isSpeaking = false,
  size = 280,
}: ArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      radius: number;
    }>
  >([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Init particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const r = size * 0.18;
      return {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        vx: Math.cos(angle) * randomBetween(0.3, 0.8),
        vy: Math.sin(angle) * randomBetween(0.3, 0.8),
        life: Math.random() * 100,
        maxLife: randomBetween(80, 140),
        radius: randomBetween(1.5, 3),
      };
    });

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, size, size);
      timeRef.current += 0.02;
      const t = timeRef.current;
      const speedMult = isActive ? 2.5 : 1;
      const glowMult = isActive ? 1.6 : 1;

      // Background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
      const baseAlpha1 = 0.12 * glowMult;
      const baseAlpha2 = 0.05 * glowMult;
      if (isSpeaking) {
        bgGrad.addColorStop(0, `rgba(255,59,59,${baseAlpha1})`);
        bgGrad.addColorStop(0.4, `rgba(255,59,59,${baseAlpha2})`);
      } else {
        bgGrad.addColorStop(0, `rgba(32,214,255,${baseAlpha1})`);
        bgGrad.addColorStop(0.4, `rgba(32,214,255,${baseAlpha2})`);
      }
      bgGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Outer ring with tick marks
      const outerR = size * 0.46;
      const outerAngle = t * 0.4 * speedMult;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(outerAngle);
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(32,214,255,${0.35 * glowMult})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Tick marks
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const len = i % 3 === 0 ? 8 : 4;
        const inner = outerR - len;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
        ctx.lineTo(Math.cos(a) * inner, Math.sin(a) * inner);
        ctx.strokeStyle =
          i % 3 === 0
            ? `rgba(32,214,255,${0.7 * glowMult})`
            : `rgba(32,214,255,${0.3 * glowMult})`;
        ctx.lineWidth = i % 3 === 0 ? 1.5 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // Middle ring (counter-rotating)
      const midR = size * 0.36;
      const midAngle = -t * 0.7 * speedMult;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.beginPath();
      ctx.arc(0, 0, midR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(32,214,255,${0.5 * glowMult})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Accent dots on mid ring
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * midR, Math.sin(a) * midR, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(32,214,255,${0.9 * glowMult})`;
        ctx.fill();
      }
      ctx.restore();

      // Inner ring
      const innerR = size * 0.26;
      const innerAngle = t * 1.1 * speedMult;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(innerAngle);
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = isSpeaking
        ? `rgba(255,59,59,${0.7 * glowMult})`
        : `rgba(32,214,255,${0.6 * glowMult})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Triangular notches
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * innerR, Math.sin(a) * innerR, 3, 0, Math.PI * 2);
        ctx.fillStyle = isSpeaking
          ? `rgba(255,100,100,${0.9})`
          : `rgba(52,230,255,${0.9})`;
        ctx.fill();
      }
      ctx.restore();

      // Core glow
      const coreR = size * 0.14;
      const pulseFactor = 0.85 + 0.15 * Math.sin(t * (isActive ? 4 : 2));
      const coreGrad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        coreR * pulseFactor * 1.8,
      );
      if (isSpeaking) {
        coreGrad.addColorStop(0, `rgba(255,180,180,${0.95})`);
        coreGrad.addColorStop(0.3, `rgba(255,59,59,${0.8 * glowMult})`);
        coreGrad.addColorStop(0.7, `rgba(255,59,59,${0.2 * glowMult})`);
        coreGrad.addColorStop(1, "rgba(255,0,0,0)");
      } else {
        coreGrad.addColorStop(0, `rgba(220,248,255,${0.97})`);
        coreGrad.addColorStop(0.3, `rgba(32,214,255,${0.85 * glowMult})`);
        coreGrad.addColorStop(0.7, `rgba(32,214,255,${0.2 * glowMult})`);
        coreGrad.addColorStop(1, "rgba(0,180,255,0)");
      }
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * pulseFactor * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking
        ? `rgba(255,80,80,${0.9})`
        : `rgba(32,214,255,${0.9})`;
      ctx.fill();

      // Particles
      particlesRef.current.forEach((p, i) => {
        p.life += 1;
        p.x += p.vx * (isActive ? 1.5 : 1);
        p.y += p.vy * (isActive ? 1.5 : 1);

        if (p.life > p.maxLife) {
          // Reset
          const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + t;
          const r = size * 0.12;
          p.x = cx + Math.cos(angle) * r;
          p.y = cy + Math.sin(angle) * r;
          p.vx = Math.cos(angle) * randomBetween(0.2, 0.7);
          p.vy = Math.sin(angle) * randomBetween(0.2, 0.7);
          p.life = 0;
          p.maxLife = randomBetween(80, 140);
          p.radius = randomBetween(1.5, 3);
        }

        const alpha = Math.max(0, 1 - p.life / p.maxLife) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSpeaking
          ? `rgba(255,100,100,${alpha})`
          : `rgba(32,214,255,${alpha})`;
        ctx.fill();
      });

      // Hex pattern in core
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5 * speedMult);
      ctx.strokeStyle = `rgba(200,240,255,${0.15 * glowMult})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const a2 = ((i + 1) / 6) * Math.PI * 2;
        const hr = size * 0.08;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * hr, Math.sin(a) * hr);
        ctx.lineTo(Math.cos(a2) * hr, Math.sin(a2) * hr);
        ctx.stroke();
      }
      ctx.restore();

      frameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isActive, isSpeaking, size]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: isSpeaking
            ? "radial-gradient(circle, rgba(255,59,59,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(32,214,255,0.1) 0%, transparent 70%)",
          transition: "background 0.5s ease",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: "block" }}
        aria-label="JARVIS Arc Reactor"
      />
    </div>
  );
}
