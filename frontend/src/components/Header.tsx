'use client';

import { useState } from 'react';
import { Upload, User, Bell, Menu } from 'lucide-react';
import FileUploadModal from './FileUploadModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState<'products' | 'influencers'>('products');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const openUploadModal = (type: 'products' | 'influencers') => {
    setCurrentUploadType(type);
    setUploadModalOpen(true);
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-secondary-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-secondary-800">SellWise</h1>
            <p className="text-xs text-secondary-500 hidden sm:block">电商工作台</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">导入数据</span>
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-secondary-100">
                    <p className="text-xs font-medium text-secondary-400 uppercase">选择数据类型</p>
                  </div>
                  <button
                    onClick={() => openUploadModal('products')}
                    className="w-full px-4 py-3 text-left hover:bg-secondary-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-800">电商数据</p>
                      <p className="text-xs text-secondary-500">CSV / XLS / XLSX</p>
                    </div>
                  </button>
                  <button
                    onClick={() => openUploadModal('influencers')}
                    className="w-full px-4 py-3 text-left hover:bg-secondary-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 bg-accent-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-800">小红书达人数据</p>
                      <p className="text-xs text-secondary-500">CSV / XLS / XLSX</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-secondary-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors">
            <User className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </header>

      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        uploadType={currentUploadType}
      />
    </>
  );
}
