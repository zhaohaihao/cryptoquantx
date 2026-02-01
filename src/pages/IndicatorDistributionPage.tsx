import React, { useState, useEffect } from 'react';
import { fetchIndicatorDistributions, updateIndicatorDistributions, fetchAccountBalance } from '../services/api';
import { useAdaptivePagination } from '../hooks/useAdaptivePagination';
import './IndicatorDistributionPage.css';

interface IndicatorDetail {
  name: string;
  displayName: string;
  type: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sampleCount: number;
  range: {
    min: number;
    max: number;
    avg: number;
  };
  percentiles: {
    p10: number;
    p20: number;
    p30: number;
    p40: number;
    p50: number;
    p60: number;
    p70: number;
    p80: number;
    p90: number;
  };
}

interface IndicatorDistributionData {
  totalCount: number;
  indicatorDetails: IndicatorDetail[];
}

const IndicatorDistributionPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IndicatorDistributionData | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  // 添加分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 自适应页大小计算
  const { pageSize: adaptivePageSize } = useAdaptivePagination({
    rowHeight: 52, 
    minPageSize: 5,
    navbarHeight: 64, 
    basePadding: 20, 
    getOtherElementsHeight: () => {
      const legend = document.querySelector('.type-legend') as HTMLElement | null;
      const pagination = document.querySelector('.pagination-container') as HTMLElement | null;
      const tableHeader = document.querySelector('.indicator-distribution-table thead') as HTMLElement | null;
      
      const legendHeight = legend?.offsetHeight || 44; 
      const paginationHeight = pagination?.offsetHeight || 72; 
      const tableHeaderHeight = tableHeader?.offsetHeight || 50;
      
      const extraHeight = 20; 
      return legendHeight + paginationHeight + tableHeaderHeight + extraHeight;
    },
    dependencies: [] // 彻底移除 loading 依赖，防止加载状态切换导致重算
  });

  // 只有当 adaptivePageSize 稳定后（且不是默认的 minPageSize）才设置真正的 pageSize
  useEffect(() => {
    if (adaptivePageSize > 5) { // 假设正常屏幕下计算出来的 size 肯定大于 5 (minPageSize)
      setPageSize(adaptivePageSize);
    } else {
      // 如果计算出来刚好是 5 或者还在初始化，等 200ms 再确认一次
      const timer = setTimeout(() => {
        setPageSize(adaptivePageSize);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [adaptivePageSize]);

  // 添加账户余额状态
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  // 加载指标分布数据
  const loadIndicatorDistributions = async (page: number = currentPage, size: number = pageSize) => {
    if (size <= 0) return; // 还没计算好，坚决不加载
    
    setLoading(true);
    setError(null);
    try {
      // 后端分页从0开始，前端从1开始
      console.log(`正在请求分页数据: page=${page-1}, size=${size}, search=${searchTerm}, filter=${filterType}`);
      const result = await fetchIndicatorDistributions(page - 1, size, searchTerm, filterType);
      console.log('API 返回原始数据:', result);
      
      if (result.success && result.data) {
        setData(result.data);
        const pages = result.data.totalPages || 0;
        const total = result.data.totalCount || 0;
        console.log(`解析分页信息: totalPages=${pages}, totalElements=${total}`);
        setTotalPages(pages);
        setTotalElements(total);
      } else {
        setError(result.message || '获取指标分布详情失败');
      }
    } catch (error) {
      console.error('获取指标分布详情时发生错误:', error);
      setError('获取指标分布详情时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 更新指标分布
  const handleUpdateDistributions = async () => {
    setUpdating(true);
    try {
      const result = await updateIndicatorDistributions();
      if (result.success) {
        // 重新加载数据
        loadIndicatorDistributions(1, pageSize);
        setError(null);
      } else {
        setError(result.message || '更新指标分布失败');
      }
    } catch (error) {
      console.error('更新指标分布时发生错误:', error);
      setError('更新指标分布时发生错误');
    } finally {
      setUpdating(false);
    }
  };

  // 监听筛选和分页变化
  useEffect(() => {
    if (pageSize > 0) {
      loadIndicatorDistributions(currentPage, pageSize);
    }
  }, [currentPage, pageSize, filterType]);

  // 处理搜索 (带防抖或手动触发)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pageSize > 0) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          loadIndicatorDistributions(1, pageSize);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载账户余额
  const loadAccountBalance = async () => {
    setLoadingBalance(true);
    try {
      const result = await fetchAccountBalance();
      if (result.success && result.data) {
        // 查找USDT资产并使用其available值
        const usdtAsset = result.data.assetBalances?.find((asset: { asset: string; available: number }) => asset.asset === 'USDT');
        if (usdtAsset) {
          setAccountBalance(usdtAsset.available);
        } else {
          // 如果没有找到USDT资产，回退到使用availableBalance
          setAccountBalance(result.data.availableBalance);
        }
      } else {
        console.error('获取账户余额失败:', result.message);
      }
    } catch (error) {
      console.error('获取账户余额时发生错误:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadAccountBalance(); // 加载账户余额
  }, []);

  // 格式化指标值
  const formatValue = (value: number, indicator: IndicatorDetail): string => {
    // 特殊处理非百分比指标
    if (["numberOfTrades", "maxDrawdownDuration"].includes(indicator.name)) {
      return value ? value.toFixed(0) : '0';
    } else {
      return value ? `${(value * 100).toFixed(2)}%` : '0.00%';
    }
  };

  // 获取指标类型中文
  const getTypeText = (type: string): string => {
    switch (type) {
      case "POSITIVE": return "正向(↑)";
      case "NEGATIVE": return "负向(↓)";
      case "NEUTRAL": return "中性";
      default: return type;
    }
  };

  // 根据类型获取标记
  const getTypeEmoji = (type: string): string => {
    switch (type) {
      case "POSITIVE": return "↑";
      case "NEGATIVE": return "↓";
      case "NEUTRAL": return "•";
      default: return "";
    }
  };

  // 根据类型获取类名
  const getTypeClass = (type: string): string => {
    switch (type) {
      case "POSITIVE": return "positive";
      case "NEGATIVE": return "negative";
      case "NEUTRAL": return "neutral";
      default: return "";
    }
  };

  // 处理页面变更
  const handlePageChange = (newPage: number) => {
    console.log(`切换页面: from ${currentPage} to ${newPage}, totalPages: ${totalPages}`);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // 滚动到顶部
      const contentElement = document.querySelector('.content');
      if (contentElement) {
        contentElement.scrollTop = 0;
      }
    }
  };

  // 渲染表头
  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          <th>指标名称</th>
          <th>类型</th>
          <th>10%</th>
          <th>20%</th>
          <th>30%</th>
          <th>40%</th>
          <th>50%(中位数)</th>
          <th>60%</th>
          <th>70%</th>
          <th>80%</th>
          <th>90%</th>
        </tr>
      </thead>
    );
  };

  // 渲染表格内容
  const renderTableBody = () => {
    const indicators = data?.indicatorDetails || [];

    if (indicators.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={11} className="no-data">没有找到符合条件的指标数据</td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {indicators.map((indicator) => (
          <tr key={indicator.name} className={getTypeClass(indicator.type)}>
            <td className="indicator-name">
              <span className="display-name">{indicator.displayName}</span>
              <span className="code-name">({indicator.name})</span>
            </td>
            <td className={`indicator-type ${getTypeClass(indicator.type)}`}>
              {getTypeText(indicator.type)}
            </td>
            <td>{formatValue(indicator.percentiles.p10, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p20, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p30, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p40, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p50, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p60, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p70, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p80, indicator)}</td>
            <td>{formatValue(indicator.percentiles.p90, indicator)}</td>
          </tr>
        ))}
      </tbody>
    );
  };

  // 渲染表格
  const renderTable = () => {
    return (
      <div className="table-container">
        <table className="indicator-distribution-table">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>
    );
  };

  // 渲染指标说明和操作栏
  const renderHeader = () => {
    return (
      <div className="type-legend">
        <div className="legend-content">
          <h3 className="legend-title">指标类型说明</h3>
          <ul className="legend-list">
            <li className="positive">
              <span className="legend-icon">↑</span>
              <span className="legend-text">正向指标</span>
            </li>
            <li className="negative">
              <span className="legend-icon">↓</span>
              <span className="legend-text">负向指标</span>
            </li>
            <li className="neutral">
              <span className="legend-icon">•</span>
              <span className="legend-text">中性指标</span>
            </li>
          </ul>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索指标..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
          >
            全部
          </button>
          <button
            className={`filter-btn positive ${filterType === 'POSITIVE' ? 'active' : ''}`}
            onClick={() => {
              setFilterType('POSITIVE');
              setCurrentPage(1);
            }}
          >
            正向
          </button>
          <button
            className={`filter-btn negative ${filterType === 'NEGATIVE' ? 'active' : ''}`}
            onClick={() => {
              setFilterType('NEGATIVE');
              setCurrentPage(1);
            }}
          >
            负向
          </button>
          <button
            className="refresh-btn"
            onClick={() => loadIndicatorDistributions(currentPage, pageSize)}
            disabled={loading}
          >
            {loading ? '...' : '刷新'}
          </button>
          <button
            className="update-btn"
            onClick={handleUpdateDistributions}
            disabled={updating}
          >
            {updating ? '...' : '更新分布'}
          </button>
        </div>
      </div>
    );
  };

  // 主页面渲染
  return (
    <div className="indicator-distribution-page">


      {renderHeader()}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>加载指标分布数据中...</p>
        </div>
      ) : data ? (
        <div className="content">
          {renderTable()}

          {/* 分页控件 - 只要有数据就显示，方便查看总条数，且与电报页面保持一致的分页逻辑 */}
          {totalElements > 0 && (
            <div className="pagination-container">
              <div className="pagination-buttons">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-button"
                >
                  首页
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-button"
                >
                  上一页
                </button>
                <div className="pagination-info">
                  {currentPage} / {Math.max(1, totalPages)} 页 (共 {totalElements} 条记录)
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="pagination-button"
                >
                  下一页
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages || loading}
                  className="pagination-button"
                >
                  末页
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data-message">
          无法获取指标分布数据，请点击刷新按钮重试。
        </div>
      )}
    </div>
  );
};

export default IndicatorDistributionPage;
