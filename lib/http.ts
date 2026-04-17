"use client";

/**
 * API响应接口
 * @param code 响应状态码
 * @param message 响应消息
 * @param data 响应数据
 * @param success 是否成功 (一般没有)
 * @param timestamp 响应时间戳 (一般没有)
 * @param headers 响应头 (主要用于下载文件时获取文件名)
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
  timestamp?: number;
  headers?: Headers;
}

/**
 * 上传进度事件接口
 * @param loaded 已上传字节数
 * @param total 总字节数
 * @param percentage 上传进度百分比
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * 流式响应数据块接口
 * @param data 数据内容
 * @param type 数据类型
 * @param id 数据ID
 * @param event 事件名称
 * @param done 是否完成
 * @param metadata 元数据
 */
export interface StreamChunk {
  data: string | Uint8Array;
  type?: "text" | "json" | "binary";
  id?: string;
  event?: string;
  done?: boolean;
  metadata?: Record<string, any>;
}

/**
 * 流式响应选项接口
 * @param mode 流式响应模式
 * @param onChunk 流式响应数据回调
 * @param onProgress 流式响应进度回调
 * @param onComplete 流式响应完成回调
 * @param onError 流式响应错误回调
 * @param reconnect 重连选项
 * @param parser 流式响应解析函数
 * @param signal 取消信号
 */
export interface StreamOptions {
  mode?: "sse" | "text" | "json" | "custom";
  onChunk?: (chunk: StreamChunk) => void;
  onProgress?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  reconnect?: {
    attempts?: number;
    delay?: number;
    onReconnect?: (attempt: number) => void;
  };
  parser?: (chunk: string) => any;
  signal?: AbortSignal;
}

/**
 * 请求配置接口
 * @param url 请求URL
 * @param method 请求方法
 * @param params 查询参数
 * @param data 请求体数据
 * @param headers 请求头
 * @param timeout 超时时间
 * @param showError 是否显示错误提示
 * @param skipAuth 是否跳过认证
 * @param skipRefresh 是否跳过刷新token
 * @param cache 请求缓存策略
 * @param retries 重试次数
 * @param retryDelay 重试延迟时间
 * @param onUploadProgress 上传进度回调
 * @param onDownloadProgress 下载进度回调
 * @param signal 取消信号
 * @param responseType 响应类型
 * @param validateStatus 状态码校验函数
 * @param maxRedirects 最大重定向次数
 * @param maxContentLength 最大内容长度
 * @param maxBodyLength 最大请求体长度
 * @param stream 是否开启流式响应
 * @param streamMode 流式响应模式
 * @param onStreamChunk 流式响应数据回调
 * @param onStreamComplete 流式响应完成回调
 * @param onStreamError 流式响应错误回调
 * @param streamParser 流式响应解析函数
 * @param reconnectAttempts 重连尝试次数
 * @param reconnectDelay 重连延迟时间
 */
interface RequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  params?: Record<string, any>;
  data?: Record<string, any> | File[] | FileList | FormData;
  headers?: Record<string, string>;
  timeout?: number;
  showError?: boolean;
  skipAuth?: boolean;
  skipRefresh?: boolean;
  cache?: RequestCache;
  retries?: number;
  retryDelay?: number;
  onUploadProgress?: (progress: UploadProgressEvent) => void;
  onDownloadProgress?: (progress: UploadProgressEvent) => void;
  signal?: AbortSignal;
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "stream";
  validateStatus?: (status: number) => boolean;
  maxRedirects?: number;
  maxContentLength?: number;
  maxBodyLength?: number;
  // 流式相关配置
  stream?: boolean;
  streamMode?: "sse" | "text" | "json" | "custom";
  onStreamChunk?: (chunk: StreamChunk) => void;
  onStreamComplete?: (fullResponse: string) => void;
  onStreamError?: (error: Error) => void;
  streamParser?: (chunk: string) => any;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface FileUploadOptions {
  files: File[] | FileList;
  data?: Record<string, any>;
  fileFieldName?: string | string[];
  multipleFields?: boolean; // 是否支持多个文件字段
  maxFileSize?: number; // 单个文件最大大小 (bytes)
  maxTotalSize?: number; // 总文件大小限制
  allowedTypes?: string[]; // 允许的文件类型
  onProgress?: (progress: UploadProgressEvent) => void;
  onFileError?: (file: File, error: string) => void;
}

// =================================
// 配置和常量
// =================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = 15000;
const UPLOAD_TIMEOUT = 120000; // 上传超时时间更长
const MAX_RETRIES = 3;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024; // 1GB

/**
 * 错误类型枚举
 * - NETWORK_ERROR: 网络错误
 * - TIMEOUT_ERROR: 超时错误
 * - AUTH_ERROR: 认证错误
 * - VALIDATION_ERROR: 验证错误
 * - SERVER_ERROR: 服务错误
 * - UPLOAD_ERROR: 上传错误
 * - CANCELLED_ERROR: 取消错误
 * - STREAM_ERROR: 流式错误
 * - RECONNECT_ERROR: 重连错误
 */
export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  CANCELLED_ERROR = "CANCELLED_ERROR",
  STREAM_ERROR = "STREAM_ERROR",
  RECONNECT_ERROR = "RECONNECT_ERROR",
}

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public code?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// =================================
// Token管理
// =================================

import {
  getAuthToken,
  shouldRefreshToken,
  setTokenInfo as saveTokenInfo,
  clearTokenInfo,
} from "@/lib/token";

// 防抖token刷新
let refreshTokenPromise: Promise<boolean> | null = null;

// =================================
// 工具函数
// =================================

/**
 * 构建查询参数
 */
function buildQuery(params?: Record<string, any>): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
}

/**
 * 深度克隆对象
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const cloned = {} as T;
    Object.keys(obj).forEach((key) => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * 文件验证
 */
function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  },
): { valid: boolean; error?: string } {
  console.log("[validateFile] checking file:", file.name, "size:", file.size, "type:", file.type);
  console.log("[validateFile] options:", options);

  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `文件 ${file.name} 大小超过限制 (${(file.size / 1024 / 1024).toFixed(2)}MB > ${(options.maxSize / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (
    options.allowedTypes &&
    !options.allowedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace("*", ".*"));
    })
  ) {
    return {
      valid: false,
      error: `文件 ${file.name} 类型不被允许 (${file.type})`,
    };
  }

  return { valid: true };
}

/**
 * 显示错误信息
 */
function showError(error: string | ApiError): void {
  const message = error instanceof ApiError ? error.message : error;
  const type = error instanceof ApiError ? error.type : ErrorType.NETWORK_ERROR;

  console.error(`[API Error - ${type}]`, message);

  // 可以集成UI组件库的错误提示
  // import { showToast } from "@heroui/react";
  // showToast({
  //   title: "请求出错",
  //   description: message,
  //   color: "danger",
  // });
}

/**
 * 自动刷新token
 */
async function autoRefreshToken(): Promise<boolean> {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = performTokenRefresh();

  setTimeout(() => {
    refreshTokenPromise = null;
  }, 1000);

  return refreshTokenPromise;
}

/**
 * 执行token刷新
 */
async function performTokenRefresh(): Promise<boolean> {
  try {
    const { shouldRefreshAccess } = shouldRefreshToken();

    if (!shouldRefreshAccess) {
      return true;
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/user/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ wantRefreshAccessToken: true }),
    });

    const data = await response.json();
    if (data.code === 200 && data.data) {
      saveTokenInfo({
        accessToken: data.data.accessToken,
        accessTokenExpiresData: data.data.accessTokenExpiresData,
        refreshToken: data.data.refreshToken || refreshToken,
        refreshTokenExpiresData: data.data.refreshTokenExpiresData || Date.now() + 86400000,
      });
    }

    return true;
  } catch (error) {
    console.error("Token刷新失败:", error);
    return false;
  }
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 流式响应处理
 */
async function handleStreamResponse<T = any>(
  response: Response,
  config: RequestConfig,
  resolve: (value: ApiResponse<T>) => void,
  reject: (reason?: any) => void,
): Promise<void> {
  const {
    streamMode = "text",
    onStreamChunk,
    onStreamComplete,
    onStreamError,
    streamParser,
    signal,
  } = config;

  if (!response.body) {
    reject(new ApiError(ErrorType.STREAM_ERROR, "流式响应没有body"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  const processChunk = async (chunk: Uint8Array): Promise<void> => {
    const text = decoder.decode(chunk, { stream: true });
    buffer += text;

    try {
      switch (streamMode) {
        case "sse":
          await handleSSEChunk(buffer, onStreamChunk, onStreamError);
          buffer = "";
          break;
        case "json":
          await handleJSONStreamChunk(buffer, onStreamChunk, streamParser, onStreamError);
          buffer = "";
          break;
        case "custom":
          if (streamParser) {
            const parsed = streamParser(buffer);
            if (onStreamChunk) {
              onStreamChunk({ data: parsed, type: "text" });
            }
            buffer = "";
          }
          break;
        default: // text
          if (onStreamChunk) {
            onStreamChunk({ data: text, type: "text" });
          }
          fullText += text;
      }
    } catch (error) {
      if (onStreamError) {
        onStreamError(error as Error);
      }
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 处理最后的缓冲区
        if (buffer) {
          await processChunk(new TextEncoder().encode(buffer));
        }

        if (onStreamComplete) {
          onStreamComplete(fullText);
        }

        // 返回标准响应格式
        resolve({
          code: 200,
          message: "success",
          data: fullText as T,
          success: true,
          timestamp: Date.now(),
        });
        return;
      }

      if (value) {
        await processChunk(value);
      }

      // 检查取消信号
      if (signal?.aborted) {
        reader.cancel();
        throw new ApiError(ErrorType.CANCELLED_ERROR, "流式请求已取消");
      }
    }
  } catch (error) {
    reject(error);
  }
}

/**
 * 处理SSE (Server-Sent Events) 流
 */
async function handleSSEChunk(
  buffer: string,
  onChunk?: (chunk: StreamChunk) => void,
  onError?: (error: Error) => void,
): Promise<void> {
  const lines = buffer.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") {
        if (onChunk) {
          onChunk({ data, done: true, type: "text" });
        }
        continue;
      }

      try {
        const parsed = JSON.parse(data);
        if (onChunk) {
          onChunk({ data: parsed, type: "json" });
        }
      } catch {
        if (onChunk) {
          onChunk({ data, type: "text" });
        }
      }
    } else if (line.startsWith("event: ")) {
      const event = line.slice(7);
      if (onChunk) {
        onChunk({ data: "", event, type: "text" });
      }
    }
  }
}

/**
 * 处理JSON流
 */
async function handleJSONStreamChunk(
  buffer: string,
  onChunk?: (chunk: StreamChunk) => void,
  parser?: (chunk: string) => any,
  onError?: (error: Error) => void,
): Promise<void> {
  const lines = buffer.split("\n");
  let currentJson = "";

  for (const line of lines) {
    currentJson += line;

    if (line.trim().endsWith("}")) {
      try {
        const parsed = parser ? parser(currentJson) : JSON.parse(currentJson);
        if (onChunk) {
          onChunk({ data: parsed, type: "json" });
        }
        currentJson = "";
      } catch (error) {
        // 可能是不完整的JSON，继续累积
      }
    }
  }
}

/**
 * 核心请求函数（支持重试、取消、进度、流式等）
 */
async function request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
  const {
    url,
    method = "GET",
    params,
    data,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    showError: shouldShowError = false,
    skipAuth = false,
    skipRefresh = false,
    cache = "no-store",
    retries = MAX_RETRIES,
    retryDelay = 1000,
    signal,
    responseType = "json",
    validateStatus = (status) => status >= 200 && status < 300,
    maxContentLength,
    maxBodyLength,
    stream,
    streamMode = "text",
    onStreamChunk,
    onStreamComplete,
    onStreamError,
    streamParser,
  } = config;

  let lastError: Error | null = null;

  // 重试逻辑
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 自动刷新token
      if (!skipAuth && !skipRefresh && typeof window !== "undefined") {
        await autoRefreshToken();
      }

      // 构建请求URL
      let requestUrl = API_BASE_URL + url;
      if (method === "GET" && params) {
        requestUrl += buildQuery(params);
      }

      // 构建请求体和头部
      let body: string | FormData | undefined;
      const requestHeaders: Record<string, string> = { ...headers };

      if (data instanceof FormData) {
        // FormData文件上传
        body = data;
      } else if (Array.isArray(data) && data.length > 0 && data[0] instanceof File) {
        // 文件数组
        const formData = new FormData();
        data.forEach((file) => formData.append("files", file));
        body = formData;
      } else if (data instanceof FileList) {
        // FileList
        const formData = new FormData();
        for (let i = 0; i < data.length; i++) {
          formData.append("files", data[i]);
        }
        body = formData;
      } else if (
        data &&
        typeof data === "object" &&
        Object.keys(data).some(
          (key) => key === "files" || key.endsWith("Files") || key.endsWith("File"),
        )
      ) {
        // 混合数据（包含文件）
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "files" || key.endsWith("Files") || key.endsWith("File")) {
            // 文件字段处理
            if (value instanceof FileList) {
              for (let i = 0; i < value.length; i++) {
                formData.append(key, value[i]);
              }
            } else if (Array.isArray(value)) {
              value.forEach((file) => formData.append(key, file));
            } else if (value instanceof File) {
              formData.append(key, value);
            }
          } else if (value !== undefined && value !== null) {
            // 普通字段处理
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });
        body = formData;
      } else if (data) {
        // 普通JSON数据
        body = JSON.stringify({ ...data, _t: Date.now() });
        requestHeaders["Content-Type"] = "application/json";
      }

      // 添加认证token
      if (!skipAuth) {
        const token = getAuthToken();
        if (token) {
          requestHeaders["Authorization"] = `Bearer ${token}`;
        } else if (shouldShowError) {
          clearTokenInfo();
          throw new ApiError(ErrorType.AUTH_ERROR, "未找到认证token, 请重新登录!");
        }
      }

      // 超时和取消控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 处理外部取消信号
      if (signal) {
        signal.addEventListener("abort", () => controller.abort());
      }

      try {
        const response = await fetch(requestUrl, {
          method,
          headers: requestHeaders,
          body,
          signal: controller.signal,
          cache,
        });

        clearTimeout(timeoutId);

        // 检查是否为流式响应
        if (stream || responseType === "stream") {
          return new Promise<ApiResponse<T>>((resolve, reject) => {
            handleStreamResponse(response, config, resolve, reject);
          });
        }

        // 检查内容长度
        const contentLength = response.headers.get("content-length");
        if (maxContentLength && contentLength && parseInt(contentLength) > maxContentLength) {
          throw new ApiError(ErrorType.SERVER_ERROR, `响应内容过大`);
        }

        // 解析响应
        let responseData: any;

        switch (responseType) {
          case "text":
            responseData = await response.text();
            break;
          case "blob":
            responseData = await response.blob();
            break;
          case "arrayBuffer":
            responseData = await response.arrayBuffer();
            break;
          default:
            try {
              responseData = await response.json();
            } catch {
              responseData = await response.text();
            }
        }

        // 验证状态码
        if (!validateStatus(response.status)) {
          const error = new ApiError(
            ErrorType.SERVER_ERROR,
            responseData?.message || response.statusText || `HTTP ${response.status}`,
            response.status,
            response,
          );

          if (shouldShowError) {
            showError(error);
          }

          return {
            code: response.status,
            message: responseData?.message || response.statusText || "请求失败",
            data: null as T,
            success: false,
          };
        }

        // 处理业务响应
        const result: ApiResponse<T> = {
          code: responseData?.code ?? response.status,
          message: responseData?.message ?? "",
          data: responseData?.data ?? responseData ?? null,
          success: true,
          timestamp: Date.now(),
          headers: response.headers,
        };

        // 显示业务错误
        if (result.code !== 200 && result.code !== 0 && shouldShowError) {
          showError(result.message);
        }

        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError" || (signal && signal.aborted)) {
          throw new ApiError(ErrorType.CANCELLED_ERROR, "请求已取消");
        }

        if (err instanceof ApiError) {
          throw err;
        }

        throw new ApiError(ErrorType.NETWORK_ERROR, err.message || "网络请求失败");
      }
    } catch (err: any) {
      lastError = err;

      // 如果是取消错误，不重试
      if (err instanceof ApiError && err.type === ErrorType.CANCELLED_ERROR) {
        break;
      }

      // 如果还有重试次数且是可重试的错误
      if (
        attempt < retries &&
        err instanceof ApiError &&
        (err.type === ErrorType.NETWORK_ERROR || err.type === ErrorType.TIMEOUT_ERROR)
      ) {
        await sleep(retryDelay * Math.pow(2, attempt)); // 指数退避
        continue;
      }

      break;
    }
  }

  // 处理最终错误
  if (lastError) {
    if (shouldShowError) {
      showError(lastError instanceof Error ? lastError.message : String(lastError));
    }

    if (lastError instanceof ApiError) {
      throw lastError;
    }
  }

  throw new ApiError(ErrorType.NETWORK_ERROR, "请求失败");
}

// =================================
// 导出功能完整的API
// =================================

/**
 * HTTP客户端 - 功能完整版
 */
export const http = {
  /**
   * 基础请求方法
   */
  request: <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => request<T>(config),

  /**
   * GET请求
   */
  get: <T = any>(
    url: string,
    params?: Record<string, any>,
    options: Omit<RequestConfig, "url" | "method" | "params"> = {},
  ) => request<T>({ ...options, url, method: "GET", params }),

  /**
   * POST请求
   */
  post: <T = any>(
    url: string,
    data?: any,
    options: Omit<RequestConfig, "url" | "method" | "data"> = {},
  ) => request<T>({ ...options, url, method: "POST", data }),

  /**
   * PUT请求
   */
  put: <T = any>(
    url: string,
    data?: any,
    options: Omit<RequestConfig, "url" | "method" | "data"> = {},
  ) => request<T>({ ...options, url, method: "PUT", data }),

  /**
   * DELETE请求
   */
  delete: <T = any>(
    url: string,
    data?: any,
    options: Omit<RequestConfig, "url" | "method" | "data"> = {},
  ) => request<T>({ ...options, url, method: "DELETE", data }),

  /**
   * PATCH请求
   */
  patch: <T = any>(
    url: string,
    data?: any,
    options: Omit<RequestConfig, "url" | "method" | "data"> = {},
  ) => request<T>({ ...options, url, method: "PATCH", data }),

  /**
   * 流式请求 - AI对话专用
   */
  stream: <T = any>(
    url: string,
    data?: any,
    options: StreamOptions = {},
  ): Promise<ApiResponse<T>> => {
    return request<T>({
      url,
      method: "POST",
      data,
      stream: true,
      streamMode: options.mode || "text",
      onStreamChunk: options.onChunk,
      onStreamComplete: options.onComplete,
      onStreamError: options.onError,
      streamParser: options.parser,
      signal: options.signal,
      reconnectAttempts: options.reconnect?.attempts || 3,
      reconnectDelay: options.reconnect?.delay || 1000,
      showError: false, // 流式请求默认不显示错误，由回调处理
    });
  },

  /**
   * SSE (Server-Sent Events) 请求
   */
  sse: <T = any>(url: string, data?: any, options: StreamOptions = {}): Promise<ApiResponse<T>> => {
    return request<T>({
      url,
      method: "POST",
      data,
      stream: true,
      streamMode: "sse",
      onStreamChunk: options.onChunk,
      onStreamComplete: options.onComplete,
      onStreamError: options.onError,
      signal: options.signal,
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...(options.signal ? {} : { "X-Requested-With": "XMLHttpRequest" }),
      },
    });
  },

  /**
   * 文件上传（增强版）
   */
  upload: <T = any>(
    url: string,
    options: FileUploadOptions,
    config: Omit<RequestConfig, "url" | "method" | "data"> = {},
  ): Promise<ApiResponse<T>> => {
    const {
      files,
      data,
      fileFieldName = "files",
      multipleFields = false,
      maxFileSize = MAX_FILE_SIZE,
      maxTotalSize = MAX_TOTAL_SIZE,
      allowedTypes,
      onProgress,
      onFileError,
    } = options;

    // 文件验证
    const fileArray = files instanceof FileList ? Array.from(files) : files;
    console.log("[http.upload] files:", fileArray.length, "maxFileSize:", maxFileSize);
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
    console.log(
      "[http.upload] file sizes:",
      fileArray.map((f) => `${f.name}: ${f.size} bytes`),
    );

    if (totalSize > maxTotalSize) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        `文件总大小超过限制: ${(totalSize / 1024 / 1024).toFixed(2)}MB > ${(maxTotalSize / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    const validFiles: File[] = [];
    fileArray.forEach((file) => {
      const validation = validateFile(file, {
        maxSize: maxFileSize,
        allowedTypes,
      });
      if (validation.valid) {
        validFiles.push(file);
      } else if (onFileError) {
        onFileError(file, validation.error!);
      } else {
        console.log("[validateFile] validation failed but no onFileError:", validation.error);
      }
    });

    console.log("[http.upload] validFiles count:", validFiles.length);

    if (validFiles.length === 0) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, "没有有效的文件可以上传");
    }

    // 构建上传数据
    let uploadData: FormData | Record<string, any>;

    if (multipleFields) {
      uploadData = {};
      if (typeof fileFieldName === "string") {
        (uploadData as Record<string, any>)[fileFieldName] = validFiles;
      } else {
        fileFieldName.forEach((fieldName, index) => {
          if (validFiles[index]) {
            (uploadData as Record<string, any>)[fieldName] = validFiles[index];
          }
        });
      }
      Object.assign(uploadData, data);
    } else {
      uploadData = new FormData();
      if (typeof fileFieldName === "string") {
        validFiles.forEach((file) => uploadData.append(fileFieldName, file));
      } else {
        fileFieldName.forEach((fieldName, index) => {
          if (validFiles[index]) {
            uploadData.append(fieldName, validFiles[index]);
          }
        });
      }

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === "object") {
            (uploadData as FormData).append(key, JSON.stringify(value));
          } else {
            (uploadData as FormData).append(key, String(value));
          }
        });
      }
    }

    return request<T>({
      ...config,
      url,
      method: "POST",
      data: uploadData,
      timeout: config.timeout || UPLOAD_TIMEOUT,
      onUploadProgress: onProgress,
    });
  },

  /**
   * 下载文件
   */
  download: (
    url: string,
    filename?: string,
    options: Omit<RequestConfig, "url" | "method" | "responseType"> = {},
  ) => {
    return request<Blob>({
      ...options,
      url,
      method: "GET",
      responseType: "blob",
    }).then(async (response) => {
      if (response.data instanceof Blob) {
        const blobUrl = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename || `download_${Date.now()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
      return response;
    });
  },

  /**
   * 并发请求
   */
  all: <T extends readonly unknown[] | []>(
    requests: T,
  ): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> => {
    return Promise.all(requests);
  },

  /**
   * 设置全局配置
   */
  setConfig: (
    config: Partial<{
      baseURL: string;
      timeout: number;
      retries: number;
      headers: Record<string, string>;
    }>,
  ) => {
    // 可以实现全局配置
    console.log("Global config set:", config);
  },
};

// 默认导出
export default http;

// 导出工具函数和类型
export { buildQuery, validateFile, sleep };
export type { RequestConfig, FileUploadOptions };
