'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  RefreshCw,
  Loader2,
  Database,
  Upload
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';
import { 
  getProducts, 
  getDataStatus,
  Product,
  ProductStats,
  subscribeToDataChanges
} from '@/lib/data';

const COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#a7f3d0'];

const mockProducts: Product[] = [
  { id: 1, name: '防晒喷雾SPF50+', category: '美妆护肤', price: 129.99, sales_volume: 15000, sales_growth: 35.5, rating: 4.8, review_count: 8500, trend_score: 92.5, platform: 'AMAZON', image_url: 'https://picsum.photos/200/200?random=1' },
  { id: 2, name: '无线蓝牙耳机 Pro', category: '电子产品', price: 299.99, sales_volume: 12000, sales_growth: 28.3, rating: 4.7, review_count: 6200, trend_score: 88.2, platform: 'SHOPIFY', image_url: 'https://picsum.photos/200/200?random=2' },
  { id: 3, name: '智能运动手表', category: '电子产品', price: 599.99, sales_volume: 8500, sales_growth: 42.1, rating: 4.9, review_count: 4800, trend_score: 95.8, platform: 'AMAZON', image_url: 'https://picsum.photos/200/200?random=3' },
  { id: 4, name: '保湿面霜套装', category: '美妆护肤', price: 399.99, sales_volume: 7800, sales_growth: 22.4, rating: 4.6, review_count: 3200, trend_score: 85.0, platform: 'SHOPIFY', image_url: 'https://picsum.photos/200/200?random=4' },
  { id: 5, name: '家用空气净化器', category: '家居用品', price: 1299.99, sales_volume: 3200, sales_growth: 15.8, rating: 4.5, review_count: 1500, trend_score: 78.5, platform: 'AMAZON', image_url: 'https://picsum.photos/200/200?random=5' },
];

function generateMockStats(): ProductStats {
  return {
    total_products: mockProducts.length,
    total_sales: mockProducts.reduce((sum, p) => sum + p.sales_volume, 0),
    total_revenue: mockProducts.reduce((sum, p) => sum + (p.price * p.sales_volume), 0),
    avg_growth: mockProducts.reduce((sum, p) => sum + p.sales_growth, 0) / mockProducts.length,
    avg_rating: mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length,
    categories: {
      '美妆护肤': mockProducts.filter(p => p.category === '美妆护肤').length,
      '电子产品': mockProducts.filter(p => p.category === '电子产品').length,
      '家居用品': mockProducts.filter(p => p.category === '家居用品').length,
    },
    platforms: {
      'AMAZON': mockProducts.filter(p => p.platform === 'AMAZON').length,
      'SHOPIFY': mockProducts.filter(p => p.platform === 'SHOPIFY').length,
    }
  };
}

function generateCategoryChartData(products: Product[]): { name: string; value: number; sales: number }[] {
  const categoryMap: Record<string, { count: number; sales: number }> = {};
  
  products.forEach(p => {
    const cat = p.category || '未分类';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, sales: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].sales += p.price * p.sales_volume;
  });
  
  const totalSales = Object.values(categoryMap).reduce((sum, c) => sum + c.sales, 0);
  
  return Object.entries(categoryMap)
    .map(([name, data]) => ({
      name,
      value: totalSales > 0 ? parseFloat(((data.sales / totalSales) * 100).toFixed(1)) : 0,
      sales: data.sales
    }))
    .sort((a, b) => b.value - a.value);
}

function generateTopProducts(products: Product[]): { id: number; name: string; salesAmount: number; salesQuantity: number; profit: number; profitMargin: number; returnRate: number; }[] {
  return products
    .map(p => ({
      id: p.id,
      name: p.name,
      salesAmount: p.price * p.sales_volume,
      salesQuantity: p.sales_volume,
      profit: p.price * p.sales_volume * 0.3,
      profitMargin: 30,
      returnRate: 1 + Math.random() * 4
    }))
    .sort((a, b) => b.salesAmount - a.salesAmount)
    .slice(0, 10);
}

function generateSalesTrendData(baseSales: number = 0): { month: string; sales: number; orders: number; profit: number }[] {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const baseValue = baseSales > 0 ? baseSales / 6 : 500000;
  
  return months.map((month, index) => {
    const variation = 0.8 + (index * 0.08);
    return {
      month,
      sales: Math.round(baseValue * variation),
      orders: Math.round((baseValue * variation) / 250),
      profit: Math.round(baseValue * variation * 0.3)
    };
  });
}

function generateDailySalesData(): { date: string; sales: number; orders: number; visitors: number }[] {
  return [
    { date: '4/1', sales: 45000, orders: 180, visitors: 5000 },
    { date: '4/8', sales: 52000, orders: 210, visitors: 5500 },
    { date: '4/15', sales: 48000, orders: 195, visitors: 5200 },
    { date: '4/22', sales: 62000, orders: 250, visitors: 6500 },
  ];
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const periods = [
    { value: '7d', label: '近7天' },
    { value: '30d', label: '近30天' },
    { value: '90d', label: '近90天' },
  ];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
        setProducts(mockProducts);
        setStats(generateMockStats());
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      setProducts(mockProducts);
      setStats(generateMockStats());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToDataChanges('products', fetchData);
    return unsubscribe;
  }, [fetchData]);

  const displayProducts = products.length > 0 ? products : mockProducts;
  const displayStats = stats || generateMockStats();
  
  const totalRevenue = displayStats.total_revenue || 0;
  const totalSales = displayStats.total_sales || 0;
  const avgGrowth = displayStats.avg_growth || 0;
  
  const categoryChartData = generateCategoryChartData(displayProducts);
  const topProducts = generateTopProducts(displayProducts);
  const salesTrendData = generateSalesTrendData(totalRevenue);
  const dailySalesData = generateDailySalesData();

  const dashboardStats = [
    {
      title: '总销售额',
      value: formatCurrency(totalRevenue),
      change: avgGrowth,
      icon: DollarSign,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: '总销量',
      value: formatNumber(totalSales),
      change: avgGrowth,
      icon: ShoppingCart,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      title: '产品数量',
      value: formatNumber(displayStats.total_products),
      change: 0,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '平均增长率',
      value: avgGrowth > 0 ? `+${avgGrowth.toFixed(1)}%` : `${avgGrowth.toFixed(1)}%`,
      change: 0,
      icon: TrendingUp,
      color: avgGrowth >= 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: avgGrowth >= 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
    {
      title: '平均评分',
      value: displayStats.avg_rating.toFixed(1),
      change: 0,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '分类数量',
      value: formatNumber(Object.keys(displayStats.categories || {}).length),
      change: 0,
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">商品运营数据分析</h1>
          <p className="text-secondary-500 mt-1">查看您的电商运营数据概览和详细分析</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImportedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Database className="w-4 h-4" />
              <span>已导入 {products.length} 条数据</span>
            </div>
          )}
          {!hasImportedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <Upload className="w-4 h-4" />
              <span>使用示例数据</span>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-secondary-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-1">
            {periods.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasImportedData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-4">
          <Upload className="w-6 h-6 text-amber-500" />
          <div>
            <p className="font-medium text-amber-800">当前使用示例数据</p>
            <p className="text-sm text-amber-600 mt-1">点击右上角"导入数据"按钮，上传您的电商产品数据文件</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.change !== 0 && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    stat.change >= 0 ? 'text-primary-600' : 'text-red-500'
                  }`}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {formatPercent(stat.change)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-secondary-500 text-xs">{stat.title}</p>
                <p className="text-lg font-bold text-secondary-800 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">销售趋势分析</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-sm text-secondary-600">销售额</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-secondary-600">订单数</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: number, name: string) => [
                    name === 'sales' ? formatCurrency(value) : formatNumber(value),
                    name === 'sales' ? '销售额' : '订单数'
                  ]}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="sales"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="orders"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">分类销售占比</h2>
            <PieChartIcon className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryChartData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-800">{item.value}%</span>
                  <span className="text-xs text-secondary-400">{formatCurrency(item.sales)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">利润趋势</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `¥${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '利润']}
                />
                <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">每日销售对比</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `¥${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  name="销售额"
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="访客数"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-800">热销产品排行</h2>
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>按销售额</option>
              <option>按销量</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">产品名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">分类</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">销售额</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">销量</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">利润</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">增长率</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => {
                  const fullProduct = displayProducts.find(p => p.id === product.id);
                  return (
                    <tr key={product.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {fullProduct?.image_url && (
                            <img 
                              src={fullProduct.image_url} 
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <p className="font-medium text-secondary-800">{product.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                          {fullProduct?.category || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-secondary-800">{formatCurrency(product.salesAmount)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-secondary-600">{formatNumber(product.salesQuantity)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-primary-600">{formatCurrency(product.profit)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${
                          (fullProduct?.sales_growth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {(fullProduct?.sales_growth || 0) >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {formatPercent(fullProduct?.sales_growth || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
