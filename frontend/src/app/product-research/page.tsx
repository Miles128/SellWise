'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  Database,
  Upload
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { 
  getProducts, 
  getDataStatus,
  Product,
  ProductStats,
  subscribeToDataChanges,
  clearDataCache
} from '@/lib/data';

const mockTrendProducts: Product[] = [
  { id: 1, name: '防晒喷雾SPF50+', category: '美妆护肤', price: 129.99, sales_volume: 15000, sales_growth: 35.5, rating: 4.8, review_count: 8500, trend_score: 92.5, platform: 'AMAZON', image_url: 'https://picsum.photos/200/200?random=1' },
  { id: 2, name: '无线蓝牙耳机 Pro', category: '电子产品', price: 299.99, sales_volume: 12000, sales_growth: 28.3, rating: 4.7, review_count: 6200, trend_score: 88.2, platform: 'SHOPIFY', image_url: 'https://picsum.photos/200/200?random=2' },
  { id: 3, name: '智能运动手表', category: '电子产品', price: 599.99, sales_volume: 8500, sales_growth: 42.1, rating: 4.9, review_count: 4800, trend_score: 95.8, platform: 'AMAZON', image_url: 'https://picsum.photos/200/200?random=3' },
  { id: 4, name: '家居收纳套装', category: '家居用品', price: 89.99, sales_volume: 20000, sales_growth: 18.7, rating: 4.5, review_count: 9200, trend_score: 78.5, platform: 'EBAY', image_url: 'https://picsum.photos/200/200?random=4' },
  { id: 5, name: '美妆礼盒套装', category: '美妆护肤', price: 399.99, sales_volume: 6500, sales_growth: 52.3, rating: 4.6, review_count: 3500, trend_score: 96.2, platform: 'SHOPIFY', image_url: 'https://picsum.photos/200/200?random=5' },
];

const mockCategoryTrends = [
  { category: '美妆护肤', salesVolume: 150000, growthRate: 28.5, productCount: 1200, avgPrice: 159.99 },
  { category: '家居用品', salesVolume: 120000, growthRate: 15.2, productCount: 950, avgPrice: 89.99 },
  { category: '电子产品', salesVolume: 200000, growthRate: 32.8, productCount: 850, avgPrice: 599.99 },
  { category: '服装配饰', salesVolume: 180000, growthRate: 19.3, productCount: 2100, avgPrice: 129.99 },
  { category: '食品饮料', salesVolume: 95000, growthRate: 12.1, productCount: 650, avgPrice: 49.99 },
];

const mockChartData = [
  { month: '1月', sales: 85000, products: 120 },
  { month: '2月', sales: 92000, products: 135 },
  { month: '3月', sales: 108000, products: 150 },
  { month: '4月', sales: 125000, products: 168 },
  { month: '5月', sales: 142000, products: 185 },
  { month: '6月', sales: 158000, products: 200 },
];

const mockPieData = [
  { name: '上升趋势', value: 65, color: '#22c55e' },
  { name: '下降趋势', value: 25, color: '#ef4444' },
  { name: '持平', value: 10, color: '#94a3b8' },
];

export default function ProductResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trend_score');
  const [products, setProducts] = useState<Product[]>(mockTrendProducts);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getDataStatus();
      const hasData = status.has_products;
      setHasImportedData(hasData);

      if (hasData) {
        const response = await getProducts();
        if (response.success && response.data.length > 0) {
          setProducts(response.data);
          setStats(response.stats || null);
        }
      } else {
        setProducts(mockTrendProducts);
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      setProducts(mockTrendProducts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToDataChanges(fetchData);
    return unsubscribe;
  }, [fetchData]);

  const categories = [
    { value: 'all', label: '全部分类' },
    ...Array.from(new Set(products.map(p => p.category))).filter(c => c).map(c => ({ value: c, label: c })),
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'trend_score') return b.trend_score - a.trend_score;
    if (sortBy === 'sales_growth') return b.sales_growth - a.sales_growth;
    if (sortBy === 'price') return a.price - b.price;
    return 0;
  });

  const risingCount = products.filter(p => p.sales_growth > 0).length;
  const fallingCount = products.filter(p => p.sales_growth < 0).length;

  const categoryStats = stats?.categories 
    ? Object.entries(stats.categories).map(([category, count]) => ({
        category,
        salesVolume: products.filter(p => p.category === category).reduce((sum, p) => sum + p.sales_volume, 0),
        growthRate: products.filter(p => p.category === category).reduce((sum, p) => sum + p.sales_growth, 0) / Math.max(products.filter(p => p.category === category).length, 1),
        productCount: count,
        avgPrice: products.filter(p => p.category === category).reduce((sum, p) => sum + p.price, 0) / Math.max(products.filter(p => p.category === category).length, 1),
      }))
    : mockCategoryTrends;

  const dynamicPieData = hasImportedData && products.length > 0
    ? [
        { name: '上升趋势', value: risingCount, color: '#22c55e' },
        { name: '下降趋势', value: fallingCount, color: '#ef4444' },
        { name: '持平', value: products.length - risingCount - fallingCount, color: '#94a3b8' },
      ].filter(d => d.value > 0)
    : mockPieData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">电商选题</h1>
          <p className="text-secondary-500 mt-1">发现市场趋势，挖掘热门产品机会</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImportedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Database className="w-4 h-4" />
              <span>已导入 {products.length} 条数据</span>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-secondary-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!hasImportedData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-4">
          <Upload className="w-6 h-6 text-amber-500" />
          <div>
            <p className="font-medium text-amber-800">当前使用示例数据</p>
            <p className="text-sm text-amber-600 mt-1">点击右上角"导入数据"按钮，上传您的 CSV/XLSX 数据文件</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary-50">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />}
          </div>
          <p className="text-secondary-500 text-sm">上升趋势产品</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">{risingCount || stats?.total_products || 35}</p>
          {stats?.avg_growth !== undefined && (
            <p className="text-primary-600 text-sm mt-1">平均增长 {formatPercent(stats.avg_growth)}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">下降趋势产品</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">{fallingCount || 15}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">产品总数</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">{stats?.total_products || products.length || 128}</p>
          {stats?.avg_rating !== undefined && (
            <p className="text-purple-600 text-sm mt-1">平均评分 {stats.avg_rating}</p>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">总销售额</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">
            {stats?.total_revenue ? formatCurrency(stats.total_revenue) : '¥' + (stats?.total_sales ? stats.total_sales * 100 : 1500000).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">销售趋势分析</h2>
            <select className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>近6个月</option>
              <option>近12个月</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickFormatter={(v) => `¥${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  name="销售额"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="products" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="产品数"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">趋势分布</h2>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dynamicPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} 个`, '产品数']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {dynamicPieData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">
              热门趋势产品
              {hasImportedData && <span className="ml-2 text-sm font-normal text-secondary-500">({products.length} 个产品)</span>}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="搜索产品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="trend_score">按趋势分数</option>
                <option value="sales_growth">按增长率</option>
                <option value="price">按价格</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
              <p className="text-secondary-500">没有找到匹配的产品</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary-50 transition-colors border border-secondary-100">
                  <img 
                    src={product.image_url || 'https://picsum.photos/200/200?random=' + product.id}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-secondary-800 truncate">{product.name}</h3>
                      {product.category && (
                        <span className="px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs rounded-full flex-shrink-0">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-primary-600 font-semibold">{formatCurrency(product.price)}</span>
                      <span className="text-secondary-500 text-sm">销量: {formatNumber(product.sales_volume)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-secondary-600 text-sm">{product.rating}</span>
                      </div>
                      {product.platform && (
                        <span className="text-secondary-500 text-sm">{product.platform}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      product.sales_growth >= 0 ? 'text-primary-600' : 'text-red-500'
                    }`}>
                      {product.sales_growth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {formatPercent(product.sales_growth)}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-secondary-500">趋势分数: </span>
                      <span className="font-semibold text-secondary-800">{product.trend_score}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-secondary-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">分类趋势</h2>
            <div className="space-y-4">
              {categoryStats.slice(0, 4).map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-800">{cat.category}</p>
                    <p className="text-sm text-secondary-500">{cat.productCount} 个产品</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-800">{formatNumber(cat.salesVolume)}</p>
                    <p className={`text-sm ${cat.growthRate >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
                      {formatPercent(cat.growthRate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stats?.platforms && Object.keys(stats.platforms).length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4">平台分布</h2>
              <div className="space-y-3">
                {Object.entries(stats.platforms).map(([platform, count], index) => (
                  <div key={platform} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-secondary-800">{platform}</span>
                    </div>
                    <span className="text-sm text-secondary-600">{count} 个产品</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
