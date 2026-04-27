'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Bookmark,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  User,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { formatNumber, formatPercent } from '@/lib/utils';
import { 
  getInfluencers, 
  getDataStatus,
  Influencer,
  InfluencerStats,
  subscribeToDataChanges,
  normalizeInfluencer
} from '@/lib/data';

const mockInfluencers: Influencer[] = [
  { 
    id: 1, 
    name: '美妆达人小美', 
    avatar_url: 'https://picsum.photos/100/100?random=1',
    followers: 1500000, 
    following: 200,
    posts_count: 520,
    likes_count: 25000000,
    collects_count: 8000000,
    comments_count: 1200000,
    engagement_rate: 8.5,
    categories: ['美妆', '护肤', '时尚'],
    platform: 'xiaohongshu',
    avg_likes_per_post: 48077,
    avg_comments_per_post: 2308,
    avg_collects_per_post: 15385,
    trend: 'up' as const
  },
  { 
    id: 2, 
    name: '家居博主小窝', 
    avatar_url: 'https://picsum.photos/100/100?random=2',
    followers: 850000, 
    following: 350,
    posts_count: 380,
    likes_count: 12000000,
    collects_count: 5000000,
    comments_count: 600000,
    engagement_rate: 7.2,
    categories: ['家居', '生活方式', '收纳'],
    platform: 'xiaohongshu',
    avg_likes_per_post: 31579,
    avg_comments_per_post: 1579,
    avg_collects_per_post: 13158,
    trend: 'up' as const
  },
  { 
    id: 3, 
    name: '时尚博主Luna', 
    avatar_url: 'https://picsum.photos/100/100?random=3',
    followers: 1200000, 
    following: 280,
    posts_count: 450,
    likes_count: 18000000,
    collects_count: 6500000,
    comments_count: 900000,
    engagement_rate: 9.1,
    categories: ['时尚', '穿搭', '配饰'],
    platform: 'xiaohongshu',
    avg_likes_per_post: 40000,
    avg_comments_per_post: 2000,
    avg_collects_per_post: 14444,
    trend: 'down' as const
  },
  { 
    id: 4, 
    name: '美食博主小厨', 
    avatar_url: 'https://picsum.photos/100/100?random=4',
    followers: 650000, 
    following: 420,
    posts_count: 320,
    likes_count: 9500000,
    collects_count: 4200000,
    comments_count: 520000,
    engagement_rate: 6.8,
    categories: ['美食', '探店', '食谱'],
    platform: 'xiaohongshu',
    avg_likes_per_post: 29688,
    avg_comments_per_post: 1625,
    avg_collects_per_post: 13125,
    trend: 'up' as const
  },
  { 
    id: 5, 
    name: '旅行博主阿远', 
    avatar_url: 'https://picsum.photos/100/100?random=5',
    followers: 980000, 
    following: 550,
    posts_count: 280,
    likes_count: 14500000,
    collects_count: 5800000,
    comments_count: 750000,
    engagement_rate: 7.5,
    categories: ['旅行', '攻略', '摄影'],
    platform: 'xiaohongshu',
    avg_likes_per_post: 51786,
    avg_comments_per_post: 2679,
    avg_collects_per_post: 20714,
    trend: 'up' as const
  },
];

const mockCategoryDistribution = [
  { name: '美妆护肤', value: 150 },
  { name: '家居生活', value: 120 },
  { name: '时尚穿搭', value: 95 },
  { name: '美食探店', value: 80 },
  { name: '旅行攻略', value: 65 },
  { name: '科技数码', value: 45 },
];

const mockFollowerDistribution = [
  { name: '1万以下', value: 200 },
  { name: '1万-10万', value: 180 },
  { name: '10万-50万', value: 120 },
  { name: '50万-100万', value: 60 },
  { name: '100万以上', value: 35 },
];

const COLORS = ['#ff2442', '#ff6b6b', '#ff8787', '#ffa8a8', '#ffc9c9', '#ffd8d8'];

const mockMonthlyEngagement = [
  { month: '1月', likes: 25000000, comments: 1200000, collects: 8000000 },
  { month: '2月', likes: 28000000, comments: 1350000, collects: 9200000 },
  { month: '3月', likes: 32000000, comments: 1500000, collects: 10500000 },
  { month: '4月', likes: 35000000, comments: 1680000, collects: 11800000 },
  { month: '5月', likes: 38000000, comments: 1850000, collects: 12500000 },
  { month: '6月', likes: 42000000, comments: 2000000, collects: 14000000 },
];

const defaultCategories = [
  { value: 'all', label: '全部分类' },
  { value: '美妆', label: '美妆护肤' },
  { value: '时尚', label: '时尚穿搭' },
  { value: '家居', label: '家居生活' },
  { value: '美食', label: '美食探店' },
  { value: '旅行', label: '旅行攻略' },
];

export default function InfluencerAnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>(mockInfluencers);
  const [stats, setStats] = useState<InfluencerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await getDataStatus();
      const hasData = status.has_influencers;
      setHasImportedData(hasData);

      if (hasData) {
        const response = await getInfluencers();
        if (response.success && response.data.length > 0) {
          const normalizedData = response.data.map(normalizeInfluencer);
          setInfluencers(normalizedData);
          setStats(response.stats || null);
        }
      } else {
        setInfluencers(mockInfluencers);
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      setInfluencers(mockInfluencers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToDataChanges('influencers', fetchData);
    return unsubscribe;
  }, [fetchData]);

  const categories = [
    { value: 'all', label: '全部分类' },
    ...Array.from(new Set(influencers.flatMap(inf => inf.categories))).filter(c => c).map(c => ({ value: c, label: c })),
  ];

  const categoryDistribution = stats?.categories && Object.keys(stats.categories).length > 0
    ? Object.entries(stats.categories).map(([name, value]) => ({ name, value }))
    : mockCategoryDistribution;

  const followerDistribution = stats?.follower_ranges && Object.keys(stats.follower_ranges).length > 0
    ? Object.entries(stats.follower_ranges).map(([name, value]) => ({ name, value }))
    : mockFollowerDistribution;

  const filteredInfluencers = influencers.filter(inf => {
    const matchesSearch = inf.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || inf.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const selectedInf = influencers.find(inf => inf.id === selectedInfluencer);

  const totalFollowers = stats?.total_followers ?? influencers.reduce((sum, inf) => sum + inf.followers, 0);
  const totalLikes = stats?.total_likes ?? influencers.reduce((sum, inf) => sum + inf.likes_count, 0);
  const totalComments = stats?.total_comments ?? influencers.reduce((sum, inf) => sum + inf.comments_count, 0);
  const avgEngagement = stats?.avg_engagement_rate ?? 
    (influencers.length > 0 ? influencers.reduce((sum, inf) => sum + inf.engagement_rate, 0) / influencers.length : 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">小红书达人数据分析</h1>
          <p className="text-secondary-500 mt-1">深入分析达人数据，发现优质合作机会</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImportedData && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Database className="w-4 h-4" />
              <span>已导入 {influencers.length} 条数据</span>
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
            <p className="text-sm text-amber-600 mt-1">点击右上角"导入数据"按钮，上传您的小红书达人数据文件</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-red-50">
              <Users className="w-5 h-5 text-red-500" />
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />}
          </div>
          <div>
            <p className="text-secondary-500 text-xs">总粉丝数</p>
            <p className="text-xl font-bold text-secondary-800 mt-1">{formatNumber(totalFollowers)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-pink-50">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
          </div>
          <div>
            <p className="text-secondary-500 text-xs">总获赞数</p>
            <p className="text-xl font-bold text-secondary-800 mt-1">{formatNumber(totalLikes)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-orange-50">
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <p className="text-secondary-500 text-xs">总评论数</p>
            <p className="text-xl font-bold text-secondary-800 mt-1">{formatNumber(totalComments)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div>
            <p className="text-secondary-500 text-xs">平均互动率</p>
            <p className="text-xl font-bold text-secondary-800 mt-1">{avgEngagement.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">互动趋势分析</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-secondary-600">获赞</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-secondary-600">评论</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-secondary-600">收藏</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMonthlyEngagement}>
                <defs>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2442" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ff2442" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v/10000}万`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [formatNumber(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#ff2442" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLikes)"
                  name="获赞"
                />
                <Area 
                  type="monotone" 
                  dataKey="collects" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComments)"
                  name="收藏"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="comments" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  name="评论"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">分类分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatNumber(value), '达人数']}
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
          <div className="space-y-2 mt-4">
            {categoryDistribution.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-secondary-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-secondary-800">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">粉丝量级分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={followerDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#ff2442" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">
              达人列表
              {hasImportedData && <span className="ml-2 text-sm font-normal text-secondary-500">({influencers.length} 个达人)</span>}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="搜索达人..."
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
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
              <p className="text-secondary-500">没有找到匹配的达人</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredInfluencers.map((inf) => {
                const normalized = normalizeInfluencer(inf);
                const avatar = normalized.avatar_url || `https://picsum.photos/100/100?random=${inf.id}`;
                const trend = normalized.trend || (normalized.engagement_rate > 7 ? 'up' : 'stable');
                
                return (
                  <div 
                    key={inf.id} 
                    onClick={() => setSelectedInfluencer(inf.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedInfluencer === inf.id 
                        ? 'border-primary-200 bg-primary-50' 
                        : 'border-secondary-100 hover:bg-secondary-50'
                    }`}
                  >
                    <img 
                      src={avatar} 
                      alt={inf.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-secondary-800 truncate">{inf.name}</h3>
                        {trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4 text-primary-500" />
                        ) : trend === 'down' ? (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {inf.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-secondary-800">{formatNumber(normalized.followers)}</p>
                      <p className="text-xs text-secondary-500">粉丝</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-500">{normalized.engagement_rate}%</p>
                      <p className="text-xs text-secondary-500">互动率</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-secondary-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedInf && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-800">达人详情 - {selectedInf.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="text-center p-4 bg-secondary-50 rounded-xl">
              <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary-800">{formatNumber(selectedInf.followers)}</p>
              <p className="text-sm text-secondary-500">粉丝数</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary-800">{formatNumber(selectedInf.likes_count ?? selectedInf.likesCount ?? 0)}</p>
              <p className="text-sm text-secondary-500">获赞数</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary-800">{formatNumber(selectedInf.comments_count ?? selectedInf.commentsCount ?? 0)}</p>
              <p className="text-sm text-secondary-500">评论数</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Bookmark className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary-800">{formatNumber(selectedInf.collects_count ?? selectedInf.collectsCount ?? 0)}</p>
              <p className="text-sm text-secondary-500">收藏数</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary-800">{selectedInf.engagement_rate ?? selectedInf.engagementRate ?? 0}%</p>
              <p className="text-sm text-secondary-500">互动率</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold text-secondary-800 mb-4">平均数据/笔记</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-600">平均获赞数</span>
                  <span className="font-medium text-secondary-800">
                    {formatNumber(selectedInf.avg_likes_per_post ?? selectedInf.avgLikesPerPost ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-600">平均评论数</span>
                  <span className="font-medium text-secondary-800">
                    {formatNumber(selectedInf.avg_comments_per_post ?? selectedInf.avgCommentsPerPost ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-600">平均收藏数</span>
                  <span className="font-medium text-secondary-800">
                    {formatNumber(selectedInf.avg_collects_per_post ?? selectedInf.avgCollectsPerPost ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <span className="text-secondary-600">笔记总数</span>
                  <span className="font-medium text-secondary-800">
                    {formatNumber(selectedInf.posts_count ?? selectedInf.postsCount ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-secondary-800 mb-4">最近笔记</h3>
              <div className="space-y-3">
                {selectedInf.recent_posts && selectedInf.recent_posts.length > 0 ? (
                  selectedInf.recent_posts.map((post, idx) => (
                    <div key={idx} className="p-3 bg-secondary-50 rounded-lg">
                      <p className="font-medium text-secondary-800 text-sm line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-secondary-500">
                          <Heart className="w-3 h-3" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-secondary-500">
                          <MessageSquare className="w-3 h-3" />
                          {formatNumber(post.comments)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-secondary-500">
                          <Bookmark className="w-3 h-3" />
                          {formatNumber(post.collects)}
                        </span>
                        <span className="text-xs text-secondary-400 ml-auto">
                          {post.publish_date ?? post.publishDate}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-400">
                    <p>暂无笔记数据</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
