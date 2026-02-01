# K线图与指标图日期对齐修复记录

## 问题回顾
用户反馈 Canvas K 线图与副图指标（MACD, RSI, KDJ 等）在日期上没有对齐。

## 原因分析
经过深入的代码审查，发现主要原因有两点：

1.  **MACD 指标计算逻辑错误**：
    在 `src/utils/indicators.ts` 的 `calculateMACD` 函数中，`signalData` 数组的初始化逻辑有误。
    -   错误代码：前 34 个点填充 `NaN`，然后追加计算出的 `signalEMA`（其中前 8 个也是 `NaN`）。
    -   后果：导致 `signalData` 的总长度比原始数据多出了 9 个点，且数据整体向右偏移，造成严重不对齐。

2.  **数据同步机制依赖数据长度**：
    `CandlestickChart.tsx` 中的同步机制依赖于主图和副图拥有相同数量的数据点。如果指标计算导致数据长度不一致，或者过滤了 `NaN` 值，都会导致时间轴逻辑索引错位。

## 修复方案

### 1. 修复 MACD 计算逻辑
修正了 `calculateMACD` 函数，将初始填充的 `NaN` 数量从 34 个减少到 25 个。
-   前 25 个点对应 MACD 线的无效部分。
-   后续的 9 个点（信号线 EMA 的初始周期）由 `signalEMA` 自身的前导 `NaN` 覆盖。
-   修复后，`signalData` 的长度与原始 K 线数据严格一致。

### 2. 确认数据准备逻辑
确认 `prepareTimeSeriesData` 函数已支持保留 `NaN` 值（通过 `skipInvalidValues=false` 参数），确保所有指标（RSI, KDJ, StockRSI）生成的图表数据点数量与 K 线完全一致，包括无效值的占位符。

### 3. 优化错误日志
恢复了 `syncTimeScales` 函数中的 `console.warn` 日志，以便在未来出现同步问题时能快速定位。

## 验证
修复后：
-   MACD 信号线的起始位置和长度将完全正确。
-   所有副图指标的数据点数量与主图一致。
-   Canvas 图表的逻辑索引同步将正常工作，日期完全对齐。

## 修改文件
-   `src/utils/indicators.ts`
-   `src/components/Chart/CandlestickChart.tsx`
