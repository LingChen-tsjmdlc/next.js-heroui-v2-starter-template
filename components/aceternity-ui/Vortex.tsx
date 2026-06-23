"use client";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface VortexProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  /** 暗色模式 Canvas 背景色，默认 "#141414" */
  darkBackgroundColor?: string;
  /** 亮色模式 Canvas 背景色，默认 "#fcfcfc" */
  lightBackgroundColor?: string;
}

export const Vortex = (props: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef(null);
  const animationFrameId = useRef<number>();
  const particleCount = props.particleCount || 700;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = props.rangeY || 100;
  const baseTTL = 50;
  const rangeTTL = 150;
  const baseSpeed = props.baseSpeed || 0.0;
  const rangeSpeed = props.rangeSpeed || 1.5;
  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 2;
  const baseHue = props.baseHue || 220;
  const rangeHue = 100;
  const noiseSteps = 3;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;

  // ===== 主题感知背景色 =====
  const { resolvedTheme } = useTheme();
  const [backgroundColor, setBackgroundColor] = useState(
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
      ? (props.darkBackgroundColor ?? "#141414")
      : (props.lightBackgroundColor ?? "#fcfcfc"),
  );

  // 主题切换时更新 Canvas 背景色
  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }
    const newBg =
      resolvedTheme === "dark"
        ? (props.darkBackgroundColor ?? "#141414")
        : (props.lightBackgroundColor ?? "#fcfcfc");
    setBackgroundColor(newBg);
  }, [resolvedTheme, props.darkBackgroundColor, props.lightBackgroundColor]);

  // ===== 主题自适应光晕强度 =====
  // 亮色模式：粒子更粗、光晕更强、亮度更高，补偿浅色背景的对比度不足
  const glowBrightness = resolvedTheme === "light" ? "220%" : "200%";
  const particleLightness = resolvedTheme === "light" ? "55%" : "60%";
  const glowBlur = resolvedTheme === "light" ? 12 : 8;
  const particleRadiusMult = resolvedTheme === "light" ? 1.8 : 1;
  const particleAlphaBoost = resolvedTheme === "light" ? 0.25 : 0;

  let tick = 0;
  const noise3D = createNoise3D();
  let particleProps = new Float32Array(particlePropsLength);
  const center: [number, number] = [0, 0];

  // TAU 在 noise3D 的角度计算里使用；HALF_PI / TO_RAD 暂未使用，故移除以满足 lint 规则
  const TAU: number = 2 * Math.PI;
  const rand = (n: number): number => n * Math.random();
  const randRange = (n: number): number => n - rand(2 * n);
  const fadeInOut = (t: number, m: number): number => {
    const hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };
  const lerp = (n1: number, n2: number, speed: number): number => (1 - speed) * n1 + speed * n2;

  const setup = () => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    const container = containerRef.current;
    if (canvas && offscreen && container) {
      resize(canvas, offscreen);
      initParticles();
      draw();
    }
  };

  const initParticles = () => {
    tick = 0;
    particleProps = new Float32Array(particlePropsLength);

    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }
  };

  const initParticle = (i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // 所有变量在声明后不再重新赋值，统一使用 const 满足 prefer-const
    const x = rand(canvas.width);
    const y = center[1] + randRange(rangeY);
    const vx = 0;
    const vy = 0;
    const life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const speed = baseSpeed + rand(rangeSpeed);
    const radius = baseRadius + rand(rangeRadius);
    const hue = baseHue + rand(rangeHue);

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  };

  /**
   * 分层渲染（解决亮色模式下背景被 brightness 提亮成纯白的问题）：
   *
   * ┌─────────────────────────────────────────┐
   * │  主 Canvas（可见）                       │
   * │  1. clearRect → 清空                    │
   * │  2. fillRect(backgroundColor) → 填背景   │
   * │  3. drawImage(offscreen, lighter) → 合成 │
   * └─────────────────────────────────────────┘
   *
   * ┌─────────────────────────────────────────┐
   * │  离屏 Canvas（不可见）                    │
   * │  1. clearRect → 清空                    │
   * │  2. drawParticles → 画粒子线段           │
   * │  3. renderGlow → blur+brightness+lighter │
   * │  4. renderToScreen → lighter             │
   * └─────────────────────────────────────────┘
   *
   * 关键：背景色只在主 Canvas 上，离屏层只含粒子。
   * renderGlow / renderToScreen 的 brightness(200%)
   * 只作用于粒子，不会把背景提亮成纯白。
   */
  const draw = () => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (!canvas || !offscreen) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const offCtx = offscreen.getContext("2d");
    if (!ctx || !offCtx) {
      return;
    }

    tick++;

    // ── 主 Canvas：透明背景（不填充颜色） ──
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── 离屏 Canvas：粒子 + 光晕全部在这里计算 ──
    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    drawParticles(offCtx);
    renderGlow(offscreen, offCtx);
    renderToScreen(offscreen, offCtx);

    // ── 合成：将离屏层叠加到主 Canvas ──
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(offscreen, 0, 0);
    ctx.restore();

    animationFrameId.current = window.requestAnimationFrame(() => draw());
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i, ctx);
    }
  };

  const updateParticle = (i: number, ctx: CanvasRenderingContext2D) => {
    const canvas = offscreenRef.current!;
    if (!canvas) {
      return;
    }

    const i2 = 1 + i,
      i3 = 2 + i,
      i4 = 3 + i,
      i5 = 4 + i,
      i6 = 5 + i,
      i7 = 6 + i,
      i8 = 7 + i,
      i9 = 8 + i;
    // life 需要 ++ 累加保留 let，其余变量在使用后不再修改，统一改为 const
    const x = particleProps[i];
    const y = particleProps[i2];
    const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    const vx = lerp(particleProps[i3], Math.cos(n), 0.5);
    const vy = lerp(particleProps[i4], Math.sin(n), 0.5);
    let life = particleProps[i5];
    const ttl = particleProps[i6];
    const speed = particleProps[i7];
    const x2 = x + vx * speed;
    const y2 = y + vy * speed;
    const radius = particleProps[i8];
    const hue = particleProps[i9];

    drawParticle(x, y, x2, y2, life, ttl, radius, hue, ctx);

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    (checkBounds(x, y, canvas) || life > ttl) && initParticle(i);
  };

  const drawParticle = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    life: number,
    ttl: number,
    radius: number,
    hue: number,
    ctx: CanvasRenderingContext2D,
  ) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius * particleRadiusMult;
    const alpha = Math.min(1, fadeInOut(life, ttl) + particleAlphaBoost);
    ctx.strokeStyle = `hsla(${hue},100%,${particleLightness},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };

  const checkBounds = (x: number, y: number, canvas: HTMLCanvasElement) => {
    return x > canvas.width || x < 0 || y > canvas.height || y < 0;
  };

  const resize = (canvas: HTMLCanvasElement, offscreen: HTMLCanvasElement) => {
    const { innerWidth, innerHeight } = window;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    // 离屏 Canvas 同步尺寸
    offscreen.width = innerWidth;
    offscreen.height = innerHeight;

    center[0] = 0.5 * canvas.width;
    center[1] = 0.5 * canvas.height;
  };

  /** 离屏 Canvas 上执行光晕效果（blur + brightness + lighter） */
  const renderGlow = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.filter = `blur(${glowBlur}px) brightness(${glowBrightness})`;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.filter = `blur(${glowBlur - 4}px) brightness(${glowBrightness})`;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };

  /** 离屏 Canvas 上最终合成到屏幕 */
  const renderToScreen = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    const offscreen = offscreenRef.current;
    if (canvas && offscreen) {
      resize(canvas, offscreen);
    }
  };

  useEffect(() => {
    setup();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [backgroundColor, resolvedTheme]); // 主题/背景色变化时重置 Canvas

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-transparent"
      >
        {/* 主 Canvas：背景色 + 合成后的粒子层 */}
        <canvas ref={canvasRef} />
        {/* 离屏 Canvas：纯粒子 + 光晕计算，CSS 隐藏不显示 */}
        <canvas ref={offscreenRef} className="hidden" />
      </motion.div>

      <div className={cn("relative z-10", props.className)}>{props.children}</div>
    </div>
  );
};
