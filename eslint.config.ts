/**
 * ESLint Flat Config（扁平化配置）
 *
 * 适用于 Next.js + React + TypeScript 项目
 */

// ============================================================
// 依赖导入
// ============================================================

import { defineConfig, globalIgnores } from "eslint/config";            // ESLint 核心配置 API：defineConfig 定义配置、globalIgnores 定义全局忽略
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";    // 兼容层：修复旧版配置格式，使其能在 Flat Config 中使用
import react from "eslint-plugin-react";                                // React 代码规范插件
import unusedImports from "eslint-plugin-unused-imports";               // 自动移除未使用的 import 语句
import _import from "eslint-plugin-import";                             // Import 语句排序与规范插件
// eslint-disable-next-line @typescript-eslint/no-require-imports
const typescriptEslint = require("@typescript-eslint/eslint-plugin");   // TypeScript 专用 lint 规则（使用 require 避免 Flat Config 类型不兼容问题）
import jsxA11Y from "eslint-plugin-jsx-a11y";                           // JSX 无障碍访问（a11y）规范插件
import prettier from "eslint-plugin-prettier";                          // 将 Prettier 格式化规则集成到 ESLint 中
import globals from "globals";                                          // 内置全局变量定义（浏览器 / Node 等）
import tsParser from "@typescript-eslint/parser";                       // TypeScript 解析器，让 ESLint 能理解 TS 语法
import path from "node:path";                                           // Node.js 路径处理模块
import { fileURLToPath } from "node:url";                               // 将 import.meta.url 转换为文件路径
import js from "@eslint/js";                                            // ESLint 内置的推荐/全量规则集
import { FlatCompat } from "@eslint/eslintrc";                          // 兼容工具：将旧版 extends 字符串格式转换为 Flat Config 数组

// ============================================================
// 路径初始化
// ============================================================

const __filename = fileURLToPath(import.meta.url);  // 获取当前文件的绝对路径
const __dirname = path.dirname(__filename);         // 获取当前文件所在目录的绝对路径

// 创建 FlatCompat 实例
const compat = new FlatCompat({
    baseDirectory: __dirname,                   // 基准目录，用于解析相对路径
    recommendedConfig: js.configs.recommended,  // ESLint 内置推荐规则集
    allConfig: js.configs.all,                  // ESLint 内置全量规则集（包含所有规则）
});

// ============================================================
// 导出配置
// ============================================================

export default defineConfig([
    // ----------------------------------------------------------
    // 一、全局忽略（这些文件/目录不会被 ESLint 检查）
    // ----------------------------------------------------------
    globalIgnores([
        ".now/*",           // Vercel Now 部署临时文件
        "**/*.css",         // 样式文件（由其他工具检查）
        "**/.changeset",    // Changeset 版本管理配置
        "**/dist",          // 构建输出目录
        "esm/*",            // ESM 构建产物
        "public/*",         // 静态资源目录
        "tests/*",          // 测试文件目录
        "scripts/*",        // 脚本工具目录
        "**/*.config.js",   // JS 配置文件（非源码）
        "**/.DS_Store",     // macOS 系统文件
        "**/node_modules",  // 依赖包目录
        "**/coverage",      // 测试覆盖率报告
        "**/.next",         // Next.js 构建缓存
        "**/build",         // 通用构建输出
        "!**/.commitlintrc.cjs",   // Git 提交信息规范配置（需要检查）
        "!**/.lintstagedrc.cjs",   // Lint-staged 配置（需要检查）
        "!**/jest.config.js",      // Jest 测试框架配置（需要检查）
        "!**/plopfile.js",         // Plop 代码生成器配置（需要检查）
        "!**/react-shim.js",       // React 兼容性垫片（需要检查）
        "!**/tsup.config.ts",      // Tsup 打包工具配置（需要检查）
        "lib/http.ts"              // HTTP 封装库（独立维护，跳过 lint 检查）
    ]),

    // ----------------------------------------------------------
    // 二、核心配置
    // ----------------------------------------------------------
    {
        // ===== 继承的规则集（通过 compat 兼容层转换）=====
        extends: fixupConfigRules(
            compat.extends(
                "plugin:react/recommended",            // React 推荐规则：JSX 语法、组件规范等
                "plugin:prettier/recommended",         // Prettier 推荐规则：格式化优先，关闭冲突的 lint 规则
                "plugin:react-hooks/recommended",      // React Hooks 规则：确保 Hooks 调用顺序正确
                "plugin:jsx-a11y/recommended",         // JSX 无障碍规则：确保组件可被屏幕阅读器等辅助技术识别
                "plugin:@next/next/recommended",       // Next.js 推荐规则：Image 组件使用、Head 管理等最佳实践
            ),
        ),

        // ===== 注册插件 =====
        plugins: {
            react: fixupPluginRules(react),                    // React 插件（需 fixup 以兼容 Flat Config）
            "unused-imports": unusedImports,                   // 未使用 import 自动移除插件
            import: fixupPluginRules(_import),                 // Import 排序与规范插件（需 fixup）
            "@typescript-eslint": typescriptEslint,            // TypeScript 规则插件（使用 require 加载）
            "jsx-a11y": fixupPluginRules(jsxA11Y),             // JSX 无障碍插件（需 fixup）
            prettier: fixupPluginRules(prettier),              // Prettier 格式化插件（需 fixup）
        },

        // ===== 语言选项 =====
        languageOptions: {
            // 全局变量定义
            globals: {
                // 浏览器全局变量设为 "off"（不报错），因为 Next.js 会自动处理
                ...Object.fromEntries(
                    Object.entries(globals.browser).map(([key]) => [key, "off"]),
                ),
                ...globals.node, // 启用 Node.js 全局变量（如 __dirname、require 等）
            },

            parser: tsParser,              // 使用 TypeScript 解析器
            ecmaVersion: 12,               // ECMAScript 2021 (ES12) 语法标准
            sourceType: "module",          // 使用 ES Module 模块系统（import/export）

            // 解析器额外选项
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,             // 支持 JSX 语法（React 组件语法）
                },
            },
        },

        // ===== 插件设置项 =====
        settings: {
            react: {
                version: "detect",         // 自动检测项目中的 React 版本
            },
            // Import 插件的路径解析器配置
            "import/resolver": {
                typescript: {
                    project: path.join(__dirname, "tsconfig.json"), // 使用项目的 tsconfig.json 进行路径解析
                },
                alias: {                  // 路径别名映射（配合 webpack/tsconfig 的 alias）
                    map: [
                        ["@", "./"],                      // @ 映射到项目根目录
                        ["@/components", "./components"],  // @/components 映射到 components 目录
                    ],
                    extensions: [".js", ".jsx", ".ts", ".tsx"], // 解析时尝试的文件扩展名
                },
            },
        },

        // ===== 生效的文件范围（仅检查 .ts 和 .tsx 文件）=====
        files: ["**/*.ts", "**/*.tsx"],

        // ===== 自定义规则覆盖 =====
        rules: {
            // --------------------------------------------------
            // React 相关规则
            // --------------------------------------------------

            /**
             * react/no-unknown-property — 禁止在 DOM 元素上使用未知的 HTML 属性
             * 忽略 intensity / position 属性（用于 Three.js / 3D 场景渲染）
             */
            "react/no-unknown-property": [
                "error",
                { ignore: ["intensity", "position"] },
            ],

            /**
             * no-console — 是否允许 console 语句
             * 设为 off：开发阶段允许使用 console.log 等进行调试
             */
            "no-console": "off",

            /**
             * react/prop-types — 要求为 React 组件 props 定义 PropTypes 类型检查
             * 设为 off：使用 TypeScript 后，类型已由接口/类型定义保证，不再需要 prop-types
             */
            "react/prop-types": "off",

            /**
             * react/jsx-uses-react — 在 JSX 中使用 JSX 时必须导入 React
             * react/react-in-jsx-scope — JSX 作用域中必须存在 React 变量
             * 均设为 off：React 17+ 的 JSX Transform 不再需要显式 import React
             */
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",

            /**
             * react-hooks/exhaustive-deps — useEffect 等Hooks的依赖数组必须完整
             * 设为 off：某些场景下刻意省略依赖（如事件绑定只执行一次），避免误报干扰开发
             */
            "react-hooks/exhaustive-deps": "off",

            // --------------------------------------------------
            // 无障碍访问（a11y）相关规则
            // --------------------------------------------------

            /**
             * jsx-a11y/click-events-have-key-events — 可点击元素必须有键盘事件支持
             * 设为 off：某些交互式动画/拖拽组件不需要键盘支持
             */
            "jsx-a11y/click-events-have-key-events": "off",

            /**
             * jsx-a11y/interactive-supports-focus — 交互式元素必须可获得焦点
             * 设为 off：部分自定义交互组件（如拖拽、滑动）不需要 focus
             */
            "jsx-a11y/interactive-supports-focus": "off",

            /**
             * jsx-a11y/no-static-element-interactions — 静态DOM元素上禁止绑定交互事件
             * 设为 off：Next.js 中常在 div 上绑定 onClick 处理自定义交互
             */
            "jsx-a11y/no-static-element-interactions": "off",

            /**
             * jsx-a11y/iframe-has-title — iframe 元素必须有 title 属性
             * 设为 off：第三方嵌入内容（如视频、地图）通常不受控制
             */
            "jsx-a11y/iframe-has-title": "off",

            /**
             * jsx-a11y/media-has-caption — 音频/视频媒体必须有字幕或说明
             * 设为 off：非正式项目或背景音乐/动效视频无需字幕
             */
            "jsx-a11y/media-has-caption": "off",

            /**
             * jsx-a11y/img-redundant-alt — img 的 alt 文本不应与周围文本重复
             * 设为 off：SEO 和 a11y 有时需要冗余描述以增强可理解性
             */
            "jsx-a11y/img-redundant-alt": "off",

            // --------------------------------------------------
            // Next.js 相关规则
            // --------------------------------------------------

            /**
             * @next/next/no-img-element — 禁止使用原生 <img> 标签（推荐用 next/image）
             * 设为 off：某些场景（如 SVG inline、外部动态图片）用 <img> 更方便
             */
            "@next/next/no-img-element": "off",

            // --------------------------------------------------
            // Prettier（代码格式化）配置
            // --------------------------------------------------

            /**
             * prettier/prettier — Prettier 格式化规则
             * 所有格式化相关的设置统一在此处管理
             */
            "prettier/prettier": ["error", {
                printWidth: 100,          // 每行最大字符数：100
                tabWidth: 2,              // 缩进空格数：2 个空格（非 Tab）
                semi: true,               // 语句末尾加分号
                singleQuote: false,       // 使用双引号（false = 双引号）
                bracketSpacing: true,     // 对象字面量大括号内加空格 { foo: bar }
                arrowParens: "always",    // 箭头函数参数始终加括号 (a) => {}
                endOfLine: "auto",        // 换行符风格：自动（保持文件原有 LF/CRLF）
                bracketSameLine: false,   // JSX 标签的 > 放在新行（false = html 风格换行）
                jsxSingleQuote: false,    // JSX 属性使用双引号
            }],

            // --------------------------------------------------
            // TypeScript / 未使用变量
            // --------------------------------------------------

            /**
             * no-unused-vars — 原生未使用变量检测
             * 先关闭原生版本，再开启 TypeScript 专用版本（对类型更友好）
             */
            "no-unused-vars": "off",

            /**
             * @typescript-eslint/no-unused-vars — TS 版本的未使用变量检测
             * vars: "all" — 检测所有变量声明（let/const/var）
             * args: "after-used" — 函数参数只检查最后一个使用过的参数之后的
             * ignoreRestSiblings: true — 忽略解构中的剩余参数 (...rest)
             * varsIgnorePattern: "^_" — 变量名以 _ 开头的忽略（约定俗成的"有意不用"标记）
             * argsIgnorePattern: "^_" — 参数名以 _ 开头的忽略
             */
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: true,
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],

            /**
             * unused-imports/no-unused-imports — 未使用的 import 语句自动报错
             * 配合 --fix 可自动删除无用 import
             */
            "unused-imports/no-unused-imports": "error",

            // --------------------------------------------------
            // Import 排序规范
            // --------------------------------------------------

            /**
             * import/order — Import 语句按以下顺序排列：
             * 1. 内置模块（Node.js 原生，如 'path', 'fs'）
             * 2. 外部包（node_modules 中安装的第三方库）
             * 3. 内部模块（项目内的 @/ 别名路径）
             * 4. 父级目录（../ 开头的相对路径）
             * 5. 同级目录（./ 开头的相对路径）
             */
            "import/order": "error",

            // --------------------------------------------------
            // React 代码风格
            // --------------------------------------------------

            /**
             * react/self-closing-comp — 没有子元素的组件必须使用自闭合标签
             * 例如：<Component /> 而不是 <Component></Component>
             */
            "react/self-closing-comp": "error",

            /**
             * react/jsx-sort-props — 强制按字母顺序排列组件 props
             * 设为 off：props 的顺序应按逻辑分组（如回调放最后），而非机械地按字母排
             */
            "react/jsx-sort-props": "off",

            // --------------------------------------------------
            // 代码质量与一致性规则
            // --------------------------------------------------

            /**
             * padding-line-between-statements — 语句之间强制添加空行
             * 增强代码可读性，让不同逻辑块之间有视觉分隔
             */
            "padding-line-between-statements": "error",

            /**
             * eqeqeq — 要求使用严格相等运算符（=== 和 !==）
             * 禁止使用松散相等（== 和 !=），避免隐式类型转换导致的 bug
             */
            "eqeqeq": "error",

            /**
             * curly — 控制流语句必须使用花括号包裹
             * 例如：if (x) { ... } 而非 if (x) ...
             * 即使单行语句也强制加括号，减少后续扩展时遗漏括号的风险
             */
            "curly": "error",

            /**
             * no-duplicate-imports — 禁止重复导入同一模块
             * 同一个模块的所有导入应合并到一条 import 语句中
             */
            "no-duplicate-imports": "error",

            /**
             * prefer-const — 如果变量之后没有被重新赋值，则强制使用 const 声明
             * 明确表达"此变量不可变"的意图，提高代码可读性和安全性
             */
            "prefer-const": "error",

            /**
             * react-hooks/rules-of-hooks — Hooks 只能在函数组件或其他 Hooks 顶层调用
             * 设为 off：此检查已在编译层面由 React 强制执行，ESLint 层面不再重复检查
             */
            "react-hooks/rules-of-hooks": "off",
        },
    },
]);
