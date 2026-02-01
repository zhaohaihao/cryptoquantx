# 移除 Stagewise 依赖操作文档

## 背景
需要移除项目不再支持的 stagewise 相关依赖，包括 `@stagewise/toolbar`, `@stagewise/toolbar-react`, `@stagewise-plugins/react` 等。

## 操作步骤

### 1. 修改 `package.json`
从 `devDependencies` 中移除以下依赖：
- `@stagewise-plugins/react`
- `@stagewise/toolbar`
- `@stagewise/toolbar-react`

### 2. 清理代码引用
在 `src/App.tsx` 中：
- 移除相关 import 语句：
  ```typescript
  import './utils/stagewise-patch.js';
  import './utils/stagewise-plugins-fix.js';
  ```
- 移除 `StagewiseToolbar` 的懒加载代码。
- 移除 `showToolbar` 变量的定义。
- 移除 JSX 中 `<StagewiseToolbar />` 的渲染逻辑。

### 3. 删除相关文件
删除以下不再需要的文件：
- `src/utils/stagewise-patch.js`
- `src/utils/stagewise-plugins-fix.js`
- `src/types/stagewise-patch.d.ts`

### 4. 重新安装依赖并构建
由于项目使用 `pnpm`，为了确保依赖环境干净，执行了以下操作：
1. 删除 `node_modules` 目录。
2. 删除 `package-lock.json`（如果存在，且主要使用 pnpm）。
3. 执行 `pnpm install` 重新安装依赖。
4. 执行 `pnpm run build` 验证构建是否成功。

## 遇到的问题及解决方案
- **问题**：直接运行 `npm run build` 失败，提示找不到 `react-scripts`。
- **原因**：可能是 `npm` 和 `pnpm` 混用导致 `node_modules` 结构混乱，或者依赖未正确链接。
- **解决**：彻底删除 `node_modules` 和锁文件，使用 `pnpm install` 重新安装，构建成功。

## 验证结果
项目构建成功，未出现相关依赖错误。
