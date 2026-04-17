"use client";

// =================================
// 类型定义
// =================================

export interface TokenInfo {
  accessToken: string;
  accessTokenExpiresData: number;
  refreshToken: string;
  refreshTokenExpiresData: number;
}

// =================================
// Token管理
// =================================

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_EXPIRES_KEY = "accessTokenExpiresData";
const REFRESH_TOKEN_EXPIRES_KEY = "refreshTokenExpiresData";

/**
 * 获取认证token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 获取刷新token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 获取token过期时间
 */
export function getTokenExpiresData(): {
  accessTokenExpiresData: number | null;
  refreshTokenExpiresData: number | null;
} {
  if (typeof window === "undefined") {
    return {
      accessTokenExpiresData: null,
      refreshTokenExpiresData: null,
    };
  }

  const accessTokenExpiresData = localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY);
  const refreshTokenExpiresData = localStorage.getItem(REFRESH_TOKEN_EXPIRES_KEY);

  return {
    accessTokenExpiresData: accessTokenExpiresData ? parseInt(accessTokenExpiresData, 10) : null,
    refreshTokenExpiresData: refreshTokenExpiresData ? parseInt(refreshTokenExpiresData, 10) : null,
  };
}

/**
 * 设置token信息
 */
export function setTokenInfo(tokenInfo: TokenInfo): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, tokenInfo.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenInfo.refreshToken);
  localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, tokenInfo.accessTokenExpiresData.toString());
  localStorage.setItem(REFRESH_TOKEN_EXPIRES_KEY, tokenInfo.refreshTokenExpiresData.toString());
}

/**
 * 清除token信息
 */
export function clearTokenInfo(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
}

/**
 * 检查token是否过期
 */
export function isTokenExpired(expiresData: number | null, bufferSeconds: number = 0): boolean {
  if (!expiresData) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return expiresData - bufferSeconds <= now;
}

/**
 * 检查是否需要刷新token
 */
export function shouldRefreshToken(): {
  shouldRefreshAccess: boolean;
  shouldRefreshRefresh: boolean;
} {
  const { accessTokenExpiresData, refreshTokenExpiresData } = getTokenExpiresData();

  // 访问token在1小时内过期，需要刷新
  const shouldRefreshAccess = isTokenExpired(accessTokenExpiresData, 3600);

  // 刷新token在3小时内过期，需要刷新
  const shouldRefreshRefresh = isTokenExpired(refreshTokenExpiresData, 10800);

  return {
    shouldRefreshAccess,
    shouldRefreshRefresh,
  };
}
