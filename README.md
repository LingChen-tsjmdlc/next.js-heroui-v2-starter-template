# Next.js + HeroUI v2 Starter Template (Fork HeroUI v2 template)

开箱即用的 **Next.js 15** 前端开发模板，集成动画引擎、多种动态背景效果、UI 组件库和完整的亮暗主题系统。

> 🌙 默认暗色模式 · View Transition 平滑切换

---

## ✨ 特性

- **Next.js 15** — App Router + Turbopack
- **TypeScript** — 端到端类型安全
- **Tailwind CSS v4** + **HeroUI v2**
- **GSAP / Motion** — 滚动驱动动画
- **亮暗主题自适应** — 背景粒子参数跟随主题自动调节
- **Standalone 构建** — 适合容器化部署
- **Husky + ESLint + Prettier**

---

## 🛠️ 技术栈

| 类别 | 技术                               |
| ---- | ---------------------------------- |
| 框架 | Next.js 15 (App Router) + React 18 |
| 语言 | TypeScript 5.6                     |
| 样式 | Tailwind CSS v4                    |
| UI   | HeroUI v2                          |
| 动画 | GSAP + ScrollTrigger / Motion      |
| 3D   | Three.js                           |
| 图标 | Iconify                            |
| 主题 | next-themes                        |

---

## 📁 项目结构

```
├── app/                          # Next.js App Router 目录
│   ├── providers.tsx             # 全局 Provider：HeroUI + next-themes（默认 dark）
│   ├── layout.tsx                # 根布局：字体、metadata、全局 HTML 结构
│   └── page.tsx                  # 首页：所有板块内容 + 背景组件集成
│
├── components/                   # 组件目录
│   ├── aceternity-ui/            # Aceternity UI 风格组件
│   ├── magic-ui/                 # Magic UI 风格组件
│   ├── reactbits-ui/             # React Bits 风格组件
│   ├── navbar.tsx                # 顶部导航栏（基于 HeroUI Navbar）
│   ├── theme-switch.tsx          # 主题切换按钮（View Transition API 涟漪动画）
│   └── primitives.tsx            # 基础 UI 原封装
│
├── config/
│   └── site.ts                   # 站点配置：名称、描述、导航链接、社交链接
│
├── lib/
│   └── utils.ts                  # 工具函数：cn()（className 合并）
│
├── styles/
│   └── globals.css               # 全局样式、Tailwind v4 导入、CSS 变量
│
├── types/
│   └── index.ts                  # 共享 TypeScript 类型定义
│
├── tailwind.config.ts            # Tailwind CSS 配置
├── next.config.ts                # Next.js 配置（output: "standalone"）
├── postcss.config.mjs            # PostCSS 配置
├── tsconfig.json                 # TypeScript 配置
├── eslint.config.ts              # ESLint 配置
├── .prettierrc                   # Prettier 配置
├── .husky/                       # Git hooks（提交前自动 lint / format）
│
└── public/
    └── favicon.ico               # 网站图标
```

---

## 🚀 使用

### 1. 环境要求

- **Node.js** ≥ 18.17
- **pnpm**（推荐） / npm / yarn / bun

### 2. 安装依赖

```bash
pnpm install
```

### 2.5 配置环境变量

```bash
cp .env.example .env
```

> ⚠️ 项目使用了 `lib/http.ts` 封装的请求模块，**必须配置环境变量**才能正常调用后端 API。请复制 `.env.example` 为 `.env`，并根据实际后端地址修改 `NEXT_PUBLIC_API_BASE_URL`。

> ⚠️ pnpm 用户请确保项目根目录 `.npmrc` 包含：
>
> ```
> public-hoist-pattern[]=*@heroui/*
> ```

### 3. 启动开发

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看页面。

开发服务器使用 **Turbopack**，支持热更新和快速刷新。

### 4. 打包

```bash
pnpm build
```

项目已配置 `output: "standalone"`（`next.config.ts`），打包后会生成自包含的 `.next/standalone/` 目录。

### 5. 运行生产版本

```bash
# 方式一：直接运行 standalone 产物（推荐，无需完整 node_modules）
node .next/standalone/server.js

# 方式二：使用 next start
pnpm start
```

---

## 📝 规范

```bash
pnpm tsc --noEmit    # 类型检查（必须通过）
pnpm lint --fix      # Lint 自动修复
```

---

MIT License
