# lib/token.ts — Token 管理工具

> 基于 localStorage 的 Token 持久化存储，支持 Access Token / Refresh Token 双 Token 机制、过期判断、自动刷新决策。

---

## 快速开始

```ts
import {
  getAuthToken,
  setTokenInfo,
  clearTokenInfo,
  shouldRefreshToken,
} from "@/lib/token";

// 登录成功后保存 Token
setTokenInfo({
  accessToken: "eyJhbGciOiJIUzI1NiIs...",
  accessTokenExpiresData: 1742345678,    // Unix 秒级时间戳
  refreshToken: "dGhpcyBpcyBhIHJlZnJlc2...",
  refreshTokenExpiresData: 1742432078,  // Unix 秒级时间戳
});

// 发请求时获取
const token = getAuthToken();
// → "eyJhbGciOiJIUzI1NiIs..."

// 判断是否需要刷新
const { shouldRefreshAccess } = shouldRefreshToken();
if (shouldRefreshAccess) {
  await refreshAccessToken();
}

// 登出时清除
clearTokenInfo();
```

## API 方法一览

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getAuthToken()` | `string \| null` | 获取当前 Access Token |
| `getRefreshToken()` | `string \| null` | 获取当前 Refresh Token |
| `getTokenExpiresData()` | `{ accessTokenExpiresData, refreshTokenExpiresData }` | 获取两个 Token 的过期时间 |
| `setTokenInfo(tokenInfo)` | `void` | **保存** Token 信息（登录/刷新后调用） |
| `clearTokenInfo()` | `void` | **清除**所有 Token（登出时调用） |
| `isTokenExpired(expiresData, bufferSeconds?)` | `boolean` | 判断某个时间戳是否已过期 |
| `shouldRefreshToken()` | `{ shouldRefreshAccess, shouldRefreshRefresh }` | 判断是否需要刷新 |

## 类型定义

```ts
interface TokenInfo {
  accessToken: string;           // 访问令牌
  accessTokenExpiresData: number; // 过期时间（Unix 秒）
  refreshToken: string;          // 刷新令牌
  refreshTokenExpiresData: number; // 过期时间（Unix 秒）
}
```

## 存储结构

所有数据存放在 `localStorage` 中，使用 4 个 key：

| Key | 值 | 示例 |
|-----|-----|------|
| `accessToken` | JWT 字符串 | `"eyJhbGci..."` |
| `refreshToken` | Refresh 字符串 | `"dGhpcyBpcyBh..."` |
| `accessTokenExpiresData` | Unix 时间戳字符串 | `"1742345678"` |
| `refreshTokenExpiresData` | Unix 时间戳字符串 | `"1742432078"` |

## 刷新策略

`shouldRefreshToken()` 的判定逻辑：

| Token | 提前刷新窗口 | 说明 |
|-------|-------------|------|
| Access Token | **提前 1 小时** (3600s) | 在实际过期前 1 小时就认为需要刷新 |
| Refresh Token | **提前 3 小时** (10800s) | 提醒用户即将需要重新登录 |

```ts
const { shouldRefreshAccess, shouldRefreshRefresh } = shouldRefreshToken();

if (shouldRefreshAccess) {
  // http.ts 会自动调用刷新接口
}

if (shouldRefreshRefresh) {
  // 可选：提示用户 "登录即将过期，请重新登录"
}
```

## 安全注意事项

### ⚠️ 客户端存储风险

Token 存在 `localStorage` 中意味着：

1. **XSS 攻击可窃取 Token** — 确保你的项目有 CSP 策略
2. **不支持 SSR 取值** — 所有方法都有 `typeof window === "undefined"` 守卫
3. **多 Tab 同步** — 需要自行监听 `storage` 事件

### 多 Tab 同步示例

```ts
// 在 layout 或 providers 中添加
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (
      e.key === "accessToken" &&
      e.newValue !== e.oldValue
    ) {
      // 其他 Tab 刷新了 Token，更新本地状态
      router.refresh();
    }
    if (e.key === "accessToken" && e.newValue === null) {
      // 其他 Tab 登出了
      router.push("/login");
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

## 与 http.ts 的协作关系

```
http.ts 调用链:
  request() → autoRefreshToken()
                  → shouldRefreshToken()   ← 来自 token.ts
                  → performTokenRefresh()   → 调用后端刷新接口
                      → setTokenInfo()       ← 来自 token.ts（保存新 Token）
              → getAuthToken()               ← 来自 token.ts（注入到 Header）
```

**你不需要手动调用刷新逻辑**，`http.ts` 的每个请求都会自动完成。
