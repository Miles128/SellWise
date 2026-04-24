'use client';

import { useState } from 'react';
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
  BarChart3
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

const dailySalesData = [
  { date: '4/1', sales: 45000, orders: 180, visitors: 5000 },
  { date: '4/5', sales: 52000, orders: 210, visitors: 5500 },
  { date: '4/10', sales: 48000, orders: 195, visitors: 5200 },
  { date: '4/15', sales: 62000, orders: 250, visitors: 6500 },
  { date: '4/20', sales: 58000, orders: 235, visitors: 6000 },
  { date: '4/24', sales: 65000, orders: 260, visitors: 6800 },
];

const monthlyData = [
  { month: '1月', sales: 450000, orders: 1800, profit: 135000 },
  { month: '2月', sales: 520000, orders: 2100, profit: 156000 },
  { month: '3月', sales: 480000, orders: 1950, profit: 144000 },
  { month: '4月', sales: 620000, orders: 2500, profit: 186000 },
  { month: '5月', sales: 580000, orders: 2350, profit: 174000 },
  { month: '6月', sales: 650000, orders: 2600, profit: 195000 },
];

const categorySales = [
  { name: '美妆护肤', value: 35.5, sales: 532500 },
  { name: '家居用品', value: 25.0, sales: 375000 },
  { name: '电子产品', value: 20.5, sales: 307500 },
  { name: '服装配饰', value: 12.0, sales: 180000 },
  { name: '食品饮料', value: 7.0, sales: 105000 },
];

const COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

const topProducts = [
  { id: 1, name: '热销产品A', salesAmount: 150000, salesQuantity: 1000, profit: 45000, profitMargin: 30, returnRate: 2.5 },
  { id: 2, name: '热销产品B', salesAmount: 120000, salesQuantity: 800, profit: 36000, profitMargin: 30, returnRate: 3.2 },
  { id: 3, name: '热销产品C', salesAmount: 100000, salesQuantity: 600, profit: 30000, profitMargin: 30, returnRate: 1.8 },
  { id: 4, name: '热销产品D', salesAmount: 90000, salesQuantity: 500, profit: 27000, profitMargin: 30, returnRate: 4.1 },
  { id: 5, name: '热销产品E', salesAmount: 80000, salesQuantity: 450, profit: 24000, profitMargin: 30, returnRate: 2.0 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const periods = [
    { value: '7d', label: '近7天' },
    { value: '30d', label: '近30天' },
    { value: '90d', label: '近90天' },
  ];

  const stats = [
    {
      title: '总销售额',
      value: formatCurrency(1500000),
      change: 12.5,
      icon: DollarSign,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: '总订单数',
      value: formatNumber(6000),
      change: 8.3,
      icon: ShoppingCart,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      title: '访客数',
      value: formatNumber(150000),
      change: 15.2,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '转化率',
      value: '4.0%',
      change: 2.1,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: '总利润',
      value: formatCurrency(450000),
      change: 18.7,
      icon: Package,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      title: '平均客单价',
      value: formatCurrency(250),
      change: -3.2,
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">运营数据分析</h1>
          <p className="text-secondary-500 mt-1">深入分析销售数据，洞察业务增长机会</p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
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
              <AreaChart data={monthlyData}>
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
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorySales.map((entry, index) => (
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
            {categorySales.map((item, index) => (
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
              <BarChart data={monthlyData}>
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
              <option>按利润</option>
              <option>按销量</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">排名</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500">产品名称</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">销售额</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">销量</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">利润</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">利润率</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-secondary-500">退货率</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-secondary-800">{product.name}</p>
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
                    <span className="text-primary-600">{product.profitMargin}%</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={product.returnRate > 3 ? 'text-red-500' : 'text-secondary-600'}>
                      {product.returnRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
