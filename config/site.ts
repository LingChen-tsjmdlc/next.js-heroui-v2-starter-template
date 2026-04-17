export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "My Starter Template",
  description:
    "Personal Next.js 15 starter — powered by HeroUI, GSAP & Motion. Built for developers who love smooth animations.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "Tech Stack", href: "/#tech-stack" },
  ],
  links: {
    github: "",
    docs: "https://heroui.com",
  },
};
