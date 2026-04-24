'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Eye,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
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
  Cell
} from 'recharts';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

const salesData = [
  { date: '4/1', sales: 45000, orders: 180 },
  { date: '4/5', sales: 52000, orders: 210 },
  { date: '4/10', sales: 48000, orders: 195 },
  { date: '4/15', sales: 62000, orders: 250 },
  { date: '4/20', sales: 58000, orders: 235 },
  { date: '4/24', sales: 65000, orders: 260 },
];

const categoryData = [
  { name: '美妆护肤', value: 35.5, color: '#22c55e' },
  { name: '家居用品', value: 25.0, color: '#4ade80' },
  { name: '电子产品', value: 20.5, color: '#86efac' },
  { name: '服装配饰', value: 12.0, color: '#bbf7d0' },
  { name: '其他', value: 7.0, color: '#dcfce7' },
];

const topProducts = [
  { id: 1, name: '热销产品A', sales: 150000, growth: 12.5 },
  { id: 2, name: '热销产品B', sales: 120000, growth: 8.3 },
  { id: 3, name: '热销产品C', sales: 100000, growth: 15.2 },
  { id: 4, name: '热销产品D', sales: 90000, growth: -2.1 },
  { id: 5, name: '热销产品E', sales: 80000, growth: 6.7 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalVisitors: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalSales: 1500000,
        totalOrders: 6000,
        totalVisitors: 150000,
        conversionRate: 4.0,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: '总销售额',
      value: formatCurrency(stats.totalSales),
      change: 12.5,
      icon: DollarSign,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      title: '总订单数',
      value: formatNumber(stats.totalOrders),
      change: 8.3,
      icon: ShoppingCart,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      title: '访客数',
      value: formatNumber(stats.totalVisitors),
      change: 15.2,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: '转化率',
      value: stats.conversionRate + '%',
      change: 2.1,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">工作台</h1>
          <p className="text-secondary-500 mt-1">欢迎回来，查看您的电商数据概览</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>近30天</option>
            <option>近7天</option>
            <option>近90天</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  card.change >= 0 ? 'text-primary-600' : 'text-red-500'
                }`}>
                  {card.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(card.change)}
                </span>
              </div>
              <div>
                <p className="text-secondary-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-secondary-800 mt-1">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">销售趋势</h2>
            <Link href="/analytics" className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700">
              查看详情
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
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
                  formatter={(value: number) => [formatCurrency(value), '销售额']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">分类销售占比</h2>
          </div>
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
              {categoryData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">热销产品排行</h2>
            <Link href="/product-research" className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:text-primary-700">
              查看更多
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-secondary-800">{product.name}</p>
                    <p className="text-sm text-secondary-500">{formatCurrency(product.sales)} 销售额</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  product.growth >= 0 ? 'text-primary-600' : 'text-red-500'
                }`}>
                  {product.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(product.growth)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">订单趋势</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="orders" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
