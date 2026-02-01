# 统一样式与分页功能修复文档

## 问题描述
用户反馈策略工厂（Backtest Factory）页面的分页按钮未显示，而电报咨询（Telegram News）页面显示正常。需要修复策略工厂的分页模块，使其与电报咨询页面的功能、布局和样式完全一致。

在修复过程中，发现实盘策略（Real Time Strategy）页面也存在类似的分页逻辑缺陷（缺少边界校验、无滚动到顶部功能、自适应参数不一致）以及颜色风格不符合“红涨绿跌”规则的问题。

## 解决思路
1. **对比分析**：对比 `TelegramNewsPage`（参考基准）与 `BacktestFactoryPage`、`RealTimeStrategyPage` 的分页实现。
2. **逻辑统一**：
    - 为所有分页页面添加 `handlePageChange` 的页码边界校验。
    - 实现点击页码后列表容器自动滚动到顶部。
    - 统一 `useAdaptivePagination` 钩子的参数（`navbarHeight` 设为 60，`basePadding` 设为 48，微调 `margins`）。
3. **样式统一**：
    - 移除 `.pagination-container` 中的 `margin-top: auto`，改用 Flex 布局自动填充，防止分页按钮被挤出视口。
    - 统一 `.pagination-button` 和 `.pagination-info` 的 CSS 样式。
4. **规范执行**：确保所有涉及价格变动的颜色遵循“红涨绿跌”原则。

## 操作步骤

### 1. 修复策略工厂页面 (BacktestFactoryPage)
- **文件**: `src/pages/BacktestFactoryPage.tsx`
    - 修改 `handlePageChange`，增加 `newPage >= 1 && newPage <= totalPages` 校验。
    - 添加滚动代码：`document.querySelector('.strategy-body').scrollTop = 0`。
    - 更新 `useAdaptivePagination` 参数：`navbarHeight: 60`, `basePadding: 48`。
- **文件**: `src/pages/BacktestFactoryPage.css`
    - 移除 `.pagination-container` 的 `margin-top: auto`。
    - 统一分页按钮背景色为蓝色 `rgb(41, 98, 255)`。

### 2. 修复实盘策略页面 (RealTimeStrategyPage)
- **文件**: `src/pages/RealTimeStrategyPage.tsx`
    - 同样应用边界校验和滚动到顶部逻辑（针对 `.strategies-table-container`）。
    - 修正分页信息显示，使用排序后的数据长度 `sortedStrategies.length`。
    - **TypeScript 修复**: 将 `document.querySelector` 获取的元素显式转换为 `HTMLElement | null`，并使用可选链 `?.` 访问 `offsetHeight` 属性，解决了 `Property 'offsetHeight' does not exist on type 'Element'` 的编译错误。
- **文件**: `src/pages/RealTimeStrategyPage.css`
    - 修正颜色定义：将 `.positive` 设为红色 (`#ff5252`)，`.negative` 设为绿色 (`#00c853`)。
    - 修正统计面板中的 `stat-value` 颜色。
    - 移除 `margin-top: auto` 并统一样式。

## 验证结果
- **分页显示**: 策略工厂和实盘策略页面的分页按钮现在在不同屏幕高度下均能正常显示。
- **功能交互**: 点击“下一页”或“首页”后，列表会自动回到顶部，且不会出现超出页码范围的请求。
- **样式一致性**: 所有页面的分页按钮样式保持一致（蓝色背景、圆角、高度 36px）。
- **颜色规范**: 实盘策略页面的收益显示符合“红涨绿跌”规范。

### 3. 统一批量回测页面 (BacktestSummaryPage)
- **文件**: `src/pages/BacktestSummaryPage.tsx`
    - 修改 `handlePageChange`，增加边界校验和滚动到顶部逻辑（针对 `.summary-table-container`）。
    - 统一颜色函数 `getValueColorClass` 返回的类名为 `positive` 和 `negative`。
- **文件**: `src/pages/BacktestSummaryPage.css`
    - 统一分页按钮样式：背景色 `rgb(41, 98, 255)`，悬浮效果，禁用状态样式。
    - 统一颜色定义：`.positive` 为红色 (`#ff5252`)，`.negative` 为绿色 (`#4caf50`)。

### 4. 优化所有页面的 CSS 布局
- **所有 CSS 文件**:
    - 统一 `.pagination-container` 的 `padding` 为 `16px 0`。
    - 为 `.pagination-button` 添加 `transform: translateY(-1px)` 的悬浮效果。
    - 统一 `.pagination-info` 的颜色为 `#8d8d8d`，字重 `500`。
    - 统一 `gap: 8px` 的按钮间距。

## 验证结果
- **分页显示**: 策略工厂、实盘策略、批量回测、电报咨询四个页面的分页按钮在不同屏幕高度下均能正常显示且样式完全统一。
- **功能交互**: 所有页面的分页逻辑均包含边界校验和滚动到顶部功能。
- **颜色规范**: 所有页面涉及价格和收益的显示均严格遵循“红涨绿跌”规范（红色表示上涨/正数，绿色表示下跌/负数）。

## 相关文件
- [BacktestFactoryPage.tsx](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/BacktestFactoryPage.tsx)
- [BacktestFactoryPage.css](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/BacktestFactoryPage.css)
- [RealTimeStrategyPage.tsx](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/RealTimeStrategyPage.tsx)
- [RealTimeStrategyPage.css](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/RealTimeStrategyPage.css)
- [BacktestSummaryPage.tsx](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/BacktestSummaryPage.tsx)
- [BacktestSummaryPage.css](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/BacktestSummaryPage.css)
- [TelegramNewsPage.css](file:///c:/Users/ralph/IdeaProject/cryptoquantx/src/pages/TelegramNewsPage.css)
