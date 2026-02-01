# 指标分布页面分页功能实现文档

## 任务背景
在指标分布页面新增后端驱动的分页功能，并支持搜索和筛选，确保与电报资讯页面的分页功能体验一致。

## 实现思路

### 1. 后端改造 (okx-trading)
- **Repository层**: 在 `IndicatorDistributionRepository` 中新增 `findCurrentWithFilters` 方法，使用 `Pageable` 支持分页，并增加对搜索词和指标类型的过滤。
- **Service层**: 
    - 修改 `IndicatorDistributionService` 接口，将 `getCurrentDistributions` 方法变更为支持分页的签名。
    - 在 `IndicatorDistributionServiceImpl` 中实现该方法，处理 `filterType` 到 `IndicatorType` 枚举的映射，并调用 Repository 的分页查询。
- **Controller层**: 修改 `IndicatorDistributionController` 的 `getCurrentDistributions` 接口，接收 `page`, `size`, `searchTerm`, `filterType` 参数，并返回 `Page<IndicatorDistributionEntity>`。

### 2. 前端改造 (cryptoquantx)
- **API层**: 更新 `services/api.ts` 中的 `fetchIndicatorDistributions` 函数，使其支持发送分页和过滤参数。
- **页面层**: 
    - 在 `IndicatorDistributionPage.tsx` 中引入分页状态（`currentPage`, `pageSize`, `totalPages`, `totalElements`）。
    - 集成 `useAdaptivePagination` 钩子，根据屏幕高度动态调整每页显示数量。
    - 实现 `handlePageChange` 处理页面跳转。
    - 在搜索词（`searchTerm`）变化时增加 500ms 防抖，并重置到第一页。
    - 在更新数据（`handleUpdateDistributions`）后自动刷新当前页数据。

## 操作步骤

1.  **后端代码更新**:
    - 修改 `IndicatorDistributionRepository.java` 增加 JPA 分页查询。
    - 修改 `IndicatorDistributionService.java` 和 `IndicatorDistributionServiceImpl.java` 实现业务逻辑。
    - 修改 `IndicatorDistributionController.java` 暴露分页接口。
2.  **前端代码更新**:
    - 修改 `api.ts` 适配新的后端接口参数。
    - 在 `IndicatorDistributionPage.tsx` 中添加分页 UI 组件和相关状态管理逻辑。
    - 确保颜色风格符合“红涨绿跌”的项目规范（虽然本页面主要是指标分布，但保持了统一的 UI 风格）。
3.  **验证**:
    - 使用 `curl` 验证后端接口分页返回是否正确。
    - 在前端页面操作分页按钮、搜索框和筛选按钮，确认数据加载正常且 UI 响应及时。

## 总结
通过前后端配合，成功实现了后端驱动的分页功能。这种方式不仅减轻了前端处理大量数据的压力，还提供了更好的用户体验（支持搜索和精准筛选）。后续类似的分页改造可以参考此模式：`Pageable` (后端) + `useState` 分页状态 (前端) + `useAdaptivePagination` (自适应布局)。
