import os

def replace_in_file(file_path, old_str, new_str):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str not in content:
        print(f"Old string not found in {file_path}")
        # print(f"Looking for:\n{old_str}")
        return
    new_content = content.replace(old_str, new_str)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated {file_path}")

# 1. Update Repository
repo_path = r'c:\Users\ralph\IdeaProject\okx-trading\src\main\java\com\okx\trading\repository\IndicatorDistributionRepository.java'
repo_old = """import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 指标分布数据Repository
 */
@Repository
public interface IndicatorDistributionRepository extends JpaRepository<IndicatorDistributionEntity, Long> {

    /**
     * 查询所有当前版本的指标分布
     */
    List<IndicatorDistributionEntity> findByIsCurrentTrue();"""

repo_new = """import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 指标分布数据Repository
 */
@Repository
public interface IndicatorDistributionRepository extends JpaRepository<IndicatorDistributionEntity, Long> {

    /**
     * 查询所有当前版本的指标分布
     */
    List<IndicatorDistributionEntity> findByIsCurrentTrue();

    /**
     * 分页查询当前版本的指标分布
     */
    @Query("SELECT i FROM IndicatorDistributionEntity i WHERE i.isCurrent = true " +
           "AND (:searchTerm IS NULL OR i.indicatorName LIKE %:searchTerm% OR i.indicatorDisplayName LIKE %:searchTerm%) " +
           "AND (:indicatorType IS NULL OR i.indicatorType = :indicatorType)")
    Page<IndicatorDistributionEntity> findCurrentWithFilters(
            @Param("searchTerm") String searchTerm,
            @Param("indicatorType") IndicatorDistributionEntity.IndicatorType indicatorType,
            Pageable pageable);"""

replace_in_file(repo_path, repo_old, repo_new)

# 2. Update Service Interface
service_path = r'c:\Users\ralph\IdeaProject\okx-trading\src\main\java\com\okx\trading\service\IndicatorDistributionService.java'
service_old = """    /**
     * 获取当前版本的所有指标分布
     * 
     * @return 当前版本的指标分布Map，key为指标名称
     */
    Map<String, IndicatorDistributionEntity> getCurrentDistributions();"""

service_new = """    /**
     * 获取当前版本的所有指标分布
     * 
     * @return 当前版本的指标分布Map，key为指标名称
     */
    Map<String, IndicatorDistributionEntity> getCurrentDistributions();

    /**
     * 分页获取当前版本的指标分布
     * 
     * @param searchTerm 搜索关键词
     * @param filterType 指标类型
     * @param pageable 分页参数
     * @return 分页结果
     */
    org.springframework.data.domain.Page<IndicatorDistributionEntity> getCurrentDistributions(
            String searchTerm, String filterType, org.springframework.data.domain.Pageable pageable);"""

replace_in_file(service_path, service_old, service_new)

# 3. Update Service Impl
impl_path = r'c:\Users\ralph\IdeaProject\okx-trading\src\main\java\com\okx\trading\service\impl\IndicatorDistributionServiceImpl.java'
impl_old = """    @Override
    public Map<String, IndicatorDistributionEntity> getCurrentDistributions() {
        List<IndicatorDistributionEntity> currentDistributions = indicatorDistributionRepository.findByIsCurrentTrue();
        return currentDistributions.stream()
                .collect(Collectors.toMap(
                        IndicatorDistributionEntity::getIndicatorName,
                        entity -> entity
                ));
    }"""

impl_new = """    @Override
    public Map<String, IndicatorDistributionEntity> getCurrentDistributions() {
        List<IndicatorDistributionEntity> currentDistributions = indicatorDistributionRepository.findByIsCurrentTrue();
        return currentDistributions.stream()
                .collect(Collectors.toMap(
                        IndicatorDistributionEntity::getIndicatorName,
                        entity -> entity
                ));
    }

    @Override
    public org.springframework.data.domain.Page<IndicatorDistributionEntity> getCurrentDistributions(
            String searchTerm, String filterType, org.springframework.data.domain.Pageable pageable) {
        
        IndicatorDistributionEntity.IndicatorType type = null;
        if (filterType != null && !filterType.equalsIgnoreCase("all")) {
            try {
                type = IndicatorDistributionEntity.IndicatorType.valueOf(filterType.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("无效的指标类型: {}", filterType);
            }
        }
        
        String search = (searchTerm != null && !searchTerm.trim().isEmpty()) ? searchTerm.trim() : null;
        
        return indicatorDistributionRepository.findCurrentWithFilters(search, type, pageable);
    }"""

replace_in_file(impl_path, impl_old, impl_new)

# 4. Update Controller
controller_path = r'c:\Users\ralph\IdeaProject\okx-trading\src\main\java\com\okx\trading\controller\IndicatorDistributionController.java'
controller_old = """    /**
     * 获取当前指标分布详情
     */
    @GetMapping("/current")
    @Operation(summary = "获取当前指标分布详情")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentDistributions() {
        try {
            Map<String, IndicatorDistributionEntity> currentDistributions = indicatorDistributionService.getCurrentDistributions();

            Map<String, Object> result = ImmutableMap.of(
                    "totalCount", currentDistributions.size(),
                    "indicators", currentDistributions.keySet(),
                    "indicatorDetails", currentDistributions.values().stream()
                            .map(dist -> ImmutableMap.of(
                                    "name", dist.getIndicatorName(),
                                    "displayName", dist.getIndicatorDisplayName(),
                                    "type", dist.getIndicatorType(),
                                    "sampleCount", dist.getSampleCount(),
                                    "range", ImmutableMap.of(
                                            "min", dist.getMinValue(),
                                            "max", dist.getMaxValue(),
                                            "avg", dist.getAvgValue()
                                    ),
                                    "percentiles", ImmutableMap.<String, Object>builder()
                                            .put("p10", dist.getP10())
                                            .put("p20", dist.getP20())
                                            .put("p30", dist.getP30())
                                            .put("p40", dist.getP40())
                                            .put("p50", dist.getP50())
                                            .put("p60", dist.getP60())
                                            .put("p70", dist.getP70())
                                            .put("p80", dist.getP80())
                                            .put("p90", dist.getP90())
                                            .build()
                            ))
                            .collect(java.util.stream.Collectors.toList())
            );

            return ResponseEntity.ok(ApiResponse.success(result, "获取指标分布详情成功"));
        } catch (Exception e) {
            log.error("获取指标分布详情失败: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("获取指标分布详情失败: " + e.getMessage()));
        }
    }"""

controller_new = """    /**
     * 获取当前指标分布详情 (支持分页和过滤)
     */
    @GetMapping("/current")
    @Operation(summary = "获取当前指标分布详情")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentDistributions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String filterType) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, 
                org.springframework.data.domain.Sort.by("indicatorType").ascending().and(org.springframework.data.domain.Sort.by("indicatorDisplayName").ascending()));
            
            org.springframework.data.domain.Page<IndicatorDistributionEntity> distributionPage = 
                indicatorDistributionService.getCurrentDistributions(searchTerm, filterType, pageable);

            Map<String, Object> result = ImmutableMap.of(
                    "totalCount", distributionPage.getTotalElements(),
                    "totalPages", distributionPage.getTotalPages(),
                    "currentPage", distributionPage.getNumber(),
                    "pageSize", distributionPage.getSize(),
                    "indicatorDetails", distributionPage.getContent().stream()
                            .map(dist -> ImmutableMap.of(
                                    "name", dist.getIndicatorName(),
                                    "displayName", dist.getIndicatorDisplayName(),
                                    "type", dist.getIndicatorType(),
                                    "sampleCount", dist.getSampleCount(),
                                    "range", ImmutableMap.of(
                                            "min", dist.getMinValue(),
                                            "max", dist.getMaxValue(),
                                            "avg", dist.getAvgValue()
                                    ),
                                    "percentiles", ImmutableMap.<String, Object>builder()
                                            .put("p10", dist.getP10())
                                            .put("p20", dist.getP20())
                                            .put("p30", dist.getP30())
                                            .put("p40", dist.getP40())
                                            .put("p50", dist.getP50())
                                            .put("p60", dist.getP60())
                                            .put("p70", dist.getP70())
                                            .put("p80", dist.getP80())
                                            .put("p90", dist.getP90())
                                            .build()
                                    ))
                            .collect(java.util.stream.Collectors.toList())
            );

            return ResponseEntity.ok(ApiResponse.success(result, "获取指标分布详情成功"));
        } catch (Exception e) {
            log.error("获取指标分布详情失败: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("获取指标分布详情失败: " + e.getMessage()));
        }
    }"""

replace_in_file(controller_path, controller_old, controller_new)
