"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import SpotlightCard from "@/components/reactbits-ui/SpotlightCard";
import { BackgroundLines } from "@/components/aceternity-ui/BackgroundLines";
import { RetroGrid } from "@/components/magic-ui/RetroGrid";
import FloatingLines from "@/components/reactbits-ui/FloatingLines";
import { Vortex } from "@/components/aceternity-ui/Vortex";

/* ================================================================
   数据定义
   ================================================================ */

const features = [
  {
    icon: "simple-icons:gsap",
    title: "Animation First",
    description:
      "GSAP + Motion pre-configured. Timeline, scroll-triggered, and layout animations out of the box.",
    spotlight: "rgba(0, 102, 255, 0.15)" as const,
  },
  {
    icon: "ph:palette-fill",
    title: "Component Rich",
    description: "HeroUI base with Aceternity UI, Magic UI & React Bits patterns ready to drop in.",
    spotlight: "rgba(82, 82, 255, 0.15)" as const,
  },
  {
    icon: "ph:wrench-fill",
    title: "Developer Toolkit",
    description:
      "Pre-built http.ts client, token manager, cookie helpers — skip boilerplate every time.",
    spotlight: "rgba(16, 185, 129, 0.15)" as const,
  },
  {
    icon: "ph:code-block-fill",
    title: "App Router Structure",
    description:
      "Clean layout.tsx / providers.tsx / page.tsx architecture. Server & Client split done right.",
    spotlight: "rgba(245, 158, 11, 0.15)" as const,
  },
  {
    icon: "ph:package-fill",
    title: "Husky + ESLint + Prettier",
    description:
      "Pre-commit hooks, strict linting rules, auto-formatting on save — commit with confidence.",
    spotlight: "rgba(239, 68, 68, 0.15)" as const,
  },
  {
    icon: "ph:moon-stars-fill",
    title: "Dark Mode Ready",
    description:
      "next-themes integrated with smooth transitions. Dark by default, one toggle away.",
    spotlight: "rgba(137, 123, 161, 0.15)" as const,
  },
];

const techStack = [
  {
    name: "Next.js 15",
    desc: "App Router · Turbopack · RSC",
    icon: "logos:nextjs-icon",
    color: "#000000",
  },
  {
    name: "HeroUI",
    desc: "Modern UI component library",
    icon: "simple-icons:heroui",
    color: "#0052FF",
  },
  {
    name: "GSAP",
    desc: "Professional-grade web animation",
    icon: "simple-icons:gsap",
    color: "#08CE51",
  },
  { name: "Motion", desc: "Framer Motion successor", icon: "devicon:motion", color: "#fff42b" },
  {
    name: "Tailwind v4",
    desc: "Utility-first CSS framework",
    icon: "logos:tailwindcss-icon",
    color: "#06B6D4",
  },
  {
    name: "TypeScript",
    desc: "End-to-end type safety",
    icon: "logos:typescript-icon",
    color: "#3178C6",
  },
];

const uiLibraries = [
  { name: "Aceternity UI", tagline: "Animated UI components", icon: "ph:sparkle-fill" },
  { name: "Magic UI", tagline: "Magical animated components", icon: "ph:magic-wand-fill" },
  { name: "React Bits", tagline: "Copy-paste animations & effects", icon: "ph:atom-fill" },
  { name: "Iconify", tagline: "100,000+ open-source icons", icon: "ph:stack-fill" },
];

/* ================================================================
   标题拆分组件（支持逐字动画）
   ================================================================ */

/** 将文本按字符拆分为带 <span> 的 JSX，每个字符可独立动画 */
function SplitText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={className} aria-label={children}>
      {Array.from(children).map((char, i) => (
        <span key={`${char}-${i}`} className="inline-block" data-char-index={i}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

/* ================================================================
   页面组件
   ================================================================ */

export default function IndexPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 避免 SSR 不匹配，挂载后再显示内容
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!heroRef.current) return;

    // 注册 GSAP 插件
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      /* ===== Badge：弹性入场 ===== */
      gsap.fromTo(
        ".hero-badge",
        { y: -30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: ".hero-badge",
            start: "top 85%",
            toggleActions: "restart none none none", // 每次从上方进入都重播
          },
        },
      );

      /* ===== 标题文字：逐字复杂动画 ===== */
      if (titleRef.current) {
        const chars = titleRef.current.querySelectorAll("[data-char-index]");

        // 初始状态隐藏所有字符
        gsap.set(chars, {
          opacity: 0,
          y: 60,
          rotationX: -80,
          scale: 0.6,
          transformOrigin: "50% 50% -30px",
        });

        // 逐字入场（交错 + 弹性）
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 0.55,
          ease: "back.out(2)",
          stagger: {
            each: 0.03,
            from: "start",
          },
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "restart none none reset",
          },
        });
      }

      /* ===== 副标题：淡入 + 上滑 ===== */
      gsap.fromTo(
        ".hero-subtitle > *",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top 85%",
            toggleActions: "restart none none reset",
          },
        },
      );

      /* ===== CTA 按钮：依次弹出 ===== */
      gsap.fromTo(
        ".hero-cta > *",
        { y: 20, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
            toggleActions: "restart none none reset",
          },
        },
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  if (!mounted) {
    return (
      <DefaultLayout>
        <section ref={heroRef} className="flex items-center justify-center min-h-[80vh]" />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      {/* ===== Hero Section — BackgroundLines 背景 ===== */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden"
      >
        {/* 动态线条背景 */}
        <div className="absolute inset-0 -z-10">
          <BackgroundLines className="!h-full !bg-transparent">
            <></>
          </BackgroundLines>
        </div>

        {/* Badge */}
        <div
          ref={badgeRef}
          className="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-default-200 px-5 py-2 text-sm text-default-500"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          Personal Starter Template — Fork &amp; Build
        </div>

        {/* Title — 使用 SplitText 实现逐字动画 */}
        <h1 ref={titleRef} className="hero-title max-w-4xl text-center">
          <span className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight inline-flex flex-wrap justify-center items-baseline gap-x-2">
            <SplitText>Ship </SplitText>
            <span className="bg-gradient-to-r from-primary via-secondary to-danger bg-clip-text text-transparent">
              <SplitText>Faster.</SplitText>
            </span>
            <SplitText> Animate </SplitText>
            <span className="bg-gradient-to-r from-warning to-danger bg-clip-text text-transparent">
              <SplitText>Smoother.</SplitText>
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="hero-subtitle mt-8 text-lg md:text-xl text-default-400 max-w-2xl mx-auto leading-relaxed text-center"
        >
          <span>My personal </span>
          <span className="text-foreground font-medium">Next.js 15</span>
          <span> starter, packed with </span>
          <span className="font-medium text-primary">HeroUI</span>,<span> </span>
          <span className="font-medium text-secondary">GSAP</span>,<span> and </span>
          <span className="font-medium text-danger">Motion</span>.<span>.</span>
          <br />
          <span>Built for developers who care about both code quality and visual polish.</span>
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="hero-cta mt-12 flex flex-wrap gap-4 justify-center">
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Features
            <Icon icon="ph:arrow-right-bold" width={16} />
          </a>
          <a
            href="#tech-stack"
            className="inline-flex items-center gap-2 rounded-full border border-default-300 px-7 py-3 text-sm font-semibold text-foreground hover:bg-default-100 transition-all"
          >
            Tech Stack
            <Icon icon="ph:arrow-down-bold" width={16} />
          </a>
        </div>
      </section>

      {/* ===== Features Section — Vortex 漩涡绝对定位背景 ===== */}
      <section
        id="features"
        className="relative py-24 px-6 max-w-7xl mx-auto w-full overflow-hidden bg-zinc-100/80 dark:bg-transparent"
      >
        {/* Vortex 漩涡粒子背景（baseHue=120 绿色调） */}
        <div className="absolute inset-0 -z-10">
          <Vortex
            darkBackgroundColor="#000000"
            lightBackgroundColor="#fcfcfc"
            rangeY={800}
            particleCount={500}
            baseHue={120}
            containerClassName="h-full w-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white">
            Why This Template?
          </h2>
          <p className="mt-3 text-default-600 dark:text-white/60 text-lg max-w-xl mx-auto">
            Everything I need in every new project — nothing I don&apos;t.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-x-[5%] gap-y-6 relative z-10">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="w-[30%] min-w-[260px] max-w-[320px]"
            >
              <SpotlightCard
                spotlightColor={feature.spotlight}
                className="!border-default-200 dark:!border-white/20 !bg-default-100/50 dark:!bg-black/20 !backdrop-blur-xl !p-6 hover:!shadow-lg hover:dark:!shadow-cyan-500/10 transition-shadow h-full flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="rounded-xl p-3 text-white flex-shrink-0"
                    style={{ backgroundColor: feature.spotlight.replace(/, 0.15\)$/, ", 1)") }}
                  >
                    <Icon icon={feature.icon} width={26} height={26} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-default-500 dark:text-white/50 leading-relaxed mt-3 flex-1">
                  {feature.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Tech Stack Section — Vortex 绝对定位背景 ===== */}
      <section
        id="tech-stack"
        className="relative py-24 px-6 max-w-7xl mx-auto w-full overflow-hidden mt-40 bg-zinc-100/80 dark:bg-transparent"
      >
        {/* Vortex 漩涡粒子背景（无 baseHue 默认彩虹色） */}
        <div className="absolute inset-0 -z-10">
          <Vortex
            darkBackgroundColor="#000000"
            lightBackgroundColor="#fcfcfc"
            rangeY={800}
            particleCount={500}
            baseHue={220}
            containerClassName="h-full w-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white">
            Tech Stack
          </h2>
          <p className="mt-3 text-default-600 dark:text-white/60 text-lg max-w-xl mx-auto">
            Core technologies that power every project.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-x-[5%] gap-y-6 relative z-10">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="w-[30%] min-w-[200px] max-w-[320px]"
            >
              <Card
                isPressable
                className="border border-default-200 dark:border-white/20 bg-default-100/50 dark:bg-black/20 backdrop-blur-xl hover:border-default-300 dark:hover:border-white/30 hover:shadow-lg transition-all w-full"
              >
                <CardBody className="flex flex-col items-center text-center py-6 px-5 gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                    style={{ backgroundColor: `${tech.color}12` }}
                  >
                    <Icon icon={tech.icon} width={36} height={36} />
                  </div>
                  <h3 className="font-bold text-lg tracking-tight text-foreground dark:text-white">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-default-400 dark:text-white/50 leading-relaxed">
                    {tech.desc}
                  </p>
                  <div
                    className="w-10 h-1 rounded-full mt-1"
                    style={{ backgroundColor: tech.color }}
                  />
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== UI Libraries Section — RetroGrid 网格背景 ===== */}
      <section className="relative overflow-hidden py-24 px-6 max-w-7xl mx-auto w-full ">
        {/* 透视网格背景 */}
        <RetroGrid
          className="!z-0 [&>div:last-child]:bg-transparent"
          angle={65}
          cellSize={60}
          opacity={0.35}
          lightLineColor="rgba(30, 41, 59, 0.35)"
          darkLineColor="rgba(165, 180, 252, 0.3)"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold">UI Component Ecosystem</h2>
          <p className="mt-3 text-default-400 text-lg max-w-xl mx-auto">
            HeroUI as foundation, plus my go-to animation component libraries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {uiLibraries.map((lib, i) => (
            <motion.div
              key={lib.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 dark:border-white/10 hover:shadow-lg transition-all text-center py-6 shadow-sm">
                <CardBody>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                    <Icon icon={lib.icon} width={28} height={28} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{lib.name}</h3>
                  <p className="text-sm text-default-400 mt-1">{lib.tagline}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== Developer Utilities Section — FloatingLines 浮动线条背景 ===== */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden">
          {/* 浮动波浪线条背景 */}
          <div className="absolute inset-0 -z-10">
            <FloatingLines
              linesGradient={["#6366f1", "#8b5cf6", "#a855f7", "#d946ef"]}
              enabledWaves={["top", "middle", "bottom"]}
              lineCount={[4, 5, 6]}
              lineDistance={[10, 15, 18]}
              animationSpeed={1.2}
              interactive={true}
              parallax={true}
              parallaxStrength={0.15}
              bendRadius={8}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="p-10 md:p-16 text-center border border-divider/0 relative z-10"
          >
            <h2 className="text-default-100 dark:text-default-900 text-3xl md:text-4xl font-bold mb-4">
              Pre-built Developer Utilities
            </h2>
            <p className="text-default-300 dark:text-default-700 text-lg max-w-2xl mx-auto mb-10">
              Skip the repetitive setup. These come included in{" "}
              <code className="px-2 py-0.5 rounded-md bg-content2 text-primary text-sm font-mono">
                lib/
              </code>
              :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="bg-content2 border border-divider">
                <CardBody className="p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="ph:terminal-window-fill" width={20} className="text-primary" />
                    <code className="text-primary font-mono font-bold">lib/http.ts</code>
                  </div>
                  <p className="text-sm text-default-400 mt-2">
                    Fetch wrapper with auto-token injection, error handling, response typing, and
                    request/response interceptors.
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-content2 border border-divider">
                <CardBody className="p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="ph:key-fill" width={20} className="text-secondary" />
                    <code className="text-secondary font-mono font-bold">lib/token.ts</code>
                  </div>
                  <p className="text-sm text-default-400 mt-2">
                    Token management with localStorage persistence, auto-refresh logic, and
                    cookie-sync support.
                  </p>
                </CardBody>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer CTA ===== */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-default-400 text-sm uppercase tracking-widest mb-3">Ready to build?</p>
          <h2 className="text-2xl md:text-3xl font-bold">
            Fork it. Make it yours. <span className="text-primary">Ship it.</span>
          </h2>
        </motion.div>
      </section>
    </DefaultLayout>
  );
}
