"use client";

import { FC, useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { flushSync } from "react-dom";
import { Icon } from "@iconify/react";

type Theme = "light" | "dark";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
  rippleDuration?: number;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
  rippleDuration = 600,
}) => {
  const { setTheme, resolvedTheme } = useTheme();
  const _isSSR = useIsSSR();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [locked, setLocked] = useState(false);

  // ================================================================
  // 🌙 初始化主题状态
  // ================================================================
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") {
      return;
    }

    const raw = localStorage.getItem("theme-preference");
    const saved = raw === "light" || raw === "dark" ? (raw as Theme) : null;
    const effectiveTheme = saved || "light";

    setTheme(effectiveTheme);
    setIsSelected(effectiveTheme === "light");

    try {
      localStorage.setItem("theme-preference", effectiveTheme);
    } catch {}
  }, [setTheme]);

  // ================================================================
  // ✨ 切换主题 + 涟漪动画核心逻辑
  // ================================================================
  const toggleTheme = async () => {
    if (!mounted || locked || !wrapperRef.current) {
      return;
    }

    const newTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    const newIsSelected = newTheme === "light";

    flushSync(() => {
      setIsSelected(newIsSelected);
    });

    setLocked(true);

    if ("startViewTransition" in document) {
      try {
        const transition = (document as any).startViewTransition(() => {
          flushSync(() => {
            setTheme(newTheme);
            try {
              localStorage.setItem("theme-preference", newTheme);
            } catch {}
          });
        });

        await transition.ready;

        const rect = wrapperRef.current.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: rippleDuration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );

        setTimeout(() => setLocked(false), rippleDuration + 100);
      } catch (e) {
        console.warn("ViewTransition error:", e);
        setTheme(newTheme);
        setTimeout(() => setLocked(false), 200);
      }
    } else {
      // 不支持 View Transition 的情况
      console.log("不支持 View Transition 的情况");
      setTheme(newTheme);
      try {
        localStorage.setItem("theme-preference", newTheme);
      } catch {}
      setTimeout(() => setLocked(false), 200);
    }
  };

  // ================================================================
  // 🧩 Switch UI 逻辑
  // ================================================================
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected,
    "aria-label": `Switch to ${isSelected ? "dark" : "light"} mode`,
    onChange: toggleTheme,
  });

  if (!mounted) {
    return (
      <div className={clsx("px-px", className)}>
        <div className="w-6 h-6 flex items-center justify-center">
          <Icon icon="mynaui:sun-solid" className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px cursor-pointer select-none",
          "transition-transform duration-300 ease-in-out hover:scale-110",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      <div
        ref={wrapperRef}
        {...getWrapperProps()}
        onClick={(e) => {
          e.preventDefault();
          toggleTheme();
        }}
        role="button"
        aria-pressed={isSelected}
        className={slots.wrapper({
          class: clsx(
            "w-auto h-auto p-1 rounded-full flex items-center justify-center",
            "transition-all duration-300 pointer-events-auto",
            "bg-transparent hover:bg-transparent",
            "group-data-[selected=true]:bg-transparent",
            "border-0 shadow-none",
            classNames?.wrapper,
          ),
        })}
      >
        <div className="relative w-6 h-6">
          {/* ☀️ 亮色图标 */}
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]",
              {
                "opacity-0 scale-50 -rotate-180": !isSelected,
                "opacity-100 scale-110 rotate-0": isSelected,
              },
            )}
          >
            <Icon
              className={clsx(
                "w-6 h-6 transition-colors duration-300",
                "text-yellow-500 hover:text-yellow-400",
              )}
              icon="mynaui:sun-solid"
            />
          </div>

          {/* 🌙 暗色图标 */}
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)]",
              {
                "opacity-0 scale-50 rotate-180": isSelected,
                "opacity-100 scale-110 rotate-0": !isSelected,
              },
            )}
          >
            <Icon
              className={clsx(
                "w-6 h-6 transition-colors duration-300",
                "text-indigo-300 hover:text-indigo-200",
              )}
              icon="solar:moon-bold"
            />
          </div>
        </div>
      </div>
    </Component>
  );
};
