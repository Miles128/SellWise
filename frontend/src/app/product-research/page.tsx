'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
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

const trendProducts = [
  { 
    id: 1, 
    name: '防晒喷雾SPF50+', 
    category: '美妆护肤', 
    price: 129.99, 
    salesVolume: 15000, 
    salesGrowth: 35.5, 
    rating: 4.8, 
    reviewCount: 8500,
    trendScore: 92.5,
    platform: 'Amazon',
    image: 'https://picsum.photos/200/200?random=1'
  },
  { 
    id: 2, 
    name: '无线蓝牙耳机 Pro', 
    category: '电子产品', 
    price: 299.99, 
    salesVolume: 12000, 
    salesGrowth: 28.3, 
    rating: 4.7, 
    reviewCount: 6200,
    trendScore: 88.2,
    platform: 'Shopify',
    image: 'https://picsum.photos/200/200?random=2'
  },
  { 
    id: 3, 
    name: '智能运动手表', 
    category: '电子产品', 
    price: 599.99, 
    salesVolume: 8500, 
    salesGrowth: 42.1, 
    rating: 4.9, 
    reviewCount: 4800,
    trendScore: 95.8,
    platform: 'Amazon',
    image: 'https://picsum.photos/200/200?random=3'
  },
  { 
    id: 4, 
    name: '家居收纳套装', 
    category: '家居用品', 
    price: 89.99, 
    salesVolume: 20000, 
    salesGrowth: 18.7, 
    rating: 4.5, 
    reviewCount: 9200,
    trendScore: 78.5,
    platform: 'eBay',
    image: 'https://picsum.photos/200/200?random=4'
  },
  { 
    id: 5, 
    name: '美妆礼盒套装', 
    category: '美妆护肤', 
    price: 399.99, 
    salesVolume: 6500, 
    salesGrowth: 52.3, 
    rating: 4.6, 
    reviewCount: 3500,
    trendScore: 96.2,
    platform: 'Shopify',
    image: 'https://picsum.photos/200/200?random=5'
  },
];

const categoryTrends = [
  { category: '美妆护肤', salesVolume: 150000, growthRate: 28.5, productCount: 1200, avgPrice: 159.99 },
  { category: '家居用品', salesVolume: 120000, growthRate: 15.2, productCount: 950, avgPrice: 89.99 },
  { category: '电子产品', salesVolume: 200000, growthRate: 32.8, productCount: 850, avgPrice: 599.99 },
  { category: '服装配饰', salesVolume: 180000, growthRate: 19.3, productCount: 2100, avgPrice: 129.99 },
  { category: '食品饮料', salesVolume: 95000, growthRate: 12.1, productCount: 650, avgPrice: 49.99 },
];

const hotKeywords = [
  { keyword: '防晒喷雾', searchVolume: 125000, trend: 'up' },
  { keyword: '无线耳机', searchVolume: 98000, trend: 'up' },
  { keyword: '智能手表', searchVolume: 87000, trend: 'up' },
  { keyword: '美妆套装', searchVolume: 76000, trend: 'down' },
  { keyword: '家居收纳', searchVolume: 65000, trend: 'up' },
  { keyword: '运动装备', searchVolume: 54000, trend: 'up' },
];

const chartData = [
  { month: '1月', sales: 85000, products: 120 },
  { month: '2月', sales: 92000, products: 135 },
  { month: '3月', sales: 108000, products: 150 },
  { month: '4月', sales: 125000, products: 168 },
  { month: '5月', sales: 142000, products: 185 },
  { month: '6月', sales: 158000, products: 200 },
];

const pieData = [
  { name: '上升趋势', value: 65, color: '#22c55e' },
  { name: '下降趋势', value: 25, color: '#ef4444' },
  { name: '持平', value: 10, color: '#94a3b8' },
];

export default function ProductResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trendScore');

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: '美妆护肤', label: '美妆护肤' },
    { value: '电子产品', label: '电子产品' },
    { value: '家居用品', label: '家居用品' },
    { value: '服装配饰', label: '服装配饰' },
  ];

  const filteredProducts = trendProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'trendScore') return b.trendScore - a.trendScore;
    if (sortBy === 'salesGrowth') return b.salesGrowth - a.salesGrowth;
    if (sortBy === 'price') return a.price - b.price;
    return 0;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">电商选题</h1>
          <p className="text-secondary-500 mt-1">发现市场趋势，挖掘热门产品机会</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary-50">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">上升趋势产品</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">35</p>
          <p className="text-primary-600 text-sm mt-1">+12 较上周</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">下降趋势产品</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">15</p>
          <p className="text-red-600 text-sm mt-1">-5 较上周</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50">
              <Star className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">热门关键词</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">128</p>
          <p className="text-purple-600 text-sm mt-1">+25 较上周</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-secondary-500 text-sm">监控产品数</p>
          <p className="text-2xl font-bold text-secondary-800 mt-1">2,458</p>
          <p className="text-blue-600 text-sm mt-1">+156 较上周</p>
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
              <LineChart data={chartData}>
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '占比']}
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
              {pieData.map((item, index) => (
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
            <h2 className="text-lg font-semibold text-secondary-800">热门趋势产品</h2>
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
                <option value="trendScore">按趋势分数</option>
                <option value="salesGrowth">按增长率</option>
                <option value="price">按价格</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary-50 transition-colors border border-secondary-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-secondary-800">{product.name}</h3>
                    <span className="px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-primary-600 font-semibold">{formatCurrency(product.price)}</span>
                    <span className="text-secondary-500 text-sm">销量: {formatNumber(product.salesVolume)}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-secondary-600 text-sm">{product.rating}</span>
                    </div>
                    <span className="text-secondary-500 text-sm">{product.platform}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    product.salesGrowth >= 0 ? 'text-primary-600' : 'text-red-500'
                  }`}>
                    {product.salesGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {formatPercent(product.salesGrowth)}
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-secondary-500">趋势分数: </span>
                    <span className="font-semibold text-secondary-800">{product.trendScore}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-secondary-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">分类趋势</h2>
            <div className="space-y-4">
              {categoryTrends.slice(0, 4).map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-800">{cat.category}</p>
                    <p className="text-sm text-secondary-500">{formatNumber(cat.productCount)} 个产品</p>
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

          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-800 mb-4">热门关键词</h2>
            <div className="space-y-3">
              {hotKeywords.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-secondary-800">{item.keyword}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">{formatNumber(item.searchVolume)}</span>
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-primary-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
