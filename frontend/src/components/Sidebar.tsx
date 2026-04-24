'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    path: '/',
    label: '商品运营数据分析',
    icon: BarChart3,
  },
  {
    path: '/product-research',
    label: '电商选题',
    icon: Search,
  },
  {
    path: '/influencer-analytics',
    label: '小红书达人',
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-secondary-200 flex flex-col">
      <div className="p-6 border-b border-secondary-200">
        <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-xl font-bold text-secondary-800">SellWise</span>
      </Link>
    </div>

    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || 
          (item.path !== '/' && pathname.startsWith(item.path));
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'nav-item',
              isActive ? 'nav-item-active' : 'nav-item-inactive'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>

    <div className="p-4 border-t border-secondary-200">
      <Link
        href="/settings"
        className="nav-item nav-item-inactive"
      >
        <Settings className="w-5 h-5" />
        <span>设置</span>
      </Link>
    </div>
  </aside>
  );
}
