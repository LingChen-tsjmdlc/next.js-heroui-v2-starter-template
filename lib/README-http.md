# lib/http.ts — HTTP 请求封装

> 功能完整的 Fetch 封装，支持自动 Token 注入、重试、流式响应、文件上传/下载等。

---

## 快速开始

```ts
import http from "@/lib/http";

// 基本用法
const res = await http.get<UserInfo>("/api/v1/user/profile");
console.log(res.data); // UserInfo 类型

// POST 请求
await http.post("/api/v1/user/login", { username, password });

// 带参数的 GET
await http.get("/api/v1/posts", { page: 1, size: 10 });
```

## API 方法一览

| 方法 | 说明 |
|------|------|
| `http.request<T>(config)` | 核心请求方法，最灵活 |
| `http.get<T>(url, params?, options?)` | GET 请求 |
| `http.post<T>(url, data?, options?)` | POST 请求 |
| `http.put<T>(url, data?, options?)` | PUT 请求 |
| `http.delete<T>(url, data?, options?)` | DELETE 请求 |
| `http.patch<T>(url, data?, options?)` | PATCH 请求 |
| `http.stream<T>(url, data?, options?)` | **流式请求**（AI 对话场景） |
| `http.sse<T>(url, data?, options?)` | SSE（Server-Sent Events）请求 |
| `http.upload<T>(url, fileOptions, config?)` | 文件上传（带校验） |
| `http.download(url, filename?, options?)` | 文件下载（自动触发浏览器下载） |
| `http.all(requests[])` | 并发请求（Promise.all） |

## 请求配置 (RequestConfig)

```ts
interface RequestConfig {
  url: string;                                    // 必填，API 路径
  method?: "GET" | "POST" | "PUT" | "DELETE" ...; // 默认 GET
  params?: Record<string, any>;                   // 查询参数（GET 自动拼接到 URL）
  data?: Record<string, any> | File[] | FormData;  // 请求体
  headers?: Record<string, string>;                // 自定义请求头
  timeout?: number;                                // 超时 ms，默认 15000
  showError?: boolean;                             // 是否自动弹错提示，默认 false
  skipAuth?: boolean;                              // 是否跳过 Token 注入
  skipRefresh?: boolean;                           // 是否跳过 Token 刷新
  retries?: number;                                // 重试次数，默认 3
  retryDelay?: number;                             // 重试间隔 ms，默认 1000（指数退避）
  signal?: AbortSignal;                            // 取消信号

  // 流式相关
  stream?: boolean;              // 开启流式响应
  streamMode?: "sse" | "text" | "json" | "custom";
  onStreamChunk?: (chunk) => void;
  onStreamComplete?: (fullText) => void;

  // 文件上传相关
  onUploadProgress?: (progress) => void;
}
```

### 文件上传选项 (FileUploadOptions)

```ts
http.upload("/api/upload", {
  files: input.files,           // File[] 或 FileList
  data: { folder: "images" },   // 附带表单字段
  fileFieldName: "file",        // 字段名，默认 "files"
  maxFileSize: 10 * 1024 * 1024,// 单文件最大 10MB
  allowedTypes: ["image/*", ".pdf"],
  onProgress: ({ percentage }) => console.log(`${percentage}%`),
});
```

## 流式响应（AI 对话）

### Text 模式（逐字输出）

```typescript
const res = await http.stream<ChatMessage>("/api/chat", { message }, {
  mode: "text",
  onChunk: (chunk) => {
    // chunk.data 是当前收到的文本片段
    appendToOutput(chunk.data);
  },
  onComplete: (fullText) => {
    console.log("完成:", fullText);
  },
  onError: (err) => {
    console.error("错误:", err.message);
  },
});
```

### SSE 模式

```typescript
const res = await http.sse("/api/events", {}, {
  onChunk: (chunk) => {
    if (chunk.event === "message") {
      handleMessage(chunk.data);
    }
  },
});
```

## 错误处理

### ErrorType 枚举

| 枚举值 | 说明 |
|--------|------|
| `NETWORK_ERROR` | 网络断连 / DNS 失败 |
| `TIMEOUT_ERROR` | 请求超时 |
| `AUTH_ERROR` | Token 无效或缺失 |
| `VALIDATION_ERROR` | 参数校验失败（如文件过大） |
| `SERVER_ERROR` | 服务端返回非 2xx 状态码 |
| `UPLOAD_ERROR` | 上传过程出错 |
| `CANCELLED_ERROR` | 用户取消请求 |
| `STREAM_ERROR` | 流式读取异常 |

### 捕获错误

```ts
import { ApiError, ErrorType } from "@/lib/http";

try {
  await http.get("/api/data");
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ErrorType.AUTH_ERROR:
        router.push("/login");
        break;
      case ErrorType.NETWORK_ERROR:
        toast.error("网络连接失败");
        break;
      default:
        toast.error(error.message);
    }
  }
}
```

## 自动 Token 刷新

- 每次**非 `skipAuth`** 请求前，自动检查 Token 是否即将过期（1 小时内过期 = 需要刷新）
- 使用**防抖机制**：多个并发请求只触发一次刷新
- 刷新接口地址：`{BASE_URL}/api/v1/user/refresh-token`
- 刷新成功后新 Token 自动写入 localStorage

## 配置常量

| 常量 | 默认值 | 说明 |
|------|--------|------|
| `API_BASE_URL` | `process.env.NEXT_PUBLIC_API_BASE_URL \|\| "http://localhost:8000"` | 后端基础地址 |
| `DEFAULT_TIMEOUT` | `15000` (15s) | 默认超时 |
| `UPLOAD_TIMEOUT` | `120000` (2min) | 上传超时 |
| `MAX_RETRIES` | `3` | 最大重试次数 |
| `MAX_FILE_SIZE` | `100MB` | 单文件最大限制 |
| `MAX_TOTAL_SIZE` | `1GB` | 总文件大小限制 |

> 💡 通过环境变量 `NEXT_PUBLIC_API_BASE_URL` 在 `.env.local` 中配置你的后端地址。

## 导出的工具函数

| 函数 | 说明 |
|------|------|
| `buildQuery(params)` | 将对象转为 URL 查询字符串 |
| `validateFile(file, options)` | 校验文件大小和类型 |
| `sleep(ms)` | Promise 版延时函数 |
